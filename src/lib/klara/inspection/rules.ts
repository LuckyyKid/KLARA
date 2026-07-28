import type { Anomaly } from "@/lib/klara/mock-data";
import { QUESTIONS_BY_ID, type InspectionQuestionConfig } from "./questions";
import type {
  AnomalySeverity,
  ComplianceStatus,
  InspectionAnswer,
  InspectionType,
  ShiftTime,
} from "./types";

/* -------- Durée -------- */

export function computeDurationSeconds(startedAt: string, submittedAt: string): number {
  return Math.max(
    0,
    Math.floor((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
}

/* -------- Conformité -------- */

export const SHIFT_TIMES: ShiftTime[] = ["07:00", "15:00", "23:00"];
export const COMPLIANCE_WINDOW_MINUTES = 30;

/** Quart attendu pour un moment donné (le plus récent déjà commencé). */
export function resolveShift(at: Date): ShiftTime {
  const minutes = at.getHours() * 60 + at.getMinutes();
  if (minutes >= 23 * 60 || minutes < 7 * 60) return "23:00";
  if (minutes >= 15 * 60) return "15:00";
  return "07:00";
}

export function computeCompliance(type: InspectionType, submittedAt: string): {
  shift?: ShiftTime;
  complianceStatus: ComplianceStatus;
} {
  if (type === "vehicle_change") return { complianceStatus: "not_applicable" };
  const at = new Date(submittedAt);
  const shift = resolveShift(at);
  const [h] = shift.split(":").map(Number);
  const start = new Date(at);
  start.setHours(h, 0, 0, 0);
  if (shift === "23:00" && at.getHours() < 7) start.setDate(start.getDate() - 1);
  const diffMinutes = (at.getTime() - start.getTime()) / 60000;
  return { shift, complianceStatus: diffMinutes <= COMPLIANCE_WINDOW_MINUTES ? "on_time" : "late" };
}

/* -------- Sévérité -------- */

const SEVERITY_TO_FR: Record<AnomalySeverity, Anomaly["severity"]> = {
  minor: "mineure",
  major: "importante",
  critical: "critique",
};

const SEVERITY_TO_PRIORITY: Record<AnomalySeverity, Anomaly["priority"]> = {
  minor: "basse",
  major: "haute",
  critical: "urgente",
};

export const SEVERITY_LABEL: Record<AnomalySeverity, string> = {
  minor: "Mineure",
  major: "Majeure",
  critical: "Critique",
};

/** Certaines réponses de suivi aggravent la sévérité (ex. pneu crevé). */
export function resolveSeverity(
  question: InspectionQuestionConfig,
  answer: InspectionAnswer,
): AnomalySeverity {
  const followUps = answer.followUpValues ?? {};
  if (question.category === "tires") {
    const problem = String(followUps.tire_problem ?? "");
    if (["Crevaison", "Pneu complètement dégonflé", "Coupure ou dommage"].includes(problem)) {
      return "critical";
    }
    if (problem === "Pression insuffisante") return "major";
  }
  return question.defaultSeverity;
}

export function isOutOfServiceAnswer(answer: InspectionAnswer): boolean {
  const question = QUESTIONS_BY_ID[answer.questionId];
  if (!question || answer.status !== "defect") return false;
  if (question.outOfServiceOnDefect) return true;
  return resolveSeverity(question, answer) === "critical";
}

export function outOfServiceReasonFor(answers: InspectionAnswer[]): string | undefined {
  const blocking = answers.filter(isOutOfServiceAnswer);
  if (blocking.length === 0) return undefined;
  return blocking
    .map((a) => QUESTIONS_BY_ID[a.questionId]?.anomalyTitle ?? a.category)
    .join(" · ");
}

/* -------- Anomalies -------- */

export function findDuplicateOpenAnomaly(
  anomalies: Anomaly[],
  vehicleNumber: string,
  category: string,
): Anomaly | undefined {
  return anomalies.find(
    (a) =>
      a.vehicleNumber === vehicleNumber &&
      a.category === category &&
      a.status !== "resolved" &&
      a.status !== "rejected",
  );
}

export type AnomalyDraft = Omit<Anomaly, "id">;

export function createAnomalyFromAnswer(params: {
  answer: InspectionAnswer;
  vehicleNumber: string;
  inspectionId: string;
  reportedByUserId: string;
  reportedByName: string;
  createdAt: string;
}): AnomalyDraft {
  const { answer, vehicleNumber, inspectionId, reportedByUserId, reportedByName, createdAt } = params;
  const question = QUESTIONS_BY_ID[answer.questionId];
  const severity = question ? resolveSeverity(question, answer) : "minor";
  const followUpText = Object.entries(answer.followUpValues ?? {})
    .map(([, value]) => (Array.isArray(value) ? value.join(", ") : value))
    .filter(Boolean)
    .join(" · ");

  return {
    vehicleNumber,
    title: question?.anomalyTitle ?? "Anomalie signalée",
    area: answer.category,
    category: answer.category,
    severity: SEVERITY_TO_FR[severity],
    impact: severity === "critical" ? "unusable" : severity === "major" ? "usable_caution" : "usable",
    priority: SEVERITY_TO_PRIORITY[severity],
    status: "open",
    reportedBy: reportedByName,
    reportedByUserId,
    reportedAt: new Date(createdAt).toLocaleDateString("fr-CA", { day: "2-digit", month: "short" }),
    description: [answer.comment, followUpText].filter(Boolean).join(" — "),
    inspectionId,
    source: "inspection",
    photos: answer.photos,
    createdAt,
    updatedAt: createdAt,
    history: [
      {
        at: createdAt,
        by: reportedByName,
        inspectionId,
        note: answer.comment ?? "Défaut constaté lors d'une inspection.",
      },
    ],
  };
}