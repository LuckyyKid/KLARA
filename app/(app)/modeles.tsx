import { ScrollView, View, Text } from "react-native";
import { Camera, GripVertical } from "lucide-react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";

const INFO = "rgb(59,130,246)";
const MUTE = "rgb(138,142,149)";
const PRIMARY_FG = "rgb(250,250,247)";

const SECTIONS = [
  {
    name: "Intérieur",
    questions: [
      { q: "Volant / Klaxon", impact: "Utilisable", req: true },
      { q: "Pédale de frein / accélérateur", impact: "Impossible à utiliser", req: true },
      { q: "Essuie-glaces / Lave-glace", impact: "Utilisable avec précaution", req: true },
      { q: "Ceinture de sécurité", impact: "Impossible à utiliser", req: true },
      { q: "Trousse de premiers soins + billets d'entrée/sortie", impact: "Utilisable", req: true },
    ],
  },
  {
    name: "Extérieur",
    questions: [
      { q: "Feux (avant, arrière, freinage, clignotants, recul)", impact: "Utilisable avec précaution", req: true },
      { q: "Pneus (état / pression)", impact: "Utilisable avec précaution", req: true },
      { q: "Carrosserie / dommages visibles", impact: "Utilisable", req: true, camera: true },
      { q: "Fuites visibles sous le véhicule", impact: "Impossible à utiliser", req: true },
      { q: "Témoin check engine", impact: "Utilisable avec précaution", req: true },
    ],
  },
];

export default function ModelesScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      {SECTIONS.map((s) => (
        <Panel key={s.name}>
          <PanelHeader
            title={s.name}
            right={
              <Text className="text-[11px] uppercase tracking-widest text-ink-mute">
                {s.questions.length} questions
              </Text>
            }
          />
          <View>
            {s.questions.map((q, i) => (
              <View
                key={i}
                className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-hairline" : ""}`}
              >
                <GripVertical size={16} color={MUTE} />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-ink" numberOfLines={2}>
                    {q.q}
                  </Text>
                  <Text className="text-xs text-ink-mute mt-0.5">
                    Impact par défaut : {q.impact} · {q.req ? "Obligatoire" : "Facultative"}
                  </Text>
                </View>
                {q.camera && (
                  <View className="flex-row items-center gap-1">
                    <Camera size={12} color={INFO} />
                    <Text className="text-[11px] text-info">Photo</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Panel>
      ))}

      <Panel>
        <PanelHeader title="Aperçu mobile" subtitle="Vue superviseur" />
        <View className="p-4 items-center">
          <View className="w-56 rounded-2xl border-4 border-ink bg-background overflow-hidden">
            <View className="bg-ink p-3">
              <Text className="text-[11px] uppercase tracking-widest text-primary-foreground/60">
                Véhicule 2004 · Soir
              </Text>
              <Text className="mt-1 text-primary-foreground font-semibold text-sm">Question 6 / 24</Text>
            </View>
            <View className="p-3 gap-3">
              <Text className="text-sm text-ink-dim">Pédale de frein / accélérateur</Text>
              <View className="flex-row gap-2">
                <View className="flex-1 rounded-lg border border-ok bg-ok-soft py-3 items-center">
                  <Text className="text-ok text-xs font-medium">Conforme</Text>
                </View>
                <View className="flex-1 rounded-lg border border-danger bg-danger-soft py-3 items-center">
                  <Text className="text-danger text-xs font-medium">Problème</Text>
                </View>
              </View>
              <Text className="text-[11px] text-ink-mute">
                Impact pré-rempli : Impossible à utiliser
              </Text>
            </View>
          </View>
        </View>
      </Panel>
    </ScrollView>
  );
}
