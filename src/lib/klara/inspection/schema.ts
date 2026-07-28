import { z } from "zod";
import { INSPECTION_QUESTIONS, QUESTIONS_BY_ID } from "./questions";

export const answerSchema = z.object({
  status: z.enum(["ok", "defect"]).nullable(),
  comment: z.string().default(""),
  photos: z.array(z.string()).default([]),
  followUpValues: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
});

export type AnswerFormValue = z.infer<typeof answerSchema>;

export const typeStepSchema = z
  .object({
    type: z.enum(["shift_start", "vehicle_change"]),
    changeReason: z
      .enum(["fuel", "anomaly", "operational", "manager_request", "other"])
      .optional(),
    changeReasonComment: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "vehicle_change" && !value.changeReason) {
      ctx.addIssue({ code: "custom", path: ["changeReason"], message: "Indiquez le motif du changement de véhicule." });
    }
    if (value.changeReason === "other" && !value.changeReasonComment?.trim()) {
      ctx.addIssue({ code: "custom", path: ["changeReasonComment"], message: "Précisez le motif." });
    }
  });

export const vehicleStepSchema = z.object({
  vehicleId: z.string().min(1, "Choisissez un véhicule."),
});

export const generalStepSchema = z.object({
  mileage: z
    .number({ message: "Entrez le kilométrage actuel." })
    .int("Le kilométrage doit être un nombre entier.")
    .min(0, "Le kilométrage doit être positif."),
  fuelLevel: z.enum(["empty", "quarter", "half", "three_quarters", "full"]),
  mileageWarningComment: z.string().optional(),
});

/** Validation d'une réponse : commentaire obligatoire et sous-questions requises sur Défaut. */
export function validateAnswer(questionId: string, value: AnswerFormValue): string | null {
  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return null;
  if (value.status === null) return "Répondez à cette question.";
  if (value.status === "ok") return null;
  if (question.commentRequiredOnDefect && !value.comment.trim()) {
    return "Un commentaire est obligatoire lorsqu'un défaut est constaté.";
  }
  for (const followUp of question.followUpOptions ?? []) {
    if (!followUp.required) continue;
    const current = value.followUpValues[followUp.id];
    const filled = Array.isArray(current) ? current.length > 0 : Boolean(current);
    if (!filled) return `Répondez à « ${followUp.label} ».`;
  }
  return null;
}

export function validateAllAnswers(answers: Record<string, AnswerFormValue>) {
  const errors: Record<string, string> = {};
  for (const question of INSPECTION_QUESTIONS) {
    const value = answers[question.id];
    const error = value
      ? validateAnswer(question.id, value)
      : "Répondez à cette question.";
    if (error) errors[question.id] = error;
  }
  return errors;
}