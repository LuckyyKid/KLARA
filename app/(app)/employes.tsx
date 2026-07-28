import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Plus, Pencil, Trash2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { useStore, type Employee } from "@/lib/klara/store";
import { ROLE_LABEL } from "@/lib/klara/role-context";
import { Modal, Field, Input, BtnPrimary, BtnGhost, BtnDanger } from "@/components/klara/Modal";
import { Select } from "@/components/klara/Select";
import type { Role } from "@/lib/klara/mock-data";

type Draft = Omit<Employee, "id">;
const empty: Draft = {
  name: "",
  role: "supervisor",
  shift: "Matin",
  email: "",
  lastActive: "à l'instant",
};
const ROLES: Role[] = ["supervisor", "manager", "admin"];
const SHIFT_OPTS = ["Matin", "Soir", "Nuit", "—"];

const INK_DIM = "rgb(66,71,79)";
const DANGER = "rgb(220,38,38)";
const PRIMARY_FG = "rgb(250,250,247)";

export default function EmployesScreen() {
  const { employees, addEmployee, updateEmployee, removeEmployee } = useStore();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [confirmDel, setConfirmDel] = useState<Employee | null>(null);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader
          title="Employés"
          subtitle={`${employees.length} comptes actifs`}
          right={
            <BtnPrimary onPress={() => setCreating(true)}>
              <Plus size={14} color={PRIMARY_FG} />
              <Text className="text-primary-foreground text-sm font-medium">Ajouter</Text>
            </BtnPrimary>
          }
        />
        <View className="p-3 gap-2">
          {employees.length === 0 ? (
            <Text className="text-center text-ink-mute text-sm py-8">Aucun employé.</Text>
          ) : (
            employees.map((u) => (
              <View
                key={u.id}
                className="p-3 rounded-lg border border-hairline bg-surface gap-2"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 rounded-full bg-secondary items-center justify-center">
                    <Text className="font-mono text-xs font-semibold text-ink">
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">{u.name}</Text>
                    <Text className="text-xs text-ink-mute">
                      {ROLE_LABEL[u.role]} · {u.shift}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-ink-dim">{u.email}</Text>
                <Text className="text-xs text-ink-mute">Dernière activité: {u.lastActive}</Text>
                <View className="flex-row gap-2 pt-1">
                  <Pressable
                    onPress={() => setEditing(u)}
                    className="flex-row items-center gap-1 h-8 px-3 rounded border border-hairline bg-background"
                  >
                    <Pencil size={12} color={INK_DIM} />
                    <Text className="text-xs text-ink-dim">Modifier</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmDel(u)}
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

      <EmployeeForm
        open={creating}
        title="Nouvel employé"
        initial={empty}
        onClose={() => setCreating(false)}
        onSubmit={(d) => {
          addEmployee(d);
          setCreating(false);
          Toast.show({ type: "success", text1: `${d.name} ajouté` });
        }}
      />
      <EmployeeForm
        open={!!editing}
        title={`Modifier ${editing?.name ?? ""}`}
        initial={editing ?? empty}
        onClose={() => setEditing(null)}
        onSubmit={(d) => {
          if (editing) {
            updateEmployee(editing.id, d);
            Toast.show({ type: "success", text1: "Employé mis à jour" });
          }
          setEditing(null);
        }}
      />
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Supprimer cet employé ?"
        footer={
          <>
            <BtnGhost onPress={() => setConfirmDel(null)}>Annuler</BtnGhost>
            <BtnDanger
              onPress={() => {
                if (confirmDel) {
                  removeEmployee(confirmDel.id);
                  Toast.show({ type: "success", text1: `${confirmDel.name} supprimé` });
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
          Le compte <Text className="font-medium text-ink">{confirmDel?.name}</Text> sera retiré.
        </Text>
      </Modal>
    </ScrollView>
  );
}

function EmployeeForm({
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
              if (!d.name.trim() || !d.email.trim()) {
                Toast.show({ type: "error", text1: "Nom et courriel requis" });
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
      <Field label="Nom">
        <Input value={d.name} onChangeText={(v) => set("name", v)} />
      </Field>
      <Field label="Courriel">
        <Input
          value={d.email}
          onChangeText={(v) => set("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Field>
      <Field label="Rôle">
        <Select
          value={d.role}
          onChange={(v) => set("role", v as Role)}
          options={ROLES.map((r) => ({ key: r, label: ROLE_LABEL[r] }))}
        />
      </Field>
      <Field label="Quart par défaut">
        <Select
          value={d.shift}
          onChange={(v) => set("shift", v)}
          options={SHIFT_OPTS.map((s) => ({ key: s, label: s }))}
        />
      </Field>
    </Modal>
  );
}
