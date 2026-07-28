import { ScrollView, View, Text } from "react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { ASSIGNMENTS, SHIFTS, VEHICLES, type AssignmentStatus } from "@/lib/klara/mock-data";
import { cn } from "@/lib/utils";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const TODAY = 26;

export default function CalendrierScreen() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader title="Juillet 2026" subtitle="Vue mensuelle · 3 quarts par véhicule et par jour" />
        <View className="p-3">
          <View className="flex-row pb-2">
            {DAYS.map((d) => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-[10px] uppercase tracking-widest text-ink-mute">{d}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {[0, 1, 2].map((i) => (
              <View key={`pad${i}`} style={{ width: `${100 / 7}%` }} className="aspect-square p-0.5" />
            ))}
            {days.map((d) => {
              const isToday = d === TODAY;
              const partial = d === TODAY;
              return (
                <View
                  key={d}
                  style={{ width: `${100 / 7}%` }}
                  className="aspect-square p-0.5"
                >
                  <View
                    className={cn(
                      "flex-1 rounded-lg border border-hairline p-1.5",
                      isToday && "border-ink border-2",
                    )}
                  >
                    <Text className="font-mono text-[10px] text-ink-dim">{d}</Text>
                    <View className="mt-auto flex-row gap-0.5">
                      <View className="flex-1 h-1 rounded-full bg-ok" />
                      <View className={cn("flex-1 h-1 rounded-full", partial ? "bg-danger" : "bg-ok")} />
                      <View
                        className={cn(
                          "flex-1 h-1 rounded-full",
                          d < TODAY ? "bg-ok" : "bg-secondary",
                        )}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          <View className="mt-3 flex-row flex-wrap gap-x-3 gap-y-1">
            <Legend color="bg-ok" label="Complétées" />
            <Legend color="bg-warn" label="En retard" />
            <Legend color="bg-danger" label="Manquées" />
            <Legend color="bg-secondary" label="À venir" />
          </View>
        </View>
      </Panel>

      <Panel>
        <PanelHeader
          title="Aujourd'hui — 26 juillet"
          subtitle="15 inspections attendues (5 véhicules × 3 quarts)"
        />
        <View>
          {(["morning", "evening", "night"] as const).map((s, idx) => {
            const items = ASSIGNMENTS.filter((a) => a.shift === s);
            return (
              <View
                key={s}
                className={`p-4 gap-2 ${idx > 0 ? "border-t border-hairline" : ""}`}
              >
                <Text className="text-[11px] uppercase tracking-widest text-ink-mute">
                  {SHIFTS[s].label} · {SHIFTS[s].start}
                </Text>
                {items.map((a) => {
                  const v = VEHICLES.find((x) => x.number === a.vehicleNumber)!;
                  return (
                    <View key={a.id} className="flex-row items-center gap-2">
                      <View className={cn("h-1.5 w-1.5 rounded-full", statusDot(a.status))} />
                      <Text className="font-mono text-sm text-ink w-12">{v.number}</Text>
                      <Text className="flex-1 text-sm text-ink-dim" numberOfLines={1}>
                        {v.make} {v.model}
                      </Text>
                      <Text className="font-mono text-xs text-ink-mute">
                        {a.submittedAt ?? "—"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </Panel>
    </ScrollView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={cn("h-2 w-2 rounded-full", color)} />
      <Text className="text-xs text-ink-mute">{label}</Text>
    </View>
  );
}

function statusDot(s: AssignmentStatus): string {
  if (s === "submitted") return "bg-ok";
  if (s === "in_progress") return "bg-info";
  if (s === "late") return "bg-danger";
  if (s === "missed") return "bg-danger";
  return "bg-ink-mute/40";
}
