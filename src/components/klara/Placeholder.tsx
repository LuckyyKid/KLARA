import { View, Text, ScrollView } from "react-native";
import { Panel, PanelHeader } from "./Panel";

export function Placeholder({
  title,
  subtitle,
  message,
}: {
  title: string;
  subtitle?: string;
  message?: string;
}) {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      <Panel>
        <PanelHeader title={title} subtitle={subtitle} />
        <View className="p-6 gap-2">
          <Text className="text-sm text-ink">
            {message ?? "Cette section est en cours de portage vers l'application mobile."}
          </Text>
          <Text className="text-xs text-ink-mute mt-2">
            La logique métier (données, règles) est déjà migrée. Il ne reste qu'à porter l'UI de cet écran depuis la version web.
          </Text>
        </View>
      </Panel>
    </ScrollView>
  );
}
