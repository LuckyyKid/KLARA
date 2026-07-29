import { Modal as RNModal, Pressable, View, Text, TextInput, type TextInputProps } from "react-native";
import { X } from "lucide-react-native";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "xl";
}) {
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-ink/40 p-4">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={cn("w-full", size === "xl" ? "max-w-3xl" : "max-w-lg")}
        >
          <View className="w-full rounded-xl border border-hairline bg-background">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-hairline">
              <Text className="font-semibold tracking-tight text-ink">{title}</Text>
              <Pressable
                onPress={onClose}
                accessibilityLabel="Fermer"
                className="h-7 w-7 items-center justify-center rounded"
              >
                <X size={16} color="rgb(138,142,149)" />
              </Pressable>
            </View>
            <View className="p-4 gap-3">{children}</View>
            {footer && (
              <View className="px-4 py-3 border-t border-hairline flex-row items-center justify-end gap-2">
                {footer}
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1">
      <Text className="label-mono text-ink-dim uppercase text-[11px] tracking-widest font-medium">
        {label}
      </Text>
      {children}
    </View>
  );
}

export const Input = forwardRef<TextInput, TextInputProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <TextInput
      ref={ref}
      placeholderTextColor="rgb(138,142,149)"
      className={cn(
        "w-full h-10 px-3 rounded-md border border-hairline bg-surface text-sm text-ink",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

type BtnProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function BtnPrimary({ children, onPress, disabled, className }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "flex-row items-center gap-1.5 h-9 px-3 rounded-md bg-ink active:opacity-90",
        disabled && "opacity-60",
        className,
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-primary-foreground text-sm font-medium">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function BtnGhost({ children, onPress, disabled, className }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "flex-row items-center gap-1.5 h-9 px-3 rounded-md border border-hairline bg-surface active:bg-secondary",
        disabled && "opacity-60",
        className,
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-ink text-sm">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function BtnDanger({ children, onPress, disabled, className }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "flex-row items-center gap-1.5 h-9 px-3 rounded-md border border-danger/30 bg-danger/5 active:bg-danger/10",
        disabled && "opacity-60",
        className,
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-danger text-sm">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
