export type InspectionType = "shift_start" | "vehicle_change";
export type InspectionResult = "ok" | "defect";

export type InspectionAnswer = {
  questionId: string;
  result: InspectionResult;
  comment?: string;
};

export type InspectionRecord = {
  id: string;
  type: InspectionType;
  vehicleNumber: string;
  supervisor: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  mileage: number;
  fuelLevel: "empty" | "quarter" | "half" | "three_quarters" | "full";
  answers: InspectionAnswer[];
  vehicleSafe: boolean;
  otherAnomaly: boolean;
  otherAnomalyComment?: string;
  generalComment?: string;
  confirmed: boolean;
};

export const INSPECTION_TYPE_LABEL: Record<InspectionType, string> = {
  shift_start: "Début de quart",
  vehicle_change: "Changement de véhicule",
};

export const FUEL_LABEL: Record<InspectionRecord["fuelLevel"], string> = {
  empty: "Vide",
  quarter: "¼",
  half: "½",
  three_quarters: "¾",
  full: "Plein",
};

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} s`;
  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}
