import {
  COMPLIANCE_LABEL,
  FUEL_LABEL,
  INSPECTION_TYPE_LABEL,
  type ComplianceStatus,
  type FuelLevel,
  type InspectionType,
} from "./types";

/** 42 s / 3 min 18 s */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe < 60) return `${safe} s`;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-CA", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatMileage(km: number): string {
  return `${km.toLocaleString("fr-CA")} km`;
}

export const fuelLabel = (f: FuelLevel) => FUEL_LABEL[f];
export const typeLabel = (t: InspectionType) => INSPECTION_TYPE_LABEL[t];
export const complianceLabel = (c: ComplianceStatus) => COMPLIANCE_LABEL[c];