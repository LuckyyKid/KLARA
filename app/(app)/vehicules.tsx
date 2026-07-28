import { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { Search } from "lucide-react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { StateBadge } from "@/components/klara/StatusBadge";
import { useStore } from "@/lib/klara/store";
import type { VehicleState } from "@/lib/klara/mock-data";
import { cn } from "@/lib/utils";

const FILTERS: { key: VehicleState | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "conforme", label: "Conforme" },
  { key: "mineure", label: "Mineure" },
  { key: "importante", label: "Importante" },
  { key: "critique", label: "Critique" },
  { key: "hors_service", label: "Hors service" },
];

export default function VehiculesScreen() {
  const { vehicles } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VehicleState | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (filter !== "all" && v.state !== filter) return false;
      if (!q) return true;
      return (
        v.number.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        `${v.make} ${v.model}`.toLowerCase().includes(q)
      );
    });
  }, [vehicles, query, filter]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-row items-center gap-2 h-10 px-3 rounded-md border border-hairline bg-surface">
        <Search size={16} color="rgb(138,142,149)" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un véhicule, une plaque..."
          placeholderTextColor="rgb(138,142,149)"
          className="flex-1 text-sm text-ink"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full border",
                active ? "bg-ink border-ink" : "bg-surface border-hairline",
              )}
            >
              <Text className={cn("text-xs", active ? "text-primary-foreground font-medium" : "text-ink-dim")}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Panel>
        <PanelHeader title={`${filtered.length} véhicule${filtered.length > 1 ? "s" : ""}`} subtitle="Flotte YUL" />
        <View className="p-4 gap-3">
          {filtered.length === 0 ? (
            <Text className="text-sm text-ink-mute text-center py-6">Aucun véhicule ne correspond.</Text>
          ) : (
            filtered.map((v) => (
              <View key={v.id} className="p-3 rounded-lg border border-hairline bg-surface gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-ink">Véhicule {v.number}</Text>
                  <StateBadge state={v.state} />
                </View>
                <Text className="text-sm text-ink">{v.make} {v.model} · {v.color}</Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-xs text-ink-mute">{v.plate}</Text>
                  <Text className="text-xs text-ink-mute">·</Text>
                  <Text className="text-xs font-mono text-ink-mute">{v.mileage.toLocaleString("fr-CA")} km</Text>
                  <Text className="text-xs text-ink-mute">·</Text>
                  <Text className="text-xs text-ink-mute">{v.year}</Text>
                </View>
                {v.openAnomaly && (
                  <Text className="text-xs text-danger">⚠ {v.openAnomaly}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </Panel>

      <View className="h-4" />
    </ScrollView>
  );
}
