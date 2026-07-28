import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  VEHICLES as SEED_VEHICLES,
  ANOMALIES as SEED_ANOMALIES,
  EMPLOYEES as SEED_EMPLOYEES,
  type Vehicle,
  type Anomaly,
} from "./mock-data";
import type { Role } from "./mock-data";
import type { Inspection, VehicleUsage } from "./inspection/types";
import {
  computeCompliance,
  computeDurationSeconds,
  createAnomalyFromAnswer,
  findDuplicateOpenAnomaly,
  outOfServiceReasonFor,
} from "./inspection/rules";

export type Employee = {
  id: string;
  name: string;
  role: Role;
  shift: string;
  email: string;
  lastActive: string;
};

export type InspectionSubmission = Omit<
  Inspection,
  "id" | "durationSeconds" | "complianceStatus" | "shift" | "anomalyIds" | "createdAt" | "updatedAt" | "submittedAt"
> & { submittedAt?: string };

interface StoreCtx {
  vehicles: Vehicle[];
  anomalies: Anomaly[];
  employees: Employee[];
  inspections: Inspection[];
  vehicleUsages: VehicleUsage[];
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  addAnomaly: (a: Omit<Anomaly, "id">) => void;
  updateAnomaly: (id: string, patch: Partial<Anomaly>) => void;
  removeAnomaly: (id: string) => void;
  addEmployee: (e: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  startInspection: () => string;
  submitInspection: (submission: InspectionSubmission) => Inspection;
  updateVehicleMileage: (vehicleId: string, mileage: number) => void;
  setVehicleOutOfService: (vehicleId: string, reason: string) => void;
  setVehicleInService: (vehicleId: string, note: string, by: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);
const STORAGE_KEY = "klara.demo.store.v3";
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(SEED_ANOMALIES);
  const [employees, setEmployees] = useState<Employee[]>(SEED_EMPLOYEES);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [vehicleUsages, setVehicleUsages] = useState<VehicleUsage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<{
            vehicles: Vehicle[];
            anomalies: Anomaly[];
            employees: Employee[];
            inspections: Inspection[];
            vehicleUsages: VehicleUsage[];
          }>;
          if (saved.vehicles) setVehicles(saved.vehicles);
          if (saved.anomalies) setAnomalies(saved.anomalies);
          if (saved.employees) setEmployees(saved.employees);
          if (saved.inspections) setInspections(saved.inspections);
          if (saved.vehicleUsages) setVehicleUsages(saved.vehicleUsages);
        }
      } catch {
        // seed data reste utilisé si stockage indispo
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ vehicles, anomalies, employees, inspections, vehicleUsages }),
    ).catch(() => {
      // stockage confort, pas critique
    });
  }, [hydrated, vehicles, anomalies, employees, inspections, vehicleUsages]);

  const addVehicle = useCallback((v: Omit<Vehicle, "id">) => setVehicles((s) => [...s, { ...v, id: uid("v") }]), []);
  const updateVehicle = useCallback((id: string, patch: Partial<Vehicle>) => setVehicles((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);
  const removeVehicle = useCallback((id: string) => setVehicles((s) => s.filter((x) => x.id !== id)), []);

  const addAnomaly = useCallback((a: Omit<Anomaly, "id">) => setAnomalies((s) => [...s, { ...a, id: uid("an") }]), []);
  const updateAnomaly = useCallback((id: string, patch: Partial<Anomaly>) => setAnomalies((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);
  const removeAnomaly = useCallback((id: string) => setAnomalies((s) => s.filter((x) => x.id !== id)), []);

  const addEmployee = useCallback((e: Omit<Employee, "id">) => setEmployees((s) => [...s, { ...e, id: uid("u") }]), []);
  const updateEmployee = useCallback((id: string, patch: Partial<Employee>) => setEmployees((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);
  const removeEmployee = useCallback((id: string) => setEmployees((s) => s.filter((x) => x.id !== id)), []);

  const updateVehicleMileage = useCallback((vehicleId: string, mileage: number) => {
    setVehicles((s) => s.map((v) => (v.id === vehicleId ? { ...v, mileage: Math.max(v.mileage, mileage) } : v)));
  }, []);

  const setVehicleOutOfService = useCallback((vehicleId: string, reason: string) => {
    setVehicles((s) => s.map((v) => (v.id === vehicleId ? { ...v, state: "hors_service", outOfServiceReason: reason } : v)));
  }, []);

  const setVehicleInService = useCallback((vehicleId: string, note: string, by: string) => {
    setVehicles((s) =>
      s.map((v) => (v.id === vehicleId ? { ...v, state: "conforme", outOfServiceReason: undefined } : v)),
    );
    const at = new Date().toISOString();
    setAnomalies((s) =>
      s.map((a) =>
        a.vehicleNumber === vehicles.find((v) => v.id === vehicleId)?.number && a.status !== "resolved"
          ? {
              ...a,
              status: "resolved",
              resolvedAt: at,
              resolvedBy: by,
              updatedAt: at,
              history: [...(a.history ?? []), { at, by, note }],
            }
          : a,
      ),
    );
  }, [vehicles]);

  const startInspection = useCallback(() => new Date().toISOString(), []);

  const submitInspection = useCallback((submission: InspectionSubmission) => {
    const submittedAt = submission.submittedAt ?? new Date().toISOString();
    const inspectionId = uid("insp");
    const { shift, complianceStatus } = computeCompliance(submission.type, submittedAt);

    const nextAnomalies = [...anomalies];
    const anomalyIds: string[] = [];
    for (const answer of submission.answers) {
      if (answer.status !== "defect") continue;
      const duplicate = findDuplicateOpenAnomaly(nextAnomalies, submission.vehicleNumber, answer.category);
      if (duplicate) {
        const index = nextAnomalies.indexOf(duplicate);
        nextAnomalies[index] = {
          ...duplicate,
          updatedAt: submittedAt,
          photos: [...(duplicate.photos ?? []), ...(answer.photos ?? [])],
          history: [
            ...(duplicate.history ?? []),
            {
              at: submittedAt,
              by: submission.supervisorName,
              inspectionId,
              note: `Toujours présent lors d'une nouvelle inspection. ${answer.comment ?? ""}`.trim(),
            },
          ],
        };
        anomalyIds.push(duplicate.id);
        continue;
      }
      const created: Anomaly = {
        ...createAnomalyFromAnswer({
          answer,
          vehicleNumber: submission.vehicleNumber,
          inspectionId,
          reportedByUserId: submission.supervisorId,
          reportedByName: submission.supervisorName,
          createdAt: submittedAt,
        }),
        id: uid("an"),
      };
      nextAnomalies.unshift(created);
      anomalyIds.push(created.id);
    }
    setAnomalies(nextAnomalies);

    const inspection: Inspection = {
      ...submission,
      id: inspectionId,
      submittedAt,
      shift,
      complianceStatus,
      durationSeconds: computeDurationSeconds(submission.startedAt, submittedAt),
      anomalyIds,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    };
    setInspections((s) => [inspection, ...s]);

    const reason = outOfServiceReasonFor(submission.answers);
    setVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== submission.vehicleId) return vehicle;
        return {
          ...vehicle,
          mileage: Math.max(vehicle.mileage, submission.mileage),
          lastInspectionAt: submittedAt,
          state: reason ? "hors_service" : vehicle.state,
          outOfServiceReason: reason ?? vehicle.outOfServiceReason,
        };
      }),
    );

    setVehicleUsages((current) => {
      const closed = current.map((usage) =>
        usage.supervisorId === submission.supervisorId && !usage.endedAt
          ? { ...usage, endedAt: submittedAt, endedByInspectionId: inspectionId }
          : usage,
      );
      return [
        {
          id: uid("use"),
          vehicleId: submission.vehicleId,
          vehicleNumber: submission.vehicleNumber,
          supervisorId: submission.supervisorId,
          shiftStartInspectionId: inspectionId,
          startedAt: submittedAt,
        },
        ...closed,
      ];
    });

    return inspection;
  }, [anomalies]);

  const value = useMemo<StoreCtx>(() => ({
    vehicles, anomalies, employees, inspections, vehicleUsages,
    addVehicle, updateVehicle, removeVehicle,
    addAnomaly, updateAnomaly, removeAnomaly,
    addEmployee, updateEmployee, removeEmployee,
    startInspection, submitInspection,
    updateVehicleMileage, setVehicleOutOfService, setVehicleInService,
  }), [vehicles, anomalies, employees, inspections, vehicleUsages, addVehicle, updateVehicle, removeVehicle, addAnomaly, updateAnomaly, removeAnomaly, addEmployee, updateEmployee, removeEmployee, startInspection, submitInspection, updateVehicleMileage, setVehicleOutOfService, setVehicleInService]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
