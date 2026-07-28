import { View, Text } from "react-native";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <View className={cn("rounded-xl border border-hairline bg-card", className)}>
      {children}
    </View>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-start justify-between gap-4 px-4 pt-4 pb-3 border-b border-hairline">
      <View className="min-w-0 flex-1">
        {typeof title === "string" ? (
          <Text className="text-sm font-semibold tracking-tight text-ink" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
        {subtitle && (
          typeof subtitle === "string" ? (
            <Text className="text-xs text-ink-mute mt-0.5">{subtitle}</Text>
          ) : (
            <View className="mt-0.5">{subtitle}</View>
          )
        )}
      </View>
      {right}
    </View>
  );
}
