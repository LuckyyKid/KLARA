import { ScrollView, View, Text } from "react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { useRole } from "@/lib/klara/role-context";
import { cn } from "@/lib/utils";

export default function ParametresScreen() {
  const { role } = useRole();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader title="Kilométrage" subtitle="Alerte affichée au superviseur (jamais bloquante)" />
        <View className="p-4 flex-row flex-wrap gap-3">
          <SettingField label="Saut anormal (km / quart)" value="1 500" />
          <SettingField label="Confirmation obligatoire" value="Oui" />
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="Maintenance au kilométrage" subtitle="Visible gestionnaires · § 9.2" />
        <View>
          <Rule label="Vidange d'huile" every="8 000 km" />
          <Rule label="Rotation des pneus" every="10 000 km" />
          <Rule label="Filtre à air" every="30 000 km" />
          <Rule label="Freins — inspection" every="20 000 km" />
        </View>
      </Panel>

      {role === "admin" && (
        <Panel>
          <PanelHeader title="Emplacements" subtitle="Réservé administrateur" />
          <View className="p-4">
            <Text className="text-sm text-ink-dim">YUL — Aéroport Montréal-Trudeau</Text>
          </View>
        </Panel>
      )}
    </ScrollView>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-lg border border-hairline p-3 min-w-[45%] flex-1">
      <Text className="text-[11px] uppercase tracking-widest text-ink-mute">{label}</Text>
      <Text className="mt-1 font-mono text-sm text-ink">{value}</Text>
    </View>
  );
}

function Rule({ label, every, first }: { label: string; every: string; first?: boolean }) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between px-4 py-3 border-t border-hairline",
        first && "border-t-0",
      )}
    >
      <Text className="text-sm text-ink">{label}</Text>
      <Text className="font-mono text-xs text-ink-mute">tous les {every}</Text>
    </View>
  );
}
