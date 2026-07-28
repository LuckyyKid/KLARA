import { ScrollView, View, Text } from "react-native";
import { Modal, BtnGhost } from "./Modal";
import { StateBadge } from "./StatusBadge";
import type { Vehicle } from "@/lib/klara/mock-data";
import { ASSIGNMENTS, SHIFTS, STATUS_LABEL } from "@/lib/klara/mock-data";
import { useStore } from "@/lib/klara/store";

export function VehicleDetailModal({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const { anomalies } = useStore();
  if (!vehicle) return null;
  const insp = ASSIGNMENTS.filter((a) => a.vehicleNumber === vehicle.number);
  const anos = anomalies.filter((a) => a.vehicleNumber === vehicle.number);

  return (
    <Modal
      open={!!vehicle}
      onClose={onClose}
      title={`Fiche véhicule ${vehicle.number}`}
      footer={<BtnGhost onPress={onClose}>Fermer</BtnGhost>}
    >
      <ScrollView className="max-h-[500px]" contentContainerStyle={{ gap: 12 }}>
        <View className="flex-row flex-wrap">
          <Info label="Modèle" value={`${vehicle.make} ${vehicle.model}`} />
          <Info label="Année" value={String(vehicle.year)} />
          <Info label="Couleur" value={vehicle.color} />
          <Info label="Plaque" value={vehicle.plate} />
          <Info label="Kilométrage" value={`${vehicle.mileage.toLocaleString("fr-CA")} km`} />
          <Info label="Emplacement" value={vehicle.location} />
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-[11px] uppercase tracking-widest text-ink-dim">État</Text>
          <StateBadge state={vehicle.state} />
        </View>

        {vehicle.openAnomaly && (
          <View>
            <Text className="text-[11px] uppercase tracking-widest text-ink-dim mb-1">
              Anomalie ouverte
            </Text>
            <Text className="text-sm text-ink">{vehicle.openAnomaly}</Text>
          </View>
        )}

        <View>
          <Text className="text-[11px] uppercase tracking-widest text-ink-dim mb-2">
            Inspections du jour
          </Text>
          <View className="rounded-md border border-hairline">
            {insp.length === 0 ? (
              <Text className="px-3 py-2 text-sm text-ink-mute">Aucune inspection.</Text>
            ) : (
              insp.map((a, i) => (
                <View
                  key={a.id}
                  className={`flex-row items-center gap-3 px-3 py-2 ${i > 0 ? "border-t border-hairline" : ""}`}
                >
                  <Text className="flex-1 text-sm text-ink">{SHIFTS[a.shift].label}</Text>
                  <Text className="text-xs text-ink-mute">{a.submittedAt ?? "—"}</Text>
                  <Text className="text-xs font-medium text-ink">{STATUS_LABEL[a.status]}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View>
          <Text className="text-[11px] uppercase tracking-widest text-ink-dim mb-2">
            Anomalies liées
          </Text>
          <View className="rounded-md border border-hairline">
            {anos.length === 0 ? (
              <Text className="px-3 py-2 text-sm text-ink-mute">Aucune anomalie.</Text>
            ) : (
              anos.map((a, i) => (
                <View
                  key={a.id}
                  className={`px-3 py-2 ${i > 0 ? "border-t border-hairline" : ""}`}
                >
                  <Text className="text-sm font-medium text-ink">{a.title}</Text>
                  <Text className="text-xs text-ink-mute">
                    {a.area} · {a.severity} · {a.status}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 mb-2">
      <Text className="text-[11px] uppercase tracking-widest text-ink-dim">{label}</Text>
      <Text className="mt-0.5 text-sm text-ink">{value}</Text>
    </View>
  );
}
