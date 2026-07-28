import { useState } from "react";
import { View, Text, Pressable, Modal as RNModal, ScrollView } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { cn } from "@/lib/utils";

const INK = "rgb(23,25,29)";
const INK_MUTE = "rgb(138,142,149)";

export type SelectOption<T extends string> = { key: T; label: string };

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Choisir...",
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.key === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          "h-10 px-3 rounded-md border border-hairline bg-surface flex-row items-center justify-between",
          className,
        )}
      >
        <Text className={cn("text-sm", current ? "text-ink" : "text-ink-mute")}>
          {current?.label ?? placeholder}
        </Text>
        <ChevronDown size={14} color={INK_MUTE} />
      </Pressable>

      <RNModal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 items-center justify-center bg-ink/40 p-6"
        >
          <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-sm">
            <View className="rounded-xl border border-hairline bg-background overflow-hidden">
              <ScrollView className="max-h-96">
                {options.map((o) => {
                  const active = o.key === value;
                  return (
                    <Pressable
                      key={o.key}
                      onPress={() => {
                        onChange(o.key);
                        setOpen(false);
                      }}
                      className="flex-row items-center justify-between px-4 py-3 border-b border-hairline"
                    >
                      <Text
                        className={cn(
                          "text-sm",
                          active ? "text-ink font-medium" : "text-ink-dim",
                        )}
                      >
                        {o.label}
                      </Text>
                      {active && <Check size={16} color={INK} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </RNModal>
    </>
  );
}
