import { ScrollView, View, Text } from "react-native";
import { CheckCircle2, Circle, Camera } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Modal, BtnGhost, BtnPrimary } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { SHIFTS, VEHICLES, type Assignment } from "@/lib/klara/mock-data";

const OK = "rgb(34,197,94)";
const MUTE = "rgb(138,142,149)";
const INFO = "rgb(59,130,246)";

const CHECKLIST = [
  {
    section: "Intérieur",
    items: [
      { q: "Volant / Klaxon", done: true },
      { q: "Pédale de frein / accélérateur", done: true },
      { q: "Essuie-glaces / Lave-glace", done: true },
      { q: "Ceinture de sécurité", done: true },
      { q: "Trousse de premiers soins", done: false },
    ],
  },
  {
    section: "Extérieur",
    items: [
      { q: "Feux (avant, arrière, freinage)", done: true },
      { q: "Pneus (état / pression)", done: true },
      { q: "Carrosserie / dommages visibles", done: false, camera: true },
      { q: "Fuites visibles sous le véhicule", done: false },
      { q: "Témoin check engine", done: false },
    ],
  },
];

export function InspectionDetailModal({
  assignment,
  onClose,
}: {
  assignment: Assignment | null;
  onClose: () => void;
}) {
  if (!assignment) return null;
  const v = VEHICLES.find((x) => x.number === assignment.vehicleNumber);
  const total = CHECKLIST.reduce((n, s) => n + s.items.length, 0);
  const done = CHECKLIST.reduce((n, s) => n + s.items.filter((i) => i.done).length, 0);
  const isActive =
    assignment.status === "in_progress" ||
    assignment.status === "pending" ||
    assignment.status === "late";

  return (
    <Modal
      open={!!assignment}
      onClose={onClose}
      title={`Inspection — véhicule ${assignment.vehicleNumber}`}
      footer={
        <>
          <BtnGhost onPress={onClose}>Fermer</BtnGhost>
          {isActive && (
            <BtnPrimary
              onPress={() => {
                Toast.show({ type: "success", text1: "Inspection soumise (démo)" });
                onClose();
              }}
            >
              Soumettre
            </BtnPrimary>
          )}
        </>
      }
    >
      <ScrollView className="max-h-[500px]" contentContainerStyle={{ gap: 12 }}>
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-md bg-secondary items-center justify-center">
            <Text className="font-mono text-sm font-semibold text-ink">{assignment.vehicleNumber}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-ink">
              {v?.make} {v?.model}
            </Text>
            <Text className="text-xs text-ink-mute">
              {SHIFTS[assignment.shift].label} · superviseur {assignment.supervisor}
            </Text>
          </View>
          <StatusBadge status={assignment.status} />
        </View>

        <View className="rounded-md border border-hairline p-3 gap-2">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-[11px] uppercase tracking-widest text-ink-dim">Progression</Text>
            <Text className="font-mono text-sm text-ink">
              {done} / {total} · {Math.round((done / total) * 100)} %
            </Text>
          </View>
          <View className="h-2 rounded-full bg-secondary overflow-hidden">
            <View className="h-full bg-info" style={{ width: `${(done / total) * 100}%` }} />
          </View>
        </View>

        {CHECKLIST.map((s) => (
          <View key={s.section} className="gap-1">
            <Text className="text-[11px] uppercase tracking-widest text-ink-dim">{s.section}</Text>
            <View className="rounded-md border border-hairline">
              {s.items.map((it, i) => (
                <View
                  key={it.q}
                  className={`flex-row items-center gap-2 px-3 py-2 ${i > 0 ? "border-t border-hairline" : ""}`}
                >
                  {it.done ? (
                    <CheckCircle2 size={16} color={OK} />
                  ) : (
                    <Circle size={16} color={MUTE} />
                  )}
                  <Text className={`flex-1 text-sm ${it.done ? "text-ink" : "text-ink-dim"}`}>
                    {it.q}
                  </Text>
                  {it.camera && <Camera size={14} color={INFO} />}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Modal>
  );
}
