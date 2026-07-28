import { ScrollView, View, Text } from "react-native";
import { Panel, PanelHeader } from "@/components/klara/Panel";
import { NOTIFICATIONS } from "@/lib/klara/mock-data";

export default function NotificationsScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Panel>
        <PanelHeader title="Notifications" subtitle={`${NOTIFICATIONS.length} au total`} />
        <View className="p-4 gap-3">
          {NOTIFICATIONS.map((n) => (
            <View key={n.id} className="flex-row items-start gap-3 py-2 border-b border-hairline/60">
              {!n.read && <View className="h-2 w-2 rounded-full bg-danger mt-2" />}
              <View className="flex-1">
                <Text className="text-sm font-medium text-ink">{n.title}</Text>
                <Text className="text-[11px] text-ink-mute mt-1">{n.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </Panel>
    </ScrollView>
  );
}
