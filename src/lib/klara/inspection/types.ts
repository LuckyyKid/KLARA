// Klara — modèle de données du module Inspections.
// Conçu pour être transposé tel quel vers Supabase (voir README de migration).

export type InspectionType = "shift_start" | "vehicle_change";

export type FuelLevel = "empty" | "quarter" | "half" | "three_quarters" | "full";

export type InspectionAnswerStatus = "ok" | "defect";

export type AnomalySeverity = "minor" | "major" | "critical";

export type ComplianceStatus = "on_time" | "late" | "not_applicable";

export type ShiftTime = "07:00" | "15:00" | "23:00";

export type VehicleChangeReason =
  | "fuel"
  | "anomaly"
  | "operational"
  | "manager_request"
  | "other";

export type InspectionSectionId =
  | "interior"
  | "exterior"
  | "operation"
  | "equipment"
  | "conclusion";

export type InspectionAnswer = {
  questionId: string;
  questionLabel: string;
  section: InspectionSectionId;
  category: string;
  status: InspectionAnswerStatus;
  comment?: string;
  photos?: string[];
  followUpValues?: Record<string, string | string[]>;
};

export type Inspection = {
  id: string;
  type: InspectionType;
  vehicleId: string;
  vehicleNumber: string;
  supervisorId: string;
  supervisorName: string;
  shift?: ShiftTime;
  changeReason?: VehicleChangeReason;
  changeReasonComment?: string;
  mileage: number;
  mileageWarningComment?: string;
  fuelLevel: FuelLevel;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  complianceStatus: ComplianceStatus;
  answers: InspectionAnswer[];
  anomalyIds: string[];
  confirmationAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VehicleUsage = {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  supervisorId: string;
  shiftStartInspectionId: string;
  startedAt: string;
  endedAt?: string;
  endedByInspectionId?: string;
};

export const INSPECTION_TYPE_LABEL: Record<InspectionType, string> = {
  shift_start: "Début de quart",
  vehicle_change: "Changement de véhicule",
};

export const FUEL_LABEL: Record<FuelLevel, string> = {
  empty: "Vide",
  quarter: "¼",
  half: "½",
  three_quarters: "¾",
  full: "Plein",
};

export const FUEL_ORDER: FuelLevel[] = ["empty", "quarter", "half", "three_quarters", "full"];

export const COMPLIANCE_LABEL: Record<ComplianceStatus, string> = {
  on_time: "À l'heure",
  late: "En retard",
  not_applicable: "Non applicable",
};

export const CHANGE_REASON_LABEL: Record<VehicleChangeReason, string> = {
  fuel: "Manque de carburant",
  anomaly: "Anomalie constatée",
  operational: "Besoin opérationnel",
  manager_request: "Véhicule demandé par un gestionnaire",
  other: "Autre",
};

export const SECTION_LABEL: Record<InspectionSectionId, string> = {
  interior: "Intérieur",
  exterior: "Extérieur",
  operation: "Démarrage et fonctionnement",
  equipment: "Équipement",
  conclusion: "Conclusion",
};

export const SECTION_ORDER: InspectionSectionId[] = [
  "interior",
  "exterior",
  "operation",
  "equipment",
  "conclusion",
];