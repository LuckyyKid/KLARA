import { useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Eye } from "lucide-react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { StatusBadge } from "@/components/klara/StatusBadge";
import { SearchInput, FilterPills, Pagination, usePaginated } from "@/components/klara/ListUtils";
import {
  ASSIGNMENTS,
  SHIFTS,
  VEHICLES,
  STATUS_LABEL,
  type AssignmentStatus,
  type Assignment,
} from "@/lib/klara/mock-data";
import { useStore } from "@/lib/klara/store";
import { useRole } from "@/lib/klara/role-context";
import { INSPECTION_TYPE_LABEL, type Inspection } from "@/lib/klara/inspection/types";
import { formatDuration } from "@/lib/klara/inspection/formatters";
import { InspectionDetailModal } from "@/components/klara/InspectionDetailModal";
import { InspectionRecordDetailModal } from "@/components/klara/InspectionRecordDetailModal";

const FILTERS: { key: "all" | AssignmentStatus; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "in_progress", label: "En cours" },
  { key: "submitted", label: "Complétées" },
  { key: "late", label: "En retard" },
  { key: "missed", label: "Manquées" },
  { key: "excused", label: "Excusées" },
];

const INFO = "rgb(59,130,246)";

export default function InspectionsScreen() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Inspection | null>(null);
  const { inspections } = useStore();
  const { role } = useRole();

  const rows = useMemo(() => {
    const base = filter === "all" ? ASSIGNMENTS : ASSIGNMENTS.filter((a) => a.status === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((a) => {
      const v = VEHICLES.find((x) => x.number === a.vehicleNumber);
      return [a.vehicleNumber, a.supervisor, SHIFTS[a.shift].label, v?.make ?? "", v?.model ?? "", v?.plate ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [filter, q]);

  const { page, setPage, total, slice, count, pageSize } = usePaginated(rows);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      {inspections.length > 0 && (
        <Panel>
          <PanelHeader
            title="Inspections soumises dans la démo"
            subtitle="Données enregistrées depuis le formulaire superviseur"
          />
          <View className="p-3 gap-2">
            {inspections.map((inspection) => {
              const defects = inspection.answers.filter((a) => a.status === "defect").length;
              return (
                <View
                  key={inspection.id}
                  className="p-3 rounded-lg border border-hairline bg-surface gap-1"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-ink">
                      Véhicule <Text className="font-mono">{inspection.vehicleNumber}</Text>
                    </Text>
                    <Pressable
                      onPress={() => setSelectedRecord(inspection)}
                      className="flex-row items-center gap-1"
                    >
                      <Eye size={12} color={INFO} />
                      <Text className="text-info text-xs">Ouvrir</Text>
                    </Pressable>
                  </View>
                  <Text className="text-xs text-ink-mute">
                    {INSPECTION_TYPE_LABEL[inspection.type]} · {inspection.supervisorName}
                  </Text>
                  <View className="flex-row flex-wrap gap-x-3 gap-y-1">
                    <Text className="text-xs font-mono text-ink-mute">
                      {new Date(inspection.submittedAt).toLocaleString("fr-CA", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </Text>
                    {role !== "supervisor" && (
                      <Text className="text-xs font-mono text-ink-mute">
                        {formatDuration(inspection.durationSeconds)}
                      </Text>
                    )}
                    <Text className="text-xs font-mono text-ink-mute">
                      {inspection.mileage.toLocaleString("fr-CA")} km
                    </Text>
                    <Text className={`text-xs font-medium ${defects ? "text-danger" : "text-ok"}`}>
                      {defects} défaut{defects > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Panel>
      )}

      <Panel>
        <View className="p-3 gap-3 border-b border-hairline">
          <SearchInput value={q} onChange={setQ} placeholder="Véhicule, superviseur, quart..." />
          <FilterPills
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((f) => ({
              key: f.key,
              label: f.label,
              count:
                f.key === "all"
                  ? ASSIGNMENTS.length
                  : ASSIGNMENTS.filter((a) => a.status === f.key).length,
            }))}
          />
        </View>

        <View className="p-3 gap-2">
          {slice.length === 0 ? (
            <Text className="text-center text-ink-mute text-sm py-10">
              Aucune inspection ne correspond
              {filter !== "all" ? ` (« ${STATUS_LABEL[filter as AssignmentStatus]} »)` : ""}.
            </Text>
          ) : (
            slice.map((a) => {
              const v = VEHICLES.find((x) => x.number === a.vehicleNumber)!;
              const late = a.status === "late";
              return (
                <Pressable
                  key={a.id}
                  onPress={() => setSelected(a)}
                  className={`p-3 rounded-lg border border-hairline gap-1.5 ${late ? "bg-danger-soft/40" : "bg-surface"}`}
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-ink">
                        Véhicule <Text className="font-mono">{v.number}</Text>
                      </Text>
                      <Text className="text-xs text-ink-mute">
                        {v.make} {v.model} · {SHIFTS[a.shift].label}
                      </Text>
                    </View>
                    <StatusBadge status={a.status} />
                  </View>
                  <Text className="text-xs text-ink-dim">{a.supervisor}</Text>
                  <View className="flex-row flex-wrap gap-x-3">
                    {a.submittedAt && (
                      <Text className="text-xs font-mono text-ink-mute">Soumise {a.submittedAt}</Text>
                    )}
                    {a.mileage && (
                      <Text className="text-xs font-mono text-ink-mute">
                        {a.mileage.toLocaleString("fr-CA")} km
                      </Text>
                    )}
                  </View>
                  {a.status === "in_progress" && (
                    <Text className="text-xs text-ink-mute">Progression {a.progress} %</Text>
                  )}
                  {a.status === "late" && (
                    <Text className="text-xs text-danger">{a.lateMinutes} min de retard</Text>
                  )}
                  {a.status === "pending" && (
                    <Text className="text-xs text-ink-mute">Prévue à {SHIFTS[a.shift].start}</Text>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        <Pagination page={page} total={total} count={count} pageSize={pageSize} onChange={setPage} />
      </Panel>

      <InspectionDetailModal assignment={selected} onClose={() => setSelected(null)} />
      <InspectionRecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </ScrollView>
  );
}
