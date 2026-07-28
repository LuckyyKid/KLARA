import { ScrollView, View, Text, Pressable } from "react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { useRole, ROLE_LABEL, CURRENT_USER } from "@/lib/klara/role-context";
import { BtnGhost, BtnDanger } from "@/components/klara/Modal";

export default function ProfilScreen() {
  const { role, setRole, signOut } = useRole();
  const user = CURRENT_USER[role];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader title="Profil" subtitle="Compte actuel" />
        <View className="p-4 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 rounded-full bg-secondary items-center justify-center">
              <Text className="font-mono text-lg font-semibold text-ink">{user.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">{user.name}</Text>
              <Text className="text-sm text-ink-mute">{ROLE_LABEL[role]} · {user.location}</Text>
            </View>
          </View>
        </View>
      </Panel>

      <Panel>
        <PanelHeader title="Changer de rôle" subtitle="Démo multi-rôle" />
        <View className="p-4 gap-2">
          {(["supervisor", "manager", "admin"] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              className={`flex-row items-center justify-between p-3 rounded-lg border ${role === r ? "border-ink bg-secondary" : "border-hairline bg-surface"}`}
            >
              <View>
                <Text className="text-sm font-medium text-ink">{ROLE_LABEL[r]}</Text>
                <Text className="text-xs text-ink-mute">{CURRENT_USER[r].name}</Text>
              </View>
              {role === r && <View className="h-2 w-2 rounded-full bg-ink" />}
            </Pressable>
          ))}
        </View>
      </Panel>

      <BtnDanger onPress={signOut}>Se déconnecter</BtnDanger>
    </ScrollView>
  );
}
