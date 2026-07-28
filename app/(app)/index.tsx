import { View, Text, ScrollView } from "react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { StatusBadge, StateBadge } from "@/components/klara/StatusBadge";
import { ASSIGNMENTS, VEHICLES, ANOMALIES, NOW_LABEL } from "@/lib/klara/mock-data";
import { useRole, CURRENT_USER, ROLE_LABEL } from "@/lib/klara/role-context";

export default function Dashboard() {
  const { role } = useRole();
  const user = CURRENT_USER[role];
  const eveningAssignments = ASSIGNMENTS.filter((a) => a.shift === "evening");
  const submitted = eveningAssignments.filter((a) => a.status === "submitted").length;
  const inProgress = eveningAssignments.filter((a) => a.status === "in_progress").length;
  const late = eveningAssignments.filter((a) => a.status === "late").length;
  const openAnomalies = ANOMALIES.filter((a) => a.status !== "resolved");
  const criticalVehicles = VEHICLES.filter((v) => v.state === "critique" || v.state === "hors_service").length;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <View className="gap-1">
        <Text className="label-mono text-ink-mute uppercase text-[11px] tracking-widest">
          {ROLE_LABEL[role]} · {user.location}
        </Text>
        <Text className="text-xl font-semibold tracking-tight text-ink">
          Bonjour, {user.name.split(" ")[0]}
        </Text>
        <Text className="text-sm text-ink-mute">{NOW_LABEL}</Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Kpi label="Inspections complétées" value={String(submitted)} sub="quart du soir" />
        <Kpi label="En cours" value={String(inProgress)} sub="véhicules en inspection" />
        <Kpi label="En retard" value={String(late)} sub="à traiter" tone="danger" />
        <Kpi label="Véhicules critiques" value={String(criticalVehicles)} sub="hors service" tone={criticalVehicles > 0 ? "warn" : "default"} />
      </View>

      <Panel>
        <PanelHeader title="Quart du soir en cours" subtitle="Progression des inspections" />
        <View className="p-4 gap-3">
          {eveningAssignments.map((a) => (
            <View key={a.id} className="flex-row items-center justify-between py-2 border-b border-hairline/60">
              <View className="flex-1">
                <Text className="text-sm font-medium text-ink">Véhicule {a.vehicleNumber}</Text>
                <Text className="text-xs text-ink-mute">{a.supervisor}</Text>
              </View>
              <StatusBadge status={a.status} />
            </View>
          ))}
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="Anomalies actives" subtitle={`${openAnomalies.length} en cours`} />
        <View className="p-4 gap-3">
          {openAnomalies.slice(0, 5).map((a) => (
            <View key={a.id} className="flex-row items-start justify-between gap-3 py-2 border-b border-hairline/60">
              <View className="flex-1">
                <Text className="text-sm font-medium text-ink" numberOfLines={2}>{a.title}</Text>
                <Text className="text-xs text-ink-mute mt-0.5">Véhicule {a.vehicleNumber} · {a.area}</Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-xs text-ink-mute">{a.reportedAt}</Text>
              </View>
            </View>
          ))}
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="État de la flotte" subtitle={`${VEHICLES.length} véhicules`} />
        <View className="p-4 gap-3">
          {VEHICLES.map((v) => (
            <View key={v.id} className="flex-row items-center justify-between py-2 border-b border-hairline/60">
              <View className="flex-1">
                <Text className="text-sm font-medium text-ink">
                  {v.number} · {v.make} {v.model}
                </Text>
                <Text className="text-xs text-ink-mute">{v.plate} · {v.mileage.toLocaleString("fr-CA")} km</Text>
              </View>
              <StateBadge state={v.state} />
            </View>
          ))}
        </View>
      </Panel>

      <View className="h-4" />
    </ScrollView>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warn" | "danger";
}) {
  const toneCls = tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : "text-ink";
  return (
    <View className="rounded-xl border border-hairline bg-card p-4" style={{ flexGrow: 1, minWidth: 160 }}>
      <Text className="label-mono text-ink-mute uppercase text-[11px] tracking-widest">{label}</Text>
      <Text className={`text-3xl font-mono font-semibold mt-1 ${toneCls}`}>{value}</Text>
      {sub && <Text className="text-xs text-ink-mute mt-1">{sub}</Text>}
    </View>
  );
}
