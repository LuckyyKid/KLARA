import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATE_LABEL, type AssignmentStatus, type VehicleState } from "@/lib/klara/mock-data";

const STATUS_STYLES: Record<AssignmentStatus, { wrap: string; text: string }> = {
  pending:     { wrap: "bg-secondary border-hairline", text: "text-ink-dim" },
  in_progress: { wrap: "bg-info-soft border-info/20", text: "text-info" },
  submitted:   { wrap: "bg-ok-soft border-ok/20", text: "text-ok" },
  late:        { wrap: "bg-danger-soft border-danger/20", text: "text-danger" },
  missed:      { wrap: "bg-danger-soft border-danger/30", text: "text-danger font-medium" },
  excused:     { wrap: "bg-warn-soft border-warn/20", text: "text-warn" },
  cancelled:   { wrap: "bg-secondary border-hairline", text: "text-ink-mute" },
};

const STATE_STYLES: Record<VehicleState, { wrap: string; text: string; dot: string }> = {
  conforme:      { wrap: "bg-ok-soft border-ok/20", text: "text-ok", dot: "bg-ok" },
  mineure:       { wrap: "bg-warn-soft border-warn/20", text: "text-warn", dot: "bg-warn" },
  importante:    { wrap: "bg-danger-soft border-danger/20", text: "text-danger", dot: "bg-danger" },
  critique:      { wrap: "bg-danger-soft border-danger/30", text: "text-danger font-medium", dot: "bg-danger" },
  hors_service:  { wrap: "bg-secondary border-hairline", text: "text-ink-mute", dot: "bg-ink-mute" },
  inconnu:       { wrap: "bg-secondary border-hairline", text: "text-ink-mute", dot: "bg-ink-mute" },
};

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View className={cn("self-start flex-row items-center rounded-full border px-2 py-0.5", s.wrap)}>
      <Text className={cn("text-xs", s.text)}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function StateBadge({ state }: { state: VehicleState }) {
  const s = STATE_STYLES[state];
  return (
    <View className={cn("self-start flex-row items-center gap-1.5 rounded-full border px-2 py-0.5", s.wrap)}>
      <View className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      <Text className={cn("text-xs", s.text)}>{STATE_LABEL[state]}</Text>
    </View>
  );
}
