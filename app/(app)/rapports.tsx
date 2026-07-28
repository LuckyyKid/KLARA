import { useMemo } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Download, Printer } from "lucide-react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import {
  ANOMALIES_8W,
  COMPLETION_30D,
  MILEAGE_14D,
  VEHICLES,
  ANOMALIES,
} from "@/lib/klara/mock-data";
import { cn } from "@/lib/utils";

const INK_DIM = "rgb(66,71,79)";

export default function RapportsScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-ink-mute">Période · 30 derniers jours · YUL</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <ActionBtn icon={<Printer size={14} color={INK_DIM} />} label="Imprimer" />
        <ActionBtn icon={<Download size={14} color={INK_DIM} />} label="PDF" />
        <ActionBtn icon={<Download size={14} color={INK_DIM} />} label="Excel" />
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Metric label="Complétion" value="94 %" sub="+2 pts vs mois -1" />
        <Metric label="À temps" value="88 %" sub="12 % en retard" />
        <Metric label="Manquées" value="3" sub="30 j" />
        <Metric label="Temps moyen" value="4 m 12" sub="par inspection" />
      </View>

      <Panel>
        <PanelHeader title="Complétion quotidienne" subtitle="30 jours" />
        <View className="p-3">
          <BarChart data={COMPLETION_30D} color="bg-info" />
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="Anomalies par semaine" subtitle="8 semaines" />
        <View className="p-3">
          <BarChart data={ANOMALIES_8W} color="bg-warn" gap={3} />
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="Kilométrage cumulé" subtitle="14 jours" />
        <View className="p-3">
          <LineChart data={MILEAGE_14D} />
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="Anomalies par véhicule" subtitle="30 jours" />
        <View>
          {VEHICLES.map((v, i) => {
            const n = ANOMALIES.filter((a) => a.vehicleNumber === v.number).length;
            return (
              <View
                key={v.id}
                className={cn(
                  "px-4 py-2.5 flex-row items-center gap-3",
                  i > 0 && "border-t border-hairline",
                )}
              >
                <Text className="font-mono text-sm text-ink w-12">{v.number}</Text>
                <Text className="flex-1 text-sm text-ink" numberOfLines={1}>
                  {v.make} {v.model}
                </Text>
                <View className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
                  <View
                    className="h-full bg-warn"
                    style={{ width: `${Math.min(n * 30, 100)}%` }}
                  />
                </View>
                <Text className="font-mono text-sm w-6 text-right text-ink">{n}</Text>
              </View>
            );
          })}
        </View>
      </Panel>
    </ScrollView>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View className="rounded-xl border border-hairline bg-card p-4 min-w-[45%] flex-1">
      <Text className="text-[11px] uppercase tracking-widest text-ink-mute">{label}</Text>
      <Text className="font-mono text-2xl font-semibold text-ink mt-1">{value}</Text>
      <Text className="text-xs text-ink-mute mt-0.5">{sub}</Text>
    </View>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Pressable className="flex-row items-center gap-1.5 h-8 px-3 rounded border border-hairline bg-surface">
      {icon}
      <Text className="text-xs text-ink-dim">{label}</Text>
    </Pressable>
  );
}

function BarChart({ data, color, gap = 2 }: { data: number[]; color: string; gap?: number }) {
  const max = useMemo(() => Math.max(...data, 1), [data]);
  return (
    <View className="h-32 flex-row items-end" style={{ gap }}>
      {data.map((v, i) => (
        <View
          key={i}
          className={cn("flex-1 rounded-t-sm", color)}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </View>
  );
}

function LineChart({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <View className="h-32 flex-row items-end gap-0.5">
      {data.map((v, i) => (
        <View key={i} className="flex-1 items-center justify-end">
          <View
            className="w-1 rounded-full bg-info"
            style={{ height: `${((v - min) / range) * 100}%` }}
          />
        </View>
      ))}
    </View>
  );
}
