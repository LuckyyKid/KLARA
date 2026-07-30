import { ScrollView, View, Text, Image } from "react-native";
import { CheckCircle2, AlertTriangle } from "lucide-react-native";
import { Modal, BtnGhost } from "./Modal";
import { useRole } from "@/lib/klara/role-context";
import {
  SECTION_LABEL,
  SECTION_ORDER,
  FUEL_LABEL,
  INSPECTION_TYPE_LABEL,
  COMPLIANCE_LABEL,
  type Inspection,
} from "@/lib/klara/inspection/types";
import { formatDuration, formatDateTime } from "@/lib/klara/inspection/formatters";

const OK = "rgb(34,197,94)";
const DANGER = "rgb(220,38,38)";

export function InspectionRecordDetailModal({
  record,
  onClose,
}: {
  record: Inspection | null;
  onClose: () => void;
}) {
  const { role } = useRole();
  if (!record) return null;
  const defects = record.answers.filter((a) => a.status === "defect");

  return (
    <Modal
      open
      onClose={onClose}
      title={`Rapport — véhicule ${record.vehicleNumber}`}
      footer={<BtnGhost onPress={onClose}>Fermer</BtnGhost>}
    >
      <ScrollView className="max-h-[520px]" contentContainerStyle={{ gap: 12 }}>
        <View className="rounded-lg border border-hairline bg-secondary/40 p-3 flex-row flex-wrap">
          <Info label="Superviseur" value={record.supervisorName} />
          <Info label="Type" value={INSPECTION_TYPE_LABEL[record.type]} />
          <Info label="Soumise" value={formatDateTime(record.submittedAt)} />
          <Info label="Quart" value={record.shift ?? "—"} />
          <Info label="Kilométrage" value={`${record.mileage.toLocaleString("fr-CA")} km`} />
          <Info label="Carburant" value={FUEL_LABEL[record.fuelLevel]} />
          {role !== "supervisor" && (
            <Info label="Durée" value={formatDuration(record.durationSeconds)} />
          )}
          <Info label="Conformité" value={COMPLIANCE_LABEL[record.complianceStatus]} />
        </View>

        <Text className="text-sm text-ink">
          <Text className={defects.length ? "text-danger font-semibold" : "text-ok font-semibold"}>
            {defects.length}
          </Text>{" "}
          défaut(s) · {record.anomalyIds.length} anomalie(s) générée(s)
        </Text>

        {SECTION_ORDER.map((section) => {
          const answers = record.answers.filter((a) => a.section === section);
          if (answers.length === 0) return null;
          return (
            <View key={section} className="gap-2">
              <Text className="text-[11px] uppercase tracking-widest text-ink-dim">
                {SECTION_LABEL[section]}
              </Text>
              {answers.map((a) => (
                <View key={a.questionId} className="rounded-lg border border-hairline p-3 gap-1.5">
                  <View className="flex-row items-start gap-2">
                    {a.status === "ok" ? (
                      <CheckCircle2 size={16} color={OK} />
                    ) : (
                      <AlertTriangle size={16} color={DANGER} />
                    )}
                    <Text className="flex-1 text-sm text-ink">{a.questionLabel}</Text>
                  </View>
                  {a.comment && (
                    <Text className="text-xs text-ink-dim pl-6">{a.comment}</Text>
                  )}
                  {a.followUpValues &&
                    Object.entries(a.followUpValues).map(([k, v]) => (
                      <Text key={k} className="text-xs text-ink-mute pl-6">
                        {Array.isArray(v) ? v.join(", ") : v}
                      </Text>
                    ))}
                  {a.photos && a.photos.length > 0 && (
                    <View className="flex-row gap-2 pl-6">
                      {a.photos.map((p) => (
                        <Image
                          key={p}
                          source={{ uri: p }}
                          className="h-14 w-14 rounded border border-hairline"
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 mb-2">
      <Text className="text-[11px] uppercase tracking-widest text-ink-mute">{label}</Text>
      <Text className="text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}
