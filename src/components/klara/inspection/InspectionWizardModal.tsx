import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal as RNModal,
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  useWindowDimensions,
} from "react-native";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from "lucide-react-native";
import { colorScheme } from "nativewind";
import Toast from "react-native-toast-message";
import { Input, BtnGhost, BtnPrimary } from "../Modal";
import { InspectionPhotoInput } from "./InspectionPhotoInput";
import { useStore } from "@/lib/klara/store";
import { CURRENT_USER, useRole } from "@/lib/klara/role-context";
import { useTheme } from "@/lib/klara/theme";
import {
  INSPECTION_QUESTIONS,
  QUESTIONS_BY_ID,
  questionsForSection,
  type InspectionFollowUp,
  type InspectionQuestionConfig,
} from "@/lib/klara/inspection/questions";
import { outOfServiceReasonFor } from "@/lib/klara/inspection/rules";
import {
  typeStepSchema,
  vehicleStepSchema,
  generalStepSchema,
  validateAnswer,
  validateAllAnswers,
  type AnswerFormValue,
} from "@/lib/klara/inspection/schema";
import { formatDate, formatDateTime, formatMileage, typeLabel } from "@/lib/klara/inspection/formatters";
import {
  CHANGE_REASON_LABEL,
  FUEL_LABEL,
  FUEL_ORDER,
  type FuelLevel,
  type InspectionAnswer,
  type InspectionType,
  type VehicleChangeReason,
} from "@/lib/klara/inspection/types";
import { cn } from "@/lib/utils";

const VEHICLE_LETTERS = ["A", "B", "C", "D", "E"];
const STEP_LABELS = [
  "Type d'inspection",
  "Choix du véhicule",
  "Informations générales",
  "Inspection intérieure",
  "Inspection extérieure",
  "Démarrage et fonctionnement",
  "Équipements",
  "Résumé et confirmation",
] as const;

const STEP_SECTION: Record<number, "interior" | "exterior" | "operation" | "equipment" | "conclusion"> = {
  3: "interior",
  4: "exterior",
  5: "operation",
  6: "equipment",
  7: "conclusion",
};

const CHANGE_REASON_OPTIONS = (Object.entries(CHANGE_REASON_LABEL) as [VehicleChangeReason, string][]).map(
  ([key, label]) => ({ key, label }),
);

// Palette figée sur le thème sombre de l'app (rgb(var(--x)) en mode .dark) —
// cette modale reste toujours sombre, indépendamment du thème courant.
const INK = "rgb(236,236,232)";
const INK_MUTE = "rgb(122,125,119)";
const PRIMARY_FG = "rgb(23,25,29)";
const OK = "rgb(95,191,131)";
const DANGER = "rgb(229,121,109)";
const WARN = "rgb(227,180,95)";

function defaultAnswer(): AnswerFormValue {
  return { status: null, comment: "", photos: [], followUpValues: {} };
}

function stepForQuestion(questionId: string): number {
  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return 7;
  const entry = Object.entries(STEP_SECTION).find(([, section]) => section === question.section);
  return entry ? Number(entry[0]) : 7;
}

export function InspectionWizardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicles, anomalies, submitInspection } = useStore();
  const { role } = useRole();
  const { theme } = useTheme();
  const supervisorName = CURRENT_USER[role].name;
  const startedAtRef = useRef(Date.now());
  const { width: winW, height: winH } = useWindowDimensions();

  const [step, setStep] = useState(0);
  const [type, setType] = useState<InspectionType>("shift_start");
  const [changeReason, setChangeReason] = useState<VehicleChangeReason | undefined>(undefined);
  const [changeReasonComment, setChangeReasonComment] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [mileage, setMileage] = useState("");
  const [mileageWarningComment, setMileageWarningComment] = useState("");
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("half");
  const [answers, setAnswers] = useState<Record<string, AnswerFormValue>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedDefectId, setExpandedDefectId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    startedAtRef.current = Date.now();
    setStep(0);
    setType("shift_start");
    setChangeReason(undefined);
    setChangeReasonComment("");
    setVehicleId("");
    setMileage("");
    setMileageWarningComment("");
    setFuelLevel("half");
    setAnswers({});
    setGeneralComment("");
    setConfirmed(false);
    setSubmitting(false);
    setExpandedDefectId(null);
  }, [open]);

  // La modale garde toujours l'identité visuelle sombre, quel que soit le thème actif de l'app.
  useEffect(() => {
    if (!open) return;
    colorScheme.set("dark");
    return () => {
      colorScheme.set(theme);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const openAnomaliesFor = (vehicleNumber: string) =>
    anomalies.filter(
      (a) => a.vehicleNumber === vehicleNumber && a.status !== "resolved" && a.status !== "rejected",
    );

  const selectedVehicleAnomalies = useMemo(
    () => (selectedVehicle ? openAnomaliesFor(selectedVehicle.number) : []),
    [selectedVehicle, anomalies],
  );

  const getAnswer = (questionId: string): AnswerFormValue => answers[questionId] ?? defaultAnswer();

  const setAnswer = (questionId: string, patch: Partial<AnswerFormValue>) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: { ...(current[questionId] ?? defaultAnswer()), ...patch },
    }));
  };

  const setFollowUp = (questionId: string, followUpId: string, nextValue: string | string[]) => {
    setAnswers((current) => {
      const existing = current[questionId] ?? defaultAnswer();
      return {
        ...current,
        [questionId]: {
          ...existing,
          followUpValues: { ...existing.followUpValues, [followUpId]: nextValue },
        },
      };
    });
  };

  const okCount = useMemo(() => Object.values(answers).filter((a) => a.status === "ok").length, [answers]);
  const defectCount = useMemo(
    () => Object.values(answers).filter((a) => a.status === "defect").length,
    [answers],
  );

  const defectAnswers = useMemo(
    () =>
      Object.entries(answers)
        .filter(([, value]) => value.status === "defect")
        .map(([questionId, value]) => ({ questionId, question: QUESTIONS_BY_ID[questionId], value }))
        .filter(
          (entry): entry is { questionId: string; question: InspectionQuestionConfig; value: AnswerFormValue } =>
            !!entry.question,
        ),
    [answers],
  );

  const outOfServiceReason = useMemo(() => {
    const built: InspectionAnswer[] = INSPECTION_QUESTIONS.map((q) => {
      const a = getAnswer(q.id);
      return {
        questionId: q.id,
        questionLabel: q.label,
        section: q.section,
        category: q.category,
        status: a.status ?? "ok",
        followUpValues: a.followUpValues,
      };
    });
    return outOfServiceReasonFor(built);
  }, [answers]);

  const err = (msg: string) => Toast.show({ type: "error", text1: msg });

  const validateStep = (): boolean => {
    if (step === 0) {
      const result = typeStepSchema.safeParse({
        type,
        changeReason: type === "vehicle_change" ? changeReason : undefined,
        changeReasonComment: type === "vehicle_change" ? changeReasonComment : undefined,
      });
      if (!result.success) return err(result.error.issues[0]?.message ?? "Champ requis."), false;
      return true;
    }
    if (step === 1) {
      const result = vehicleStepSchema.safeParse({ vehicleId });
      if (!result.success) return err(result.error.issues[0]?.message ?? "Choisissez un véhicule."), false;
      if (selectedVehicle?.state === "hors_service") return err("Ce véhicule est hors service."), false;
      return true;
    }
    if (step === 2) {
      const trimmed = mileage.trim();
      if (!trimmed) return err("Entrez le kilométrage actuel."), false;
      const n = Number(trimmed);
      if (!Number.isFinite(n)) return err("Kilométrage invalide."), false;
      const result = generalStepSchema.safeParse({ mileage: n, fuelLevel });
      if (!result.success) return err(result.error.issues[0]?.message ?? "Vérifiez le kilométrage."), false;
      if (selectedVehicle && n < selectedVehicle.mileage && !mileageWarningComment.trim()) {
        return err("Justifiez le kilométrage inférieur au dernier relevé."), false;
      }
      return true;
    }
    const section = STEP_SECTION[step];
    if (section) {
      for (const question of questionsForSection(section)) {
        const error = validateAnswer(question.id, getAnswer(question.id));
        if (error) return err(error), false;
      }
      return true;
    }
    return true;
  };

  const goToStep = (i: number) => setStep(Math.max(0, Math.min(STEP_LABELS.length - 1, i)));

  const next = () => {
    if (!validateStep()) return;
    goToStep(step + 1);
  };

  const submit = () => {
    if (submitting) return;

    const typeResult = typeStepSchema.safeParse({
      type,
      changeReason: type === "vehicle_change" ? changeReason : undefined,
      changeReasonComment: type === "vehicle_change" ? changeReasonComment : undefined,
    });
    if (!typeResult.success) {
      goToStep(0);
      return err(typeResult.error.issues[0]?.message ?? "Vérifiez le type d'inspection.");
    }
    if (!vehicleId || !selectedVehicle) {
      goToStep(1);
      return err("Choisissez un véhicule.");
    }
    if (selectedVehicle.state === "hors_service") {
      goToStep(1);
      return err("Ce véhicule est hors service.");
    }
    const trimmedMileage = mileage.trim();
    const n = Number(trimmedMileage);
    if (!trimmedMileage || !Number.isFinite(n)) {
      goToStep(2);
      return err("Entrez le kilométrage actuel.");
    }
    const generalResult = generalStepSchema.safeParse({ mileage: n, fuelLevel });
    if (!generalResult.success) {
      goToStep(2);
      return err(generalResult.error.issues[0]?.message ?? "Vérifiez le kilométrage.");
    }
    if (n < selectedVehicle.mileage && !mileageWarningComment.trim()) {
      goToStep(2);
      return err("Justifiez le kilométrage inférieur au dernier relevé.");
    }
    const answerErrors = validateAllAnswers(answers);
    const firstBadId = Object.keys(answerErrors)[0];
    if (firstBadId) {
      goToStep(stepForQuestion(firstBadId));
      return err(answerErrors[firstBadId]);
    }
    if (!confirmed) {
      goToStep(7);
      return err("Confirmez avoir personnellement inspecté le véhicule.");
    }

    setSubmitting(true);

    const mapped: InspectionAnswer[] = INSPECTION_QUESTIONS.map((q) => {
      const a = getAnswer(q.id);
      const isDefect = a.status === "defect";
      return {
        questionId: q.id,
        questionLabel: q.label,
        section: q.section,
        category: q.category,
        status: a.status ?? "ok",
        comment: isDefect ? a.comment.trim() || undefined : undefined,
        photos: isDefect && a.photos.length ? a.photos : undefined,
        followUpValues: isDefect && Object.keys(a.followUpValues).length ? a.followUpValues : undefined,
      };
    });

    if (generalComment.trim()) {
      mapped.push({
        questionId: "general_comment",
        questionLabel: "Commentaire général",
        section: "conclusion",
        category: "general_comment",
        status: "ok",
        comment: generalComment.trim(),
      });
    }

    const submittedAt = new Date().toISOString();
    submitInspection({
      type,
      vehicleId,
      vehicleNumber: selectedVehicle.number,
      supervisorId: role,
      supervisorName,
      changeReason: type === "vehicle_change" ? changeReason : undefined,
      changeReasonComment:
        type === "vehicle_change" && changeReason === "other" ? changeReasonComment.trim() : undefined,
      mileage: Number(mileage),
      mileageWarningComment: mileageWarningComment.trim() || undefined,
      fuelLevel,
      startedAt: new Date(startedAtRef.current).toISOString(),
      submittedAt,
      answers: mapped,
      confirmationAccepted: confirmed,
    });

    const finalDefectCount = mapped.filter((a) => a.status === "defect").length;
    Toast.show({
      type: "success",
      text1:
        finalDefectCount > 0
          ? `Soumise · ${finalDefectCount} anomalie${finalDefectCount > 1 ? "s" : ""}`
          : "Inspection soumise",
    });
    setSubmitting(false);
    onClose();
  };

  const n = Number(mileage.trim());
  const mileageIsLow =
    !!selectedVehicle && mileage.trim() !== "" && Number.isFinite(n) && n < selectedVehicle.mileage;

  const modalW = Math.min(760, winW - 32);
  const modalH = Math.min(640, winH - 48);
  const compactRail = modalW < 560;
  const railW = compactRail ? 56 : 212;

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.55)] p-4">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ width: modalW, height: modalH }}
          className="rounded-xl border border-hairline bg-background overflow-hidden"
        >
          <View className="flex-1">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
              <Text className="text-[15px] font-semibold tracking-tight text-ink">Nouvelle inspection</Text>
              <Pressable
                onPress={onClose}
                accessibilityLabel="Fermer"
                className="h-7 w-7 items-center justify-center rounded-sm"
              >
                <X size={16} color={INK_MUTE} />
              </Pressable>
            </View>

            <View className="flex-1 flex-row min-h-0">
              <View
                style={{ width: railW }}
                className="border-r border-hairline bg-surface px-2.5 py-3.5 gap-0.5"
              >
                <ScrollView contentContainerStyle={{ gap: 2 }}>
                  {STEP_LABELS.map((label, i) => {
                    const isCurrent = i === step;
                    const isDone = i < step;
                    return (
                      <Pressable
                        key={label}
                        onPress={() => goToStep(i)}
                        className={cn(
                          "flex-row items-center gap-2.5 rounded-sm px-2.5 py-2",
                          isCurrent && "bg-info-soft",
                        )}
                      >
                        <View
                          className={cn(
                            "h-5 w-5 shrink-0 rounded-full border items-center justify-center",
                            isDone ? "bg-ok-soft border-ok" : isCurrent ? "border-info" : "border-hairline",
                          )}
                        >
                          {isDone ? (
                            <Check size={11} color={OK} />
                          ) : (
                            <Text
                              className={cn(
                                "text-[11px] font-semibold",
                                isCurrent ? "text-info" : "text-ink-mute",
                              )}
                            >
                              {i + 1}
                            </Text>
                          )}
                        </View>
                        {!compactRail && (
                          <Text
                            className={cn(
                              "flex-1 text-[13px]",
                              isCurrent ? "text-ink font-semibold" : isDone ? "text-ink-dim" : "text-ink-mute",
                            )}
                          >
                            {label}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View className="flex-1 min-w-0">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 16 }}>
                  <View>
                    <Text className="text-[11px] text-ink-dim mb-0.5">
                      Étape {step + 1} / {STEP_LABELS.length}
                    </Text>
                    <Text className="text-[17px] font-semibold text-ink">{STEP_LABELS[step]}</Text>
                  </View>

                  {step === 0 && (
                    <View className="gap-3.5">
                      <View className="gap-2">
                        <FieldLabel>Quel type d'inspection effectuez-vous?</FieldLabel>
                        <View className="flex-row gap-2.5">
                          <Pressable
                            onPress={() => setType("shift_start")}
                            className={cn(
                              "flex-1 h-12 rounded-md border items-center justify-center px-2",
                              type === "shift_start" ? "border-info bg-info-soft" : "border-hairline bg-surface",
                            )}
                          >
                            <Text
                              className={cn(
                                "text-sm font-semibold",
                                type === "shift_start" ? "text-info" : "text-ink",
                              )}
                            >
                              Début de quart
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => setType("vehicle_change")}
                            className={cn(
                              "flex-1 h-12 rounded-md border items-center justify-center px-2",
                              type === "vehicle_change" ? "border-info bg-info-soft" : "border-hairline bg-surface",
                            )}
                          >
                            <Text
                              className={cn(
                                "text-sm font-semibold",
                                type === "vehicle_change" ? "text-info" : "text-ink",
                              )}
                            >
                              Changement de véhicule
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      {type === "vehicle_change" && (
                        <View className="gap-2">
                          <FieldLabel>Pourquoi changez-vous de véhicule?</FieldLabel>
                          <View className="flex-row flex-wrap gap-2">
                            {CHANGE_REASON_OPTIONS.map(({ key, label }) => {
                              const active = changeReason === key;
                              return (
                                <Pressable
                                  key={key}
                                  onPress={() => setChangeReason(key)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-full border",
                                    active ? "border-info bg-info-soft" : "border-hairline bg-surface",
                                  )}
                                >
                                  <Text
                                    className={cn(
                                      "text-xs",
                                      active ? "text-info font-medium" : "text-ink-dim",
                                    )}
                                  >
                                    {label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                          {changeReason === "other" && (
                            <TextInput
                              value={changeReasonComment}
                              onChangeText={setChangeReasonComment}
                              multiline
                              placeholder="Précisez le motif…"
                              placeholderTextColor={INK_MUTE}
                              className="w-full min-h-[56px] px-2.5 py-2 rounded-sm border border-hairline bg-surface text-[13px] text-ink"
                            />
                          )}
                        </View>
                      )}
                    </View>
                  )}

                  {step === 1 && (
                    <View className="gap-3.5">
                      <View className="gap-2">
                        <FieldLabel>Choisir mon véhicule</FieldLabel>
                        <View className="flex-row flex-wrap gap-2.5">
                          {vehicles.map((vehicle, index) => {
                            const disabled = vehicle.state === "hors_service";
                            const active = vehicleId === vehicle.id;
                            const openCount = openAnomaliesFor(vehicle.number).length;
                            return (
                              <Pressable
                                key={vehicle.id}
                                disabled={disabled}
                                onPress={() => setVehicleId(vehicle.id)}
                                className={cn(
                                  "rounded-md border p-3 gap-1.5",
                                  active ? "border-info bg-info-soft" : "border-hairline bg-surface",
                                  disabled && "opacity-50",
                                )}
                                style={{ flexGrow: 1, minWidth: 160 }}
                              >
                                <View className="flex-row items-center justify-between gap-2">
                                  <Text
                                    className={cn(
                                      "text-[15px] font-bold",
                                      active ? "text-info" : "text-ink",
                                    )}
                                  >
                                    {VEHICLE_LETTERS[index] ?? vehicle.number} · {vehicle.number}
                                  </Text>
                                  <View
                                    className={cn(
                                      "rounded-full border px-2 py-0.5",
                                      disabled ? "bg-surface-2 border-hairline" : "bg-ok-soft border-ok/20",
                                    )}
                                  >
                                    <Text className={cn("text-[10px]", disabled ? "text-ink-mute" : "text-ok")}>
                                      {disabled ? "Hors service" : "En service"}
                                    </Text>
                                  </View>
                                </View>
                                <Text className="text-xs text-ink-dim">{formatMileage(vehicle.mileage)}</Text>
                                <Text className="text-xs text-ink-dim">
                                  Dernière inspection :{" "}
                                  {vehicle.lastInspectionAt ? formatDate(vehicle.lastInspectionAt) : "—"}
                                </Text>
                                <Text className={cn("text-[11px]", openCount > 0 ? "text-warn" : "text-ink-mute")}>
                                  {openCount} anomalie{openCount > 1 ? "s" : ""} ouverte{openCount > 1 ? "s" : ""}
                                </Text>
                                {disabled && vehicle.outOfServiceReason && (
                                  <Text className="text-[11px] text-danger">{vehicle.outOfServiceReason}</Text>
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      {selectedVehicle && (
                        <View className="rounded-md border border-hairline bg-surface p-3 gap-2">
                          <Text className="text-sm font-medium text-ink">
                            Véhicule {selectedVehicle.number} · {selectedVehicle.make} {selectedVehicle.model}
                          </Text>
                          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                            <Text className="text-xs text-ink-dim">
                              Dernière inspection :{" "}
                              {selectedVehicle.lastInspectionAt
                                ? formatDate(selectedVehicle.lastInspectionAt)
                                : "—"}
                            </Text>
                            <Text className="text-xs text-ink-dim">
                              Dernier km : {formatMileage(selectedVehicle.mileage)}
                            </Text>
                          </View>
                          {selectedVehicleAnomalies.length > 0 ? (
                            <View className="gap-1">
                              {selectedVehicleAnomalies.map((a) => (
                                <View key={a.id} className="flex-row items-start gap-2">
                                  <AlertTriangle size={12} color={WARN} />
                                  <Text className="flex-1 text-xs text-ink-dim">{a.title}</Text>
                                </View>
                              ))}
                            </View>
                          ) : (
                            <Text className="text-xs text-ok">Aucune anomalie ouverte.</Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}

                  {step === 2 && (
                    <View className="gap-3.5">
                      <View className="gap-1.5">
                        <FieldLabel>Superviseur</FieldLabel>
                        <View className="h-10 px-3 rounded-md border border-hairline bg-surface justify-center">
                          <Text className="text-sm text-ink">{supervisorName}</Text>
                        </View>
                      </View>

                      <View className="gap-1.5">
                        <FieldLabel>Date et heure</FieldLabel>
                        <View className="h-10 px-3 rounded-md border border-hairline bg-surface justify-center">
                          <Text className="text-sm text-ink">{formatDateTime(new Date().toISOString())}</Text>
                        </View>
                      </View>

                      <View className="gap-1.5">
                        <FieldLabel>Quel est le kilométrage actuel du véhicule?</FieldLabel>
                        <Input
                          value={mileage}
                          onChangeText={setMileage}
                          keyboardType="number-pad"
                          placeholder="Ex. 32451"
                        />
                        {mileageIsLow && (
                          <View className="gap-2">
                            <View className="flex-row gap-2 items-start">
                              <AlertTriangle size={14} color={WARN} />
                              <Text className="flex-1 text-xs" style={{ color: WARN }}>
                                Ce kilométrage est inférieur au dernier relevé (
                                {formatMileage(selectedVehicle!.mileage)}). Justifiez l'écart.
                              </Text>
                            </View>
                            <TextInput
                              value={mileageWarningComment}
                              onChangeText={setMileageWarningComment}
                              multiline
                              placeholder="Justification…"
                              placeholderTextColor={INK_MUTE}
                              className="w-full min-h-[56px] px-2.5 py-2 rounded-sm border border-warn/30 bg-warn-soft text-[13px] text-ink"
                            />
                          </View>
                        )}
                      </View>

                      <View className="gap-1.5">
                        <FieldLabel>Quel est le niveau actuel de carburant?</FieldLabel>
                        <View className="flex-row gap-2">
                          {FUEL_ORDER.map((f) => {
                            const active = fuelLevel === f;
                            return (
                              <Pressable
                                key={f}
                                onPress={() => setFuelLevel(f)}
                                className={cn(
                                  "flex-1 h-[38px] rounded-sm border items-center justify-center",
                                  active ? "border-info bg-info-soft" : "border-hairline bg-surface",
                                )}
                              >
                                <Text className={cn("text-[13px] font-semibold", active ? "text-info" : "text-ink")}>
                                  {FUEL_LABEL[f]}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  )}

                  {STEP_SECTION[step] && STEP_SECTION[step] !== "conclusion" && (
                    <View className="gap-2.5">
                      {questionsForSection(STEP_SECTION[step]).map((question) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          value={getAnswer(question.id)}
                          onStatus={(status) => setAnswer(question.id, { status })}
                          onComment={(comment) => setAnswer(question.id, { comment })}
                          onPhotos={(photos) => setAnswer(question.id, { photos })}
                          onFollowUp={(followUpId, nextValue) => setFollowUp(question.id, followUpId, nextValue)}
                        />
                      ))}
                    </View>
                  )}

                  {step === 7 && (
                    <View className="gap-3.5">
                      <View className="border border-hairline rounded-md bg-surface p-3 flex-row flex-wrap">
                        <Recap label="Type" value={typeLabel(type)} />
                        <Recap label="Véhicule" value={selectedVehicle?.number ?? "—"} />
                        <Recap label="Superviseur" value={supervisorName} />
                        <Recap label="Kilométrage" value={mileage ? formatMileage(Number(mileage)) : "—"} />
                        <Recap label="Carburant" value={FUEL_LABEL[fuelLevel]} />
                        <Recap label="Réponses OK" value={String(okCount)} tone="ok" />
                        <Recap label="Défauts" value={String(defectCount)} tone={defectCount ? "danger" : "ok"} />
                      </View>

                      {defectAnswers.length > 0 && (
                        <View className="gap-2">
                          <FieldLabel>Défauts constatés</FieldLabel>
                          {defectAnswers.map(({ questionId, question, value }) => {
                            const expanded = expandedDefectId === questionId;
                            return (
                              <View key={questionId} className="rounded-md border border-hairline p-3 gap-2">
                                <Pressable
                                  onPress={() => setExpandedDefectId(expanded ? null : questionId)}
                                  className="flex-row items-start justify-between gap-2"
                                >
                                  <View className="flex-1">
                                    <Text className="text-sm font-medium text-ink">{question.label}</Text>
                                    {!expanded && value.comment ? (
                                      <Text className="text-xs text-ink-dim mt-0.5" numberOfLines={2}>
                                        {value.comment}
                                      </Text>
                                    ) : null}
                                  </View>
                                  {expanded ? (
                                    <ChevronUp size={16} color={INK_MUTE} />
                                  ) : (
                                    <ChevronDown size={16} color={INK_MUTE} />
                                  )}
                                </Pressable>
                                {expanded && (
                                  <TextInput
                                    value={value.comment}
                                    onChangeText={(text) => setAnswer(questionId, { comment: text })}
                                    multiline
                                    placeholder="Décrivez le problème…"
                                    placeholderTextColor={INK_MUTE}
                                    className="w-full min-h-[56px] px-2.5 py-2 rounded-sm border border-danger/30 bg-danger-soft text-[13px] text-ink"
                                  />
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}

                      {outOfServiceReason && (
                        <View className="rounded-md border border-danger/30 bg-danger-soft p-3 flex-row gap-2 items-start">
                          <AlertTriangle size={16} color={DANGER} />
                          <Text className="flex-1 text-sm text-danger">
                            Ce véhicule sera mis hors service : {outOfServiceReason}
                          </Text>
                        </View>
                      )}

                      <BinaryAnswerBlock
                        label="Selon votre inspection, le véhicule peut-il être utilisé de façon sécuritaire?"
                        value={getAnswer("q15")}
                        okLabel={QUESTIONS_BY_ID.q15.okLabel ?? "OK"}
                        defectLabel={QUESTIONS_BY_ID.q15.defectLabel ?? "Défaut"}
                        onStatus={(status) => setAnswer("q15", { status })}
                        onComment={(comment) => setAnswer("q15", { comment })}
                      />

                      <BinaryAnswerBlock
                        label="Avez-vous remarqué une autre anomalie non couverte dans le formulaire?"
                        value={getAnswer("q16")}
                        okLabel={QUESTIONS_BY_ID.q16.okLabel ?? "OK"}
                        defectLabel={QUESTIONS_BY_ID.q16.defectLabel ?? "Défaut"}
                        onStatus={(status) => setAnswer("q16", { status })}
                        onComment={(comment) => setAnswer("q16", { comment })}
                      />

                      <View className="gap-1.5">
                        <FieldLabel>Commentaire général sur l'inspection (facultatif)</FieldLabel>
                        <TextInput
                          value={generalComment}
                          onChangeText={setGeneralComment}
                          multiline
                          placeholder="Information complémentaire…"
                          placeholderTextColor={INK_MUTE}
                          className="w-full min-h-[64px] px-2.5 py-2 rounded-sm border border-hairline bg-surface text-[13px] text-ink"
                        />
                      </View>

                      <Pressable
                        onPress={() => setConfirmed((v) => !v)}
                        className="flex-row items-start gap-2.5 rounded-md border border-hairline p-3"
                      >
                        <View
                          className={cn(
                            "h-[19px] w-[19px] rounded-[5px] border items-center justify-center mt-px",
                            confirmed ? "bg-ink border-ink" : "border-hairline",
                          )}
                        >
                          {confirmed && <Check size={12} color={PRIMARY_FG} />}
                        </View>
                        <Text className="flex-1 text-[13px] text-ink">
                          Je confirme avoir personnellement inspecté le véhicule et avoir fourni des
                          informations exactes.
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>

                <View className="flex-row items-center justify-end gap-2 px-6 py-3.5 border-t border-hairline">
                  {step > 0 && (
                    <BtnGhost className="px-4" onPress={() => goToStep(step - 1)}>
                      <ChevronLeft size={14} color={INK} />
                      <Text className="text-ink text-sm">Précédent</Text>
                    </BtnGhost>
                  )}
                  {step < STEP_LABELS.length - 1 ? (
                    <BtnPrimary className="px-[18px]" onPress={next}>
                      <Text className="text-primary-foreground text-sm font-medium">Suivant</Text>
                      <ChevronRight size={14} color={PRIMARY_FG} />
                    </BtnPrimary>
                  ) : (
                    <BtnPrimary className="px-[18px]" onPress={submit} disabled={submitting}>
                      <Check size={14} color={PRIMARY_FG} />
                      <Text className="text-primary-foreground text-sm font-medium">
                        {submitting ? "Envoi…" : "Soumettre l'inspection"}
                      </Text>
                    </BtnPrimary>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] uppercase tracking-wider text-ink-dim font-semibold">{children}</Text>
  );
}

function QuestionCard({
  question,
  value,
  onStatus,
  onComment,
  onPhotos,
  onFollowUp,
}: {
  question: InspectionQuestionConfig;
  value: AnswerFormValue;
  onStatus: (status: "ok" | "defect") => void;
  onComment: (text: string) => void;
  onPhotos: (photos: string[]) => void;
  onFollowUp: (followUpId: string, next: string | string[]) => void;
}) {
  const isDefect = value.status === "defect";
  return (
    <View className="border border-hairline rounded-md p-3 gap-2.5">
      <View className="flex-row items-center justify-between gap-4 flex-wrap">
        <Text className="text-sm font-medium text-ink" style={{ flex: 1, minWidth: 220 }}>
          {question.label}
        </Text>
        <View className="flex-row gap-2 shrink-0">
          <Pressable
            onPress={() => onStatus("ok")}
            className={cn(
              "h-[34px] px-[18px] rounded-sm border items-center justify-center",
              value.status === "ok" ? "border-ok bg-ok-soft" : "border-hairline bg-surface",
            )}
          >
            <Text className={cn("text-[13px] font-semibold", value.status === "ok" ? "text-ok" : "text-ink")}>
              {question.okLabel ?? "OK"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onStatus("defect")}
            className={cn(
              "h-[34px] px-[18px] rounded-sm border items-center justify-center",
              isDefect ? "border-danger bg-danger-soft" : "border-hairline bg-surface",
            )}
          >
            <Text className={cn("text-[13px] font-semibold", isDefect ? "text-danger" : "text-ink")}>
              {question.defectLabel ?? "Défaut"}
            </Text>
          </Pressable>
        </View>
      </View>
      {isDefect && (
        <View className="gap-2">
          <TextInput
            value={value.comment}
            onChangeText={onComment}
            multiline
            placeholder="Décrivez le problème…"
            placeholderTextColor={INK_MUTE}
            className="w-full min-h-[56px] px-2.5 py-2 rounded-sm border border-danger/30 bg-danger-soft text-[13px] text-ink"
          />
          <InspectionPhotoInput
            photos={value.photos}
            onChange={onPhotos}
            recommended={question.photoRecommendedOnDefect}
          />
          {question.followUpOptions?.map((followUp) => (
            <FollowUpField
              key={followUp.id}
              followUp={followUp}
              value={value.followUpValues[followUp.id]}
              onChange={(nextValue) => onFollowUp(followUp.id, nextValue)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function BinaryAnswerBlock({
  label,
  value,
  okLabel,
  defectLabel,
  onStatus,
  onComment,
}: {
  label: string;
  value: AnswerFormValue;
  okLabel: string;
  defectLabel: string;
  onStatus: (status: "ok" | "defect") => void;
  onComment: (text: string) => void;
}) {
  const isDefect = value.status === "defect";
  return (
    <View className="gap-2">
      <FieldLabel>{label}</FieldLabel>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onStatus("ok")}
          className={cn(
            "flex-1 h-10 rounded-sm border items-center justify-center px-2",
            value.status === "ok" ? "border-ok bg-ok-soft" : "border-hairline bg-surface",
          )}
        >
          <Text
            className={cn("text-[13px] font-semibold text-center", value.status === "ok" ? "text-ok" : "text-ink")}
          >
            {okLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onStatus("defect")}
          className={cn(
            "flex-1 h-10 rounded-sm border items-center justify-center px-2",
            isDefect ? "border-danger bg-danger-soft" : "border-hairline bg-surface",
          )}
        >
          <Text className={cn("text-[13px] font-semibold text-center", isDefect ? "text-danger" : "text-ink")}>
            {defectLabel}
          </Text>
        </Pressable>
      </View>
      {isDefect && (
        <TextInput
          value={value.comment}
          onChangeText={onComment}
          multiline
          placeholder="Décrivez…"
          placeholderTextColor={INK_MUTE}
          className="w-full min-h-[56px] px-2.5 py-2 rounded-sm border border-danger/30 bg-danger-soft text-[13px] text-ink"
        />
      )}
    </View>
  );
}

function FollowUpField({
  followUp,
  value,
  onChange,
}: {
  followUp: InspectionFollowUp;
  value: string | string[] | undefined;
  onChange: (next: string | string[]) => void;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <View className="gap-1.5">
      <FieldLabel>{followUp.label}</FieldLabel>
      <View className="flex-row flex-wrap gap-2">
        {followUp.options.map((option) => {
          const active = selected.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => {
                if (followUp.multiple) {
                  onChange(active ? selected.filter((o) => o !== option) : [...selected, option]);
                } else {
                  onChange(option);
                }
              }}
              className={cn(
                "px-3 py-1.5 rounded-full border",
                active ? "border-info bg-info-soft" : "border-hairline bg-surface",
              )}
            >
              <Text className={cn("text-xs", active ? "text-info font-medium" : "text-ink-dim")}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Recap({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "danger";
}) {
  return (
    <View className="w-1/2 mb-2.5">
      <Text className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</Text>
      <Text
        className={cn(
          "text-sm font-semibold mt-0.5",
          tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </Text>
    </View>
  );
}
