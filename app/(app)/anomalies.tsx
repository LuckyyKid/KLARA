import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Plus, Pencil, Trash2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { useStore } from "@/lib/klara/store";
import { Modal, Field, Input, BtnPrimary, BtnGhost, BtnDanger } from "@/components/klara/Modal";
import { Select } from "@/components/klara/Select";
import { SearchInput, FilterPills, Pagination, usePaginated } from "@/components/klara/ListUtils";
import type { Anomaly } from "@/lib/klara/mock-data";
import { cn } from "@/lib/utils";

const SEVS = ["mineure", "moderee", "importante", "critique"] as const;
const IMPACTS = ["usable", "usable_caution", "unusable"] as const;
const PRIOS = ["basse", "moyenne", "haute", "urgente"] as const;
const STATUSES = ["open", "confirmed", "in_progress", "resolved", "rejected"] as const;

type Draft = Omit<Anomaly, "id">;
const today = new Date().toLocaleDateString("fr-CA", { day: "2-digit", month: "short" });
const empty: Draft = {
  vehicleNumber: "",
  title: "",
  area: "Carrosserie",
  severity: "mineure",
  impact: "usable",
  priority: "basse",
  status: "open",
  reportedBy: "Démo",
  reportedAt: today,
};

const statusTone: Record<Anomaly["status"], string> = {
  open: "bg-warn/10 border-warn/30",
  confirmed: "bg-info/10 border-info/30",
  in_progress: "bg-info/10 border-info/30",
  resolved: "bg-ok/10 border-ok/30",
  rejected: "bg-secondary border-hairline",
};
const statusTextTone: Record<Anomaly["status"], string> = {
  open: "text-warn",
  confirmed: "text-info",
  in_progress: "text-info",
  resolved: "text-ok",
  rejected: "text-ink-mute",
};
const statusLabel: Record<Anomaly["status"], string> = {
  open: "Ouverte",
  confirmed: "Confirmée",
  in_progress: "En cours",
  resolved: "Résolue",
  rejected: "Rejetée",
};

const INK_DIM = "rgb(66,71,79)";
const DANGER = "rgb(220,38,38)";

export default function AnomaliesScreen() {
  const { anomalies, vehicles, addAnomaly, updateAnomaly, removeAnomaly } = useStore();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Anomaly | null>(null);
  const [confirmDel, setConfirmDel] = useState<Anomaly | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Anomaly["status"]>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return anomalies.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!query) return true;
      return [a.vehicleNumber, a.title, a.area, a.severity, a.priority, a.reportedBy]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [anomalies, q, filter]);

  const { page, setPage, total, slice, count, pageSize } = usePaginated(filtered);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader
          title="Anomalies"
          subtitle={`${anomalies.length} signalements`}
          right={
            <BtnPrimary onPress={() => setCreating(true)}>
              <Plus size={14} color="rgb(250,250,247)" />
              <Text className="text-primary-foreground text-sm font-medium">Ajouter</Text>
            </BtnPrimary>
          }
        />

        <View className="p-3 gap-3 border-b border-hairline">
          <SearchInput value={q} onChange={setQ} placeholder="Véhicule, titre, zone, priorité..." />
          <FilterPills
            value={filter}
            onChange={setFilter}
            options={[
              { key: "all", label: "Toutes", count: anomalies.length },
              ...STATUSES.map((s) => ({
                key: s as Anomaly["status"],
                label: statusLabel[s],
                count: anomalies.filter((a) => a.status === s).length,
              })),
            ]}
          />
        </View>

        <View className="p-3 gap-2">
          {slice.length === 0 ? (
            <Text className="text-center text-ink-mute text-sm py-8">
              Aucune anomalie ne correspond.
            </Text>
          ) : (
            slice.map((a) => (
              <View
                key={a.id}
                className="p-3 rounded-lg border border-hairline bg-surface gap-2"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">{a.title}</Text>
                    <Text className="text-xs text-ink-mute">
                      Véhicule <Text className="font-mono">{a.vehicleNumber}</Text> · {a.area}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      "rounded-full border px-2 py-0.5",
                      statusTone[a.status],
                    )}
                  >
                    <Text className={cn("text-xs", statusTextTone[a.status])}>
                      {statusLabel[a.status]}
                    </Text>
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-x-3">
                  <Text className="text-xs text-ink-dim">Sévérité: {a.severity}</Text>
                  <Text className="text-xs text-ink-dim">Priorité: {a.priority}</Text>
                </View>
                <Text className="text-xs text-ink-mute">
                  {a.reportedBy} · {a.reportedAt}
                </Text>
                <View className="flex-row gap-2 pt-1">
                  <Pressable
                    onPress={() => setEditing(a)}
                    className="flex-row items-center gap-1 h-8 px-3 rounded border border-hairline bg-background"
                  >
                    <Pencil size={12} color={INK_DIM} />
                    <Text className="text-xs text-ink-dim">Modifier</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmDel(a)}
                    className="flex-row items-center gap-1 h-8 px-3 rounded border border-danger/30 bg-danger/5"
                  >
                    <Trash2 size={12} color={DANGER} />
                    <Text className="text-xs text-danger">Supprimer</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Pagination page={page} total={total} count={count} pageSize={pageSize} onChange={setPage} />
      </Panel>

      <AnomalyForm
        open={creating}
        title="Nouvelle anomalie"
        initial={{ ...empty, vehicleNumber: vehicles[0]?.number ?? "" }}
        vehicleNumbers={vehicles.map((v) => v.number)}
        onClose={() => setCreating(false)}
        onSubmit={(d) => {
          addAnomaly(d);
          setCreating(false);
          Toast.show({ type: "success", text1: "Anomalie créée" });
        }}
      />
      <AnomalyForm
        open={!!editing}
        title="Modifier anomalie"
        initial={editing ?? empty}
        vehicleNumbers={vehicles.map((v) => v.number)}
        onClose={() => setEditing(null)}
        onSubmit={(d) => {
          if (editing) {
            updateAnomaly(editing.id, d);
            Toast.show({ type: "success", text1: "Anomalie mise à jour" });
          }
          setEditing(null);
        }}
      />
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Supprimer cette anomalie ?"
        footer={
          <>
            <BtnGhost onPress={() => setConfirmDel(null)}>Annuler</BtnGhost>
            <BtnDanger
              onPress={() => {
                if (confirmDel) {
                  removeAnomaly(confirmDel.id);
                  Toast.show({ type: "success", text1: "Anomalie supprimée" });
                }
                setConfirmDel(null);
              }}
            >
              Supprimer
            </BtnDanger>
          </>
        }
      >
        <Text className="text-sm text-ink-dim">
          Le signalement{" "}
          <Text className="font-medium text-ink">{confirmDel?.title}</Text> sera retiré.
        </Text>
      </Modal>
    </ScrollView>
  );
}

function AnomalyForm({
  open,
  title,
  initial,
  vehicleNumbers,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial: Draft;
  vehicleNumbers: string[];
  onClose: () => void;
  onSubmit: (d: Draft) => void;
}) {
  const [d, setD] = useState<Draft>(initial);
  useEffect(() => {
    if (open) setD(initial);
  }, [open, initial]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <BtnGhost onPress={onClose}>Annuler</BtnGhost>
          <BtnPrimary
            onPress={() => {
              if (!d.title.trim() || !d.vehicleNumber) {
                Toast.show({ type: "error", text1: "Véhicule et titre requis" });
                return;
              }
              onSubmit(d);
            }}
          >
            Enregistrer
          </BtnPrimary>
        </>
      }
    >
      <ScrollView className="max-h-[420px]" contentContainerStyle={{ gap: 10 }}>
        <Field label="Véhicule">
          <Select
            value={d.vehicleNumber}
            onChange={(v) => set("vehicleNumber", v)}
            options={vehicleNumbers.map((n) => ({ key: n, label: n }))}
          />
        </Field>
        <Field label="Titre">
          <Input value={d.title} onChangeText={(v) => set("title", v)} />
        </Field>
        <Field label="Zone">
          <Input value={d.area} onChangeText={(v) => set("area", v)} />
        </Field>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Field label="Sévérité">
              <Select
                value={d.severity}
                onChange={(v) => set("severity", v as Anomaly["severity"])}
                options={SEVS.map((s) => ({ key: s, label: s }))}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Impact">
              <Select
                value={d.impact}
                onChange={(v) => set("impact", v as Anomaly["impact"])}
                options={IMPACTS.map((s) => ({ key: s, label: s }))}
              />
            </Field>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Field label="Priorité">
              <Select
                value={d.priority}
                onChange={(v) => set("priority", v as Anomaly["priority"])}
                options={PRIOS.map((s) => ({ key: s, label: s }))}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Statut">
              <Select
                value={d.status}
                onChange={(v) => set("status", v as Anomaly["status"])}
                options={STATUSES.map((s) => ({ key: s, label: statusLabel[s] }))}
              />
            </Field>
          </View>
        </View>
        <Field label="Signalée par">
          <Input value={d.reportedBy} onChangeText={(v) => set("reportedBy", v)} />
        </Field>
        <Field label="Date">
          <Input value={d.reportedAt} onChangeText={(v) => set("reportedAt", v)} />
        </Field>
      </ScrollView>
    </Modal>
  );
}
