// Klara — données de démonstration figées, conformes à §16 du document de référence.
// Scénario : dimanche 26 juillet 2026, ~16h20, quart du soir en cours à l'emplacement YUL.

export type Role = "supervisor" | "manager" | "admin";
export type ShiftType = "morning" | "evening" | "night";
export type AssignmentStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "late"
  | "missed"
  | "excused"
  | "cancelled";
export type VehicleState =
  | "conforme"
  | "mineure"
  | "importante"
  | "critique"
  | "hors_service"
  | "inconnu";

export const NOW_LABEL = "Dimanche 26 juillet 2026 · 16 h 20 · quart du soir";

export const SHIFTS: Record<ShiftType, { label: string; start: string; due: string; end: string }> = {
  morning: { label: "Quart du matin", start: "7 h", due: "8 h", end: "15 h" },
  evening: { label: "Quart du soir", start: "15 h", due: "16 h", end: "23 h" },
  night: { label: "Quart de nuit", start: "23 h", due: "minuit", end: "7 h" },
};

export const STATUS_LABEL: Record<AssignmentStatus, string> = {
  pending: "En attente",
  in_progress: "En cours",
  submitted: "Complétée",
  late: "En retard",
  missed: "Manquée",
  excused: "Excusée",
  cancelled: "Annulée",
};

export const STATE_LABEL: Record<VehicleState, string> = {
  conforme: "Conforme",
  mineure: "Anomalie mineure",
  importante: "Anomalie importante",
  critique: "Critique",
  hors_service: "Hors service",
  inconnu: "État inconnu",
};

export interface Vehicle {
  id: string;
  number: string;
  make: string;
  model: string;
  color: string;
  year: number;
  plate: string;
  mileage: number;
  state: VehicleState;
  location: string;
  openAnomaly?: string;
  outOfServiceReason?: string;
  lastInspectionAt?: string;
}

export const VEHICLES: Vehicle[] = [
  { id: "v1", number: "2001", make: "Toyota", model: "RAV4", color: "Blanc", year: 2024, plate: "ABC 123", mileage: 32_451, state: "conforme", location: "YUL" },
  { id: "v2", number: "2002", make: "Hyundai", model: "Tucson", color: "Gris", year: 2023, plate: "DEF 456", mileage: 41_208, state: "conforme", location: "YUL" },
  { id: "v3", number: "2003", make: "Kia", model: "Sportage", color: "Noir", year: 2024, plate: "GHI 789", mileage: 28_943, state: "mineure", location: "YUL", openAnomaly: "Égratignure porte arrière gauche" },
  { id: "v4", number: "2004", make: "Ford", model: "Escape", color: "Bleu foncé", year: 2022, plate: "JKL 321", mileage: 53_104, state: "importante", location: "YUL", openAnomaly: "Dommage pare-chocs avant droit" },
  { id: "v5", number: "2005", make: "Chevrolet", model: "Equinox", color: "Blanc", year: 2023, plate: "MNO 654", mileage: 36_782, state: "conforme", location: "YUL" },
];

export interface Assignment {
  id: string;
  vehicleNumber: string;
  shift: ShiftType;
  status: AssignmentStatus;
  submittedAt?: string;   // ex "15 h 12"
  progress?: number;      // for in_progress
  lateMinutes?: number;   // for late
  supervisor: string;
  mileage?: number;
}

// Scénario §16.2 : quart du soir en cours (matin fini, soir partiel, nuit à venir).
export const ASSIGNMENTS: Assignment[] = [
  // Matin
  { id: "a-2001-m", vehicleNumber: "2001", shift: "morning", status: "submitted", submittedAt: "7 h 08", supervisor: "Amina Diallo", mileage: 32_418 },
  { id: "a-2002-m", vehicleNumber: "2002", shift: "morning", status: "submitted", submittedAt: "7 h 11", supervisor: "Amina Diallo", mileage: 41_180 },
  { id: "a-2003-m", vehicleNumber: "2003", shift: "morning", status: "submitted", submittedAt: "7 h 04", supervisor: "Amina Diallo", mileage: 28_912 },
  { id: "a-2004-m", vehicleNumber: "2004", shift: "morning", status: "submitted", submittedAt: "7 h 21", supervisor: "Amina Diallo", mileage: 53_071 },
  { id: "a-2005-m", vehicleNumber: "2005", shift: "morning", status: "submitted", submittedAt: "7 h 16", supervisor: "Amina Diallo", mileage: 36_749 },
  // Soir
  { id: "a-2001-s", vehicleNumber: "2001", shift: "evening", status: "submitted", submittedAt: "15 h 12", supervisor: "Joseph Tremblay", mileage: 32_451 },
  { id: "a-2002-s", vehicleNumber: "2002", shift: "evening", status: "submitted", submittedAt: "15 h 18", supervisor: "Joseph Tremblay", mileage: 41_208 },
  { id: "a-2003-s", vehicleNumber: "2003", shift: "evening", status: "submitted", submittedAt: "15 h 27", supervisor: "Joseph Tremblay", mileage: 28_943 },
  { id: "a-2004-s", vehicleNumber: "2004", shift: "evening", status: "in_progress", progress: 62, supervisor: "Joseph Tremblay" },
  { id: "a-2005-s", vehicleNumber: "2005", shift: "evening", status: "late", lateMinutes: 20, supervisor: "Joseph Tremblay" },
  // Nuit
  { id: "a-2001-n", vehicleNumber: "2001", shift: "night", status: "pending", supervisor: "Karim Belkacem" },
  { id: "a-2002-n", vehicleNumber: "2002", shift: "night", status: "pending", supervisor: "Karim Belkacem" },
  { id: "a-2003-n", vehicleNumber: "2003", shift: "night", status: "pending", supervisor: "Karim Belkacem" },
  { id: "a-2004-n", vehicleNumber: "2004", shift: "night", status: "pending", supervisor: "Karim Belkacem" },
  { id: "a-2005-n", vehicleNumber: "2005", shift: "night", status: "pending", supervisor: "Karim Belkacem" },
];

export interface AnomalyHistoryEntry {
  at: string;
  by: string;
  inspectionId?: string;
  note: string;
}

export interface Anomaly {
  id: string;
  vehicleNumber: string;
  title: string;
  area: string;
  severity: "mineure" | "moderee" | "importante" | "critique";
  impact: "usable" | "usable_caution" | "unusable";
  priority: "basse" | "moyenne" | "haute" | "urgente";
  status: "open" | "confirmed" | "in_progress" | "resolved" | "rejected";
  reportedBy: string;
  reportedAt: string; // "21 juil."
  description?: string;
  inspectionId?: string;
  category?: string;
  source?: "inspection" | "manual";
  photos?: string[];
  reportedByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  history?: AnomalyHistoryEntry[];
}

export const ANOMALIES: Anomaly[] = [
  {
    id: "an-1",
    vehicleNumber: "2004",
    title: "Dommage pare-chocs avant droit",
    area: "Carrosserie",
    severity: "importante",
    impact: "usable_caution",
    priority: "haute",
    status: "confirmed",
    reportedBy: "Amina Diallo",
    reportedAt: "21 juil.",
    category: "body_condition",
    source: "manual",
  },
  {
    id: "an-2",
    vehicleNumber: "2003",
    title: "Égratignure porte arrière gauche",
    area: "Carrosserie",
    severity: "mineure",
    impact: "usable",
    priority: "basse",
    status: "open",
    reportedBy: "Joseph Tremblay",
    reportedAt: "24 juil.",
    category: "body_condition",
    source: "manual",
  },
];

export interface AppNotification {
  id: string;
  kind: "inspection" | "anomaly" | "system";
  title: string;
  time: string;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "inspection", title: "L'inspection du véhicule 2005 est en retard de 20 minutes.", time: "16 h 20", read: false },
  { id: "n2", kind: "inspection", title: "Ford Escape 2004 — inspection du soir en cours (62 %).", time: "16 h 05", read: false },
  { id: "n3", kind: "anomaly", title: "Anomalie mineure signalée sur le véhicule 2003.", time: "24 juil.", read: true },
  { id: "n4", kind: "system", title: "Les 5 inspections du quart du matin ont été complétées.", time: "8 h 02", read: true },
];

// KPI §16.3 — dérivés directement des assignments du jour.
export function todayKpis() {
  const today = ASSIGNMENTS;
  return {
    activeVehicles: VEHICLES.length,
    expected: today.length, // 15
    completed: today.filter((a) => a.status === "submitted").length,
    inProgress: today.filter((a) => a.status === "in_progress").length,
    late: today.filter((a) => a.status === "late").length,
    pending: today.filter((a) => a.status === "pending").length,
    openAnomalies: ANOMALIES.filter((a) => a.status !== "resolved" && a.status !== "rejected").length,
  };
}

// Historique du taux de complétion (30 jours) — barres légèrement variables, réalistes.
export const COMPLETION_30D = [
  98, 100, 95, 100, 100, 92, 100, 100, 88, 100, 100, 96, 100, 100, 100,
  93, 100, 100, 100, 76, 100, 100, 100, 100, 88, 100, 100, 100, 96, 94,
];

export const ANOMALIES_8W = [3, 1, 2, 4, 1, 0, 3, 2];

export const MILEAGE_14D = [
  200_120, 200_580, 201_050, 201_610, 202_090, 202_580, 203_100,
  203_620, 204_180, 204_710, 205_320, 205_910, 206_540, 207_120,
];

export const EMPLOYEES = [
  { id: "u1", name: "Joseph Tremblay", role: "supervisor" as Role, shift: "Soir", email: "joseph.tremblay@precise.ca", lastActive: "16 h 08" },
  { id: "u2", name: "Amina Diallo",    role: "supervisor" as Role, shift: "Matin", email: "amina.diallo@precise.ca", lastActive: "8 h 02" },
  { id: "u3", name: "Karim Belkacem",  role: "supervisor" as Role, shift: "Nuit",  email: "karim.belkacem@precise.ca", lastActive: "hier 6 h 40" },
  { id: "u4", name: "Mahdi Ben Salah", role: "manager"    as Role, shift: "—",     email: "mahdi.bensalah@precise.ca", lastActive: "à l'instant" },
  { id: "u5", name: "Sophie Girard",   role: "admin"      as Role, shift: "—",     email: "sophie.girard@precise.ca", lastActive: "15 h 44" },
];