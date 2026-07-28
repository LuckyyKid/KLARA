import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, Text, Pressable, TextInput } from "react-native";
import { AlertTriangle, Check, ChevronLeft, ChevronRight } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Modal, BtnGhost, BtnPrimary, Field, Input } from "./Modal";
import { Select } from "./Select";
import { useStore } from "@/lib/klara/store";
import { CURRENT_USER, useRole } from "@/lib/klara/role-context";
import { INSPECTION_QUESTIONS, INSPECTION_SECTIONS } from "@/lib/klara/inspection-config";
import type { InspectionResult } from "@/lib/klara/inspection-types";
import type {
  FuelLevel,
  InspectionAnswer,
  InspectionSectionId,
  InspectionType,
} from "@/lib/klara/inspection/types";
import { cn } from "@/lib/utils";

type LocalAnswer = { questionId: string; result: InspectionResult; comment?: string };

const SECTION_MAP: Record<string, InspectionSectionId> = {
  "Intérieur": "interior",
  "Extérieur": "exterior",
  "Fonctionnement": "operation",
  "Équipement": "equipment",
};

const VEHICLE_LETTERS = ["A", "B", "C", "D", "E"];
const STEPS = ["Infos", "Vérifs", "Fin"] as const;
const FUEL_OPTS: { key: FuelLevel; label: string }[] = [
  { key: "empty", label: "Vide" },
  { key: "quarter", label: "¼" },
  { key: "half", label: "½" },
  { key: "three_quarters", label: "¾" },
  { key: "full", label: "Plein" },
];

const WARN = "rgb(217,119,6)";
const PRIMARY_FG = "rgb(250,250,247)";

export function InspectionFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicles, submitInspection } = useStore();
  const { role } = useRole();
  const supervisor = CURRENT_USER[role].name;
  const startRef = useRef(Date.now());
  const [step, setStep] = useState(0);
  const [type, setType] = useState<InspectionType>("shift_start");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("half");
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [vehicleSafe, setVehicleSafe] = useState<boolean | null>(null);
  const [otherAnomaly, setOtherAnomaly] = useState(false);
  const [otherAnomalyComment, setOtherAnomalyComment] = useState("");
  const [generalComment, setGeneralComment] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    startRef.current = Date.now();
    setStep(0);
    setType("shift_start");
    setVehicleNumber("");
    setMileage("");
    setFuelLevel("half");
    setAnswers({});
    setVehicleSafe(null);
    setOtherAnomaly(false);
    setOtherAnomalyComment("");
    setGeneralComment("");
    setConfirmed(false);
  }, [open]);

  const selectedVehicle = vehicles.find((v) => v.number === vehicleNumber);
  const defectCount = Object.values(answers).filter((a) => a.result === "defect").length;
  const answeredCount = Object.keys(answers).length;

  const grouped = useMemo(
    () =>
      INSPECTION_SECTIONS.map((section) => ({
        section,
        questions: INSPECTION_QUESTIONS.filter((q) => q.section === section),
      })),
    [],
  );

  const setAnswer = (questionId: string, result: InspectionResult) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        questionId,
        result,
        comment: result === "defect" ? current[questionId]?.comment ?? "" : undefined,
      },
    }));
  };

  const setComment = (questionId: string, comment: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: { questionId, result: "defect", comment },
    }));
  };

  const err = (msg: string) => Toast.show({ type: "error", text1: msg });

  const validateStep = () => {
    if (step === 0) {
      if (!vehicleNumber) return err("Choisissez un véhicule"), false;
      const n = Number(mileage);
      if (!mileage || n < 0) return err("Entrez le kilométrage"), false;
      if (selectedVehicle && n < selectedVehicle.mileage) {
        return (
          err(`Kilométrage min: ${selectedVehicle.mileage.toLocaleString("fr-CA")} km`),
          false
        );
      }
    }
    if (step === 1) {
      if (answeredCount !== INSPECTION_QUESTIONS.length)
        return err("Répondez à toutes les vérifications"), false;
      const miss = Object.values(answers).find(
        (a) => a.result === "defect" && !a.comment?.trim(),
      );
      if (miss) return err("Commentaire manquant pour un défaut"), false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = () => {
    if (vehicleSafe === null) return err("Le véhicule est-il utilisable?");
    if (otherAnomaly && !otherAnomalyComment.trim()) return err("Décrivez l'autre anomalie");
    if (!confirmed) return err("Confirmez avoir effectué l'inspection");

    const submittedAt = new Date();
    const mapped: InspectionAnswer[] = INSPECTION_QUESTIONS.map((q) => ({
      questionId: q.id,
      questionLabel: q.label,
      section: SECTION_MAP[q.section] ?? "interior",
      category: q.id,
      status: answers[q.id]?.result === "defect" ? "defect" : "ok",
      comment: answers[q.id]?.comment,
    }));
    if (!vehicleSafe) {
      mapped.push({
        questionId: "vehicle-safety",
        questionLabel: "Le véhicule peut-il être utilisé de façon sécuritaire?",
        section: "conclusion",
        category: "vehicle_safety",
        status: "defect",
        comment: generalComment.trim() || "Véhicule jugé non sécuritaire.",
      });
    }
    if (otherAnomaly && otherAnomalyComment.trim()) {
      mapped.push({
        questionId: "other",
        questionLabel: "Autre anomalie",
        section: "conclusion",
        category: "other",
        status: "defect",
        comment: otherAnomalyComment.trim(),
      });
    }
    submitInspection({
      type,
      vehicleId: selectedVehicle?.id ?? "",
      vehicleNumber,
      supervisorId: role,
      supervisorName: supervisor,
      mileage: Number(mileage),
      fuelLevel,
      startedAt: new Date(startRef.current).toISOString(),
      submittedAt: submittedAt.toISOString(),
      answers: mapped,
      confirmationAccepted: confirmed,
    });
    Toast.show({
      type: "success",
      text1:
        defectCount > 0
          ? `Soumise · ${defectCount} anomalie${defectCount > 1 ? "s" : ""}`
          : "Inspection soumise",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle inspection"
      footer={
        <>
          {step > 0 && (
            <BtnGhost onPress={() => setStep((s) => s - 1)}>
              <ChevronLeft size={14} color="rgb(23,25,29)" />
              <Text className="text-ink text-sm">Retour</Text>
            </BtnGhost>
          )}
          {step < STEPS.length - 1 ? (
            <BtnPrimary onPress={next}>
              <Text className="text-primary-foreground text-sm font-medium">Continuer</Text>
              <ChevronRight size={14} color={PRIMARY_FG} />
            </BtnPrimary>
          ) : (
            <BtnPrimary onPress={submit}>
              <Check size={14} color={PRIMARY_FG} />
              <Text className="text-primary-foreground text-sm font-medium">Soumettre</Text>
            </BtnPrimary>
          )}
        </>
      }
    >
      <ScrollView className="max-h-[540px]" contentContainerStyle={{ gap: 14 }}>
        <View>
          <View className="flex-row justify-between mb-2">
            {STEPS.map((label, i) => (
              <Text
                key={label}
                className={cn("text-xs", i === step ? "text-ink font-medium" : "text-ink-mute")}
              >
                {i + 1}. {label}
              </Text>
            ))}
          </View>
          <View className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <View
              className="h-full bg-info"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </View>
        </View>

        {step === 0 && (
          <View className="gap-4">
            <Field label="Type d'inspection">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <ChoiceButton
                    active={type === "shift_start"}
                    onPress={() => setType("shift_start")}
                  >
                    Début de quart
                  </ChoiceButton>
                </View>
                <View className="flex-1">
                  <ChoiceButton
                    active={type === "vehicle_change"}
                    onPress={() => setType("vehicle_change")}
                  >
                    Changement
                  </ChoiceButton>
                </View>
              </View>
            </Field>

            <Field label="Choisir mon véhicule">
              <View className="flex-row flex-wrap gap-2">
                {vehicles.slice(0, 5).map((vehicle, index) => {
                  const disabled = vehicle.state === "hors_service";
                  const active = vehicleNumber === vehicle.number;
                  return (
                    <Pressable
                      key={vehicle.id}
                      disabled={disabled}
                      onPress={() => {
                        setVehicleNumber(vehicle.number);
                        setMileage(String(vehicle.mileage));
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 items-center min-w-[56px]",
                        active
                          ? "border-info bg-info-soft"
                          : "border-hairline bg-surface",
                        disabled && "opacity-45",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-lg font-semibold",
                          active ? "text-info" : "text-ink",
                        )}
                      >
                        {VEHICLE_LETTERS[index]}
                      </Text>
                      <Text className="text-[10px] text-ink-mute mt-0.5">{vehicle.number}</Text>
                      {disabled && (
                        <Text className="text-[9px] text-danger mt-1">Hors service</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            {selectedVehicle && (
              <View className="rounded-lg border border-hairline bg-secondary/40 p-3">
                <Text className="text-sm font-medium text-ink">
                  {selectedVehicle.make} {selectedVehicle.model} · {selectedVehicle.year}
                </Text>
                <Text className="text-xs text-ink-mute mt-1">
                  Dernier km : {selectedVehicle.mileage.toLocaleString("fr-CA")}
                </Text>
                {selectedVehicle.openAnomaly && (
                  <View className="mt-2 flex-row gap-2 items-start">
                    <AlertTriangle size={14} color={WARN} />
                    <Text className="flex-1 text-xs" style={{ color: WARN }}>
                      Anomalie ouverte : {selectedVehicle.openAnomaly}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Field label="Kilométrage actuel">
              <Input
                value={mileage}
                onChangeText={setMileage}
                keyboardType="number-pad"
                placeholder="Ex. 32451"
              />
            </Field>

            <Field label="Niveau de carburant">
              <Select
                value={fuelLevel}
                onChange={(v) => setFuelLevel(v as FuelLevel)}
                options={FUEL_OPTS}
              />
            </Field>
          </View>
        )}

        {step === 1 && (
          <View className="gap-4">
            <Text className="text-sm text-ink-dim">
              Choisir <Text className="font-semibold">OK</Text> ou{" "}
              <Text className="font-semibold">Défaut</Text>. Un commentaire est requis pour un défaut.
            </Text>
            {grouped.map(({ section, questions }) => (
              <View key={section} className="gap-2">
                <Text className="text-[11px] uppercase tracking-widest text-ink-dim">{section}</Text>
                {questions.map((question) => {
                  const answer = answers[question.id];
                  return (
                    <View
                      key={question.id}
                      className="rounded-lg border border-hairline p-3 gap-2"
                    >
                      <Text className="text-sm font-medium text-ink">{question.label}</Text>
                      <View className="flex-row gap-2">
                        <View className="flex-1">
                          <ChoiceButton
                            active={answer?.result === "ok"}
                            tone="ok"
                            onPress={() => setAnswer(question.id, "ok")}
                          >
                            OK
                          </ChoiceButton>
                        </View>
                        <View className="flex-1">
                          <ChoiceButton
                            active={answer?.result === "defect"}
                            tone="danger"
                            onPress={() => setAnswer(question.id, "defect")}
                          >
                            Défaut
                          </ChoiceButton>
                        </View>
                      </View>
                      {answer?.result === "defect" && (
                        <TextInput
                          value={answer.comment ?? ""}
                          onChangeText={(v) => setComment(question.id, v)}
                          multiline
                          placeholder="Décrivez le problème…"
                          placeholderTextColor="rgb(138,142,149)"
                          className="w-full min-h-20 px-3 py-2 rounded-md border border-danger/30 bg-danger-soft/20 text-sm text-ink"
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {step === 2 && (
          <View className="gap-4">
            <View className="rounded-lg border border-hairline bg-secondary/40 p-3 flex-row flex-wrap">
              <Recap label="Véhicule" value={vehicleNumber} />
              <Recap label="Kilométrage" value={`${Number(mileage).toLocaleString("fr-CA")} km`} />
              <Recap
                label="Vérifications"
                value={`${answeredCount}/${INSPECTION_QUESTIONS.length}`}
              />
              <Recap
                label="Défauts"
                value={String(defectCount)}
                tone={defectCount ? "danger" : "ok"}
              />
            </View>

            <Field label="Le véhicule est-il utilisable sécuritairement?">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <ChoiceButton
                    active={vehicleSafe === true}
                    tone="ok"
                    onPress={() => setVehicleSafe(true)}
                  >
                    Oui
                  </ChoiceButton>
                </View>
                <View className="flex-1">
                  <ChoiceButton
                    active={vehicleSafe === false}
                    tone="danger"
                    onPress={() => setVehicleSafe(false)}
                  >
                    Non, hors service
                  </ChoiceButton>
                </View>
              </View>
            </Field>

            <Field label="Autre anomalie non couverte">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <ChoiceButton active={!otherAnomaly} onPress={() => setOtherAnomaly(false)}>
                    Non
                  </ChoiceButton>
                </View>
                <View className="flex-1">
                  <ChoiceButton
                    active={otherAnomaly}
                    tone="danger"
                    onPress={() => setOtherAnomaly(true)}
                  >
                    Oui
                  </ChoiceButton>
                </View>
              </View>
              {otherAnomaly && (
                <TextInput
                  value={otherAnomalyComment}
                  onChangeText={setOtherAnomalyComment}
                  multiline
                  placeholder="Décrivez…"
                  placeholderTextColor="rgb(138,142,149)"
                  className="mt-2 w-full min-h-20 px-3 py-2 rounded-md border border-hairline bg-surface text-sm text-ink"
                />
              )}
            </Field>

            <Field label="Commentaire général (facultatif)">
              <TextInput
                value={generalComment}
                onChangeText={setGeneralComment}
                multiline
                placeholder="Information complémentaire…"
                placeholderTextColor="rgb(138,142,149)"
                className="w-full min-h-20 px-3 py-2 rounded-md border border-hairline bg-surface text-sm text-ink"
              />
            </Field>

            <Pressable
              onPress={() => setConfirmed((v) => !v)}
              className="flex-row items-start gap-3 rounded-lg border border-hairline p-3"
            >
              <View
                className={cn(
                  "h-5 w-5 rounded border items-center justify-center mt-0.5",
                  confirmed ? "bg-ink border-ink" : "border-hairline",
                )}
              >
                {confirmed && <Check size={12} color={PRIMARY_FG} />}
              </View>
              <Text className="flex-1 text-sm text-ink">
                Je confirme avoir personnellement inspecté ce véhicule.
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

function ChoiceButton({
  active,
  onPress,
  children,
  tone = "default",
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
  tone?: "default" | "ok" | "danger";
}) {
  const wrap = cn(
    "h-10 rounded-md border items-center justify-center",
    !active && "border-hairline bg-surface",
    active && tone === "default" && "border-info bg-info-soft",
    active && tone === "ok" && "border-ok/40 bg-ok/10",
    active && tone === "danger" && "border-danger/40 bg-danger-soft",
  );
  const text = cn(
    "text-sm font-medium",
    !active && "text-ink",
    active && tone === "default" && "text-info",
    active && tone === "ok" && "text-ok",
    active && tone === "danger" && "text-danger",
  );
  return (
    <Pressable onPress={onPress} className={wrap}>
      {typeof children === "string" ? <Text className={text}>{children}</Text> : children}
    </Pressable>
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
    <View className="w-1/2 mb-2">
      <Text className="text-[11px] uppercase tracking-widest text-ink-mute">{label}</Text>
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
