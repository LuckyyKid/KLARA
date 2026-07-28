import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Plus, Pencil, Trash2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { StateBadge } from "@/components/klara/StatusBadge";
import { useStore } from "@/lib/klara/store";
import { Modal, Field, Input, BtnPrimary, BtnGhost, BtnDanger } from "@/components/klara/Modal";
import { Select } from "@/components/klara/Select";
import type { Vehicle, VehicleState } from "@/lib/klara/mock-data";

const STATES: VehicleState[] = ["conforme", "mineure", "importante", "critique", "hors_service", "inconnu"];

type Draft = Omit<Vehicle, "id">;
const empty: Draft = {
  number: "",
  make: "",
  model: "",
  color: "",
  year: new Date().getFullYear(),
  plate: "",
  mileage: 0,
  state: "conforme",
  location: "YUL",
  openAnomaly: "",
};

const INK_DIM = "rgb(66,71,79)";
const DANGER = "rgb(220,38,38)";
const PRIMARY_FG = "rgb(250,250,247)";

export default function GestionVehiculesScreen() {
  const { vehicles, addVehicle, updateVehicle, removeVehicle } = useStore();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Vehicle | null>(null);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader
          title="Flotte"
          subtitle="Ajout, modification et retrait des véhicules · admin"
          right={
            <BtnPrimary onPress={() => setCreating(true)}>
              <Plus size={14} color={PRIMARY_FG} />
              <Text className="text-primary-foreground text-sm font-medium">Ajouter</Text>
            </BtnPrimary>
          }
        />

        <View className="p-3 gap-2">
          {vehicles.length === 0 ? (
            <Text className="text-center text-sm text-ink-mute py-8">Aucun véhicule.</Text>
          ) : (
            vehicles.map((v) => (
              <View key={v.id} className="p-3 rounded-lg border border-hairline bg-surface gap-2">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">
                      Véhicule <Text className="font-mono">{v.number}</Text>
                    </Text>
                    <Text className="text-xs text-ink-mute">
                      {v.make} {v.model} · {v.year}
                    </Text>
                  </View>
                  <StateBadge state={v.state} />
                </View>
                <View className="flex-row flex-wrap gap-x-3">
                  <Text className="text-xs font-mono text-ink-dim">{v.plate}</Text>
                  <Text className="text-xs font-mono text-ink-dim">
                    {v.mileage.toLocaleString("fr-CA")} km
                  </Text>
                  <Text className="text-xs text-ink-dim">{v.location}</Text>
                </View>
                <View className="flex-row gap-2 pt-1">
                  <Pressable
                    onPress={() => setEditing(v)}
                    className="flex-row items-center gap-1 h-8 px-3 rounded border border-hairline bg-background"
                  >
                    <Pencil size={12} color={INK_DIM} />
                    <Text className="text-xs text-ink-dim">Modifier</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmDel(v)}
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
      </Panel>

      <VehicleForm
        open={creating}
        title="Nouveau véhicule"
        initial={empty}
        onClose={() => setCreating(false)}
        onSubmit={(d) => {
          addVehicle(d);
          setCreating(false);
          Toast.show({ type: "success", text1: `Véhicule ${d.number} créé` });
        }}
      />
      <VehicleForm
        open={!!editing}
        title={`Modifier véhicule ${editing?.number ?? ""}`}
        initial={editing ?? empty}
        onClose={() => setEditing(null)}
        onSubmit={(d) => {
          if (editing) {
            updateVehicle(editing.id, d);
            Toast.show({ type: "success", text1: "Véhicule mis à jour" });
          }
          setEditing(null);
        }}
      />
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Supprimer ce véhicule ?"
        footer={
          <>
            <BtnGhost onPress={() => setConfirmDel(null)}>Annuler</BtnGhost>
            <BtnDanger
              onPress={() => {
                if (confirmDel) {
                  removeVehicle(confirmDel.id);
                  Toast.show({
                    type: "success",
                    text1: `Véhicule ${confirmDel.number} supprimé`,
                  });
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
          Le véhicule{" "}
          <Text className="font-medium text-ink">
            {confirmDel?.number} · {confirmDel?.make} {confirmDel?.model}
          </Text>{" "}
          sera retiré de la flotte.
        </Text>
      </Modal>
    </ScrollView>
  );
}

function VehicleForm({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial: Draft;
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
              if (!d.number || !d.make || !d.model) {
                Toast.show({
                  type: "error",
                  text1: "Numéro, marque et modèle requis",
                });
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
      <ScrollView className="max-h-[440px]" contentContainerStyle={{ gap: 10 }}>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Field label="Numéro">
              <Input value={d.number} onChangeText={(v) => set("number", v)} />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Plaque">
              <Input value={d.plate} onChangeText={(v) => set("plate", v)} />
            </Field>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Field label="Marque">
              <Input value={d.make} onChangeText={(v) => set("make", v)} />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Modèle">
              <Input value={d.model} onChangeText={(v) => set("model", v)} />
            </Field>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Field label="Couleur">
              <Input value={d.color} onChangeText={(v) => set("color", v)} />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Année">
              <Input
                value={String(d.year)}
                onChangeText={(v) => set("year", Number(v) || 0)}
                keyboardType="number-pad"
              />
            </Field>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Field label="Kilométrage">
              <Input
                value={String(d.mileage)}
                onChangeText={(v) => set("mileage", Number(v) || 0)}
                keyboardType="number-pad"
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Emplacement">
              <Input value={d.location} onChangeText={(v) => set("location", v)} />
            </Field>
          </View>
        </View>
        <Field label="État">
          <Select
            value={d.state}
            onChange={(v) => set("state", v as VehicleState)}
            options={STATES.map((s) => ({ key: s, label: s }))}
          />
        </Field>
        <Field label="Anomalie ouverte">
          <Input value={d.openAnomaly ?? ""} onChangeText={(v) => set("openAnomaly", v)} />
        </Field>
      </ScrollView>
    </Modal>
  );
}
