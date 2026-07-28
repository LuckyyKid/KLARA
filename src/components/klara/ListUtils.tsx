import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight, Search } from "lucide-react-native";
import { cn } from "@/lib/utils";

const INK_MUTE = "rgb(138,142,149)";
const INK = "rgb(23,25,29)";

export const PAGE_SIZE = 15;

export function usePaginated<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const total = Math.max(1, Math.ceil(items.length / pageSize));
  useEffect(() => {
    if (page > total) setPage(1);
  }, [page, total]);
  const slice = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );
  return { page, setPage, total, slice, pageSize, count: items.length };
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-2 h-10 px-3 rounded-md border border-hairline bg-surface",
        className,
      )}
    >
      <Search size={16} color={INK_MUTE} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={INK_MUTE}
        className="flex-1 text-sm text-ink"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange("")}>
          <Text className="text-[11px] uppercase font-medium text-ink-mute tracking-widest">
            Effacer
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function Pagination({
  page,
  total,
  count,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  count: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  if (count === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  return (
    <View className="flex-row items-center justify-between gap-3 px-4 py-2.5 border-t border-hairline">
      <Text className="text-xs font-mono text-ink-mute">
        {from}–{to} sur {count}
      </Text>
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={cn(
            "h-7 w-7 items-center justify-center rounded border border-hairline bg-surface",
            page === 1 && "opacity-40",
          )}
        >
          <ChevronLeft size={14} color={INK} />
        </Pressable>
        <Text className="px-2 font-mono text-ink text-xs">
          {page} / {total}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(total, page + 1))}
          disabled={page === total}
          className={cn(
            "h-7 w-7 items-center justify-center rounded border border-hairline bg-surface",
            page === total && "opacity-40",
          )}
        >
          <ChevronRight size={14} color={INK} />
        </Pressable>
      </View>
    </View>
  );
}

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { key: T; label: string; count?: number }[];
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 8 }}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            className={cn(
              "flex-row items-center gap-2 px-3 py-1.5 rounded-md",
              active ? "bg-ink" : "bg-transparent",
            )}
          >
            <Text className={cn("text-sm", active ? "text-primary-foreground font-medium" : "text-ink-dim")}>
              {o.label}
            </Text>
            {o.count != null && (
              <Text
                className={cn(
                  "text-xs font-mono",
                  active ? "text-primary-foreground/70" : "text-ink-mute",
                )}
              >
                {o.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
