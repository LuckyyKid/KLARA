import type { AnswerFormValue } from "./schema";
import type { FuelLevel, InspectionType, VehicleChangeReason } from "./types";

export const DRAFT_STORAGE_KEY = "klara.inspection.draft.v1";
export const DRAFT_VERSION = 1;

export type InspectionDraft = {
  version: number;
  startedAt: string;
  supervisorId: string;
  step: number;
  type: InspectionType;
  changeReason?: VehicleChangeReason;
  changeReasonComment?: string;
  vehicleId: string;
  mileage: string;
  fuelLevel: FuelLevel;
  mileageWarningComment?: string;
  answers: Record<string, AnswerFormValue>;
};

export function loadDraft(supervisorId: string): InspectionDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InspectionDraft>;
    if (parsed.version !== DRAFT_VERSION) return null;
    if (parsed.supervisorId !== supervisorId) return null;
    if (!parsed.startedAt || !parsed.answers) return null;
    return parsed as InspectionDraft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: InspectionDraft): void {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Le brouillon est un confort de démo : une écriture impossible ne bloque rien.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Idem.
  }
}