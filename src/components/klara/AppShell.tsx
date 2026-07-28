import { useState, type ReactNode, type ComponentType } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
import {
  LayoutDashboard,
  Car,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Bell,
  Users,
  Wrench,
  FileCog,
  Settings,
  UserCircle2,
  Menu,
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react-native";
import { useRole, ROLE_LABEL, CURRENT_USER } from "@/lib/klara/role-context";
import { useTheme } from "@/lib/klara/theme";
import { NOW_LABEL, NOTIFICATIONS } from "@/lib/klara/mock-data";
import type { Role } from "@/lib/klara/mock-data";
import { cn } from "@/lib/utils";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  roles: Role[];
  section: "Opérations" | "Pilotage" | "Compte" | "Admin";
  badge?: number;
};

const NAV: NavItem[] = [
  { to: "/",              label: "Tableau de bord",       icon: LayoutDashboard, roles: ["supervisor","manager","admin"], section: "Opérations" },
  { to: "/vehicules",     label: "Mes véhicules",         icon: Car,             roles: ["supervisor","manager","admin"], section: "Opérations" },
  { to: "/inspections",   label: "Inspections",           icon: ClipboardList,   roles: ["supervisor","manager","admin"], section: "Opérations" },
  { to: "/anomalies",     label: "Anomalies",             icon: AlertTriangle,   roles: ["supervisor","manager","admin"], section: "Opérations", badge: 2 },
  { to: "/rapports",      label: "Rapports",              icon: BarChart3,       roles: ["manager","admin"], section: "Pilotage" },
  { to: "/calendrier",    label: "Calendrier",            icon: CalendarDays,    roles: ["manager","admin"], section: "Pilotage" },
  { to: "/employes",      label: "Employés",              icon: Users,           roles: ["admin"], section: "Admin" },
  { to: "/gestion-vehicules", label: "Gestion des véhicules", icon: Wrench,      roles: ["admin"], section: "Admin" },
  { to: "/modeles",       label: "Modèles d'inspection",  icon: FileCog,         roles: ["admin"], section: "Admin" },
  { to: "/notifications", label: "Notifications",         icon: Bell,            roles: ["supervisor","manager","admin"], section: "Compte" },
  { to: "/parametres",    label: "Paramètres",            icon: Settings,        roles: ["manager","admin"], section: "Compte" },
  { to: "/profil",        label: "Profil",                icon: UserCircle2,     roles: ["supervisor","manager","admin"], section: "Compte" },
];

const INK_MUTE = "rgb(138,142,149)";
const INK = "rgb(23,25,29)";
const INK_DARK = "rgb(236,236,232)";

export function AppShell({ children }: { children: ReactNode }) {
  const { role, signOut } = useRole();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = CURRENT_USER[role];
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const sections: NavItem["section"][] = ["Opérations", "Pilotage", "Admin", "Compte"];
  const visible = NAV.filter((n) => n.roles.includes(role));
  const isDesktop = width >= 1024;
  const iconColor = theme === "dark" ? INK_DARK : INK;

  const currentEntry = NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)));

  const Sidebar = (
    <View className="flex-1 bg-sidebar border-r border-hairline">
      <View className="flex-row items-center justify-between px-5 h-14 border-b border-hairline">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 rounded-md bg-ink items-center justify-center">
            <Text className="font-mono text-sm font-semibold text-primary-foreground">K</Text>
          </View>
          <Text className="font-semibold tracking-tight text-ink">Klara</Text>
        </View>
        <Text className="label-mono text-ink-mute uppercase text-[11px]">V1</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}>
        {sections.map((section) => {
          const items = visible.filter((n) => n.section === section);
          if (items.length === 0) return null;
          return (
            <View key={section} className="mb-5">
              <Text className="label-mono text-ink-mute uppercase text-[11px] px-2 pb-2 tracking-widest">{section}</Text>
              {items.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link key={item.to} href={item.to as any} asChild>
                    <Pressable
                      onPress={() => setDrawerOpen(false)}
                      className={cn(
                        "flex-row items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5",
                        active ? "bg-secondary" : "active:bg-secondary/70",
                      )}
                    >
                      <Icon size={16} color={active ? iconColor : INK_MUTE} />
                      <Text className={cn("flex-1 text-sm", active ? "text-ink font-medium" : "text-ink-dim")}>
                        {item.label}
                      </Text>
                      {item.to === "/notifications" && unread > 0 && (
                        <View className="h-1.5 w-1.5 rounded-full bg-danger" />
                      )}
                      {item.badge != null && (
                        <Text className="num-mono text-[11px] text-ink-mute font-mono">{item.badge}</Text>
                      )}
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View className="border-t border-hairline px-4 py-3">
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-8 rounded-full bg-secondary items-center justify-center">
            <Text className="font-mono text-xs font-semibold text-ink">{user.initials}</Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-ink" numberOfLines={1}>{user.name}</Text>
            <Text className="label-mono text-ink-mute uppercase text-[11px]" numberOfLines={1}>{ROLE_LABEL[role]}</Text>
          </View>
          <Pressable
            onPress={signOut}
            className="h-8 w-8 items-center justify-center rounded-md border border-hairline bg-surface"
          >
            <LogOut size={14} color={INK_MUTE} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const Header = (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-background/95 border-b border-hairline"
    >
      <View className="flex-row items-center gap-3 h-14 px-4">
        {!isDesktop && (
          <Pressable
            onPress={() => setDrawerOpen(true)}
            className="h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface"
          >
            <Menu size={16} color={iconColor} />
          </Pressable>
        )}
        <View className="flex-1 min-w-0">
          <Text className="text-lg font-semibold tracking-tight text-ink" numberOfLines={1}>
            {currentEntry?.label ?? "Klara"}
          </Text>
          <Text className="text-xs text-ink-mute" numberOfLines={1}>{NOW_LABEL}</Text>
        </View>
        <Pressable
          onPress={toggleTheme}
          className="h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface"
        >
          {theme === "dark" ? <Sun size={16} color={iconColor} /> : <Moon size={16} color={iconColor} />}
        </Pressable>
        <Link href="/notifications" asChild>
          <Pressable className="h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface">
            <Bell size={16} color={iconColor} />
            {unread > 0 && (
              <View className="absolute -top-1 -right-1 h-4 min-w-4 px-1 items-center justify-center rounded-full bg-danger">
                <Text className="text-white text-[10px] font-mono">{unread}</Text>
              </View>
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  );

  return (
    <View className="flex-1 flex-row bg-background">
      {isDesktop && (
        <View style={{ width: 248 }}>
          {Sidebar}
        </View>
      )}

      <View className="flex-1">
        {Header}
        <View className="flex-1">{children}</View>
        {!isDesktop && <MobileNav pathname={pathname} role={role} iconColor={iconColor} />}
      </View>

      {!isDesktop && drawerOpen && (
        <View className="absolute inset-0 flex-row" style={{ zIndex: 50 }}>
          <Pressable
            onPress={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <View style={{ width: 280 }} className="h-full">
            <SafeAreaView className="flex-1 bg-sidebar">
              <View className="flex-row justify-end px-3 pt-2">
                <Pressable
                  onPress={() => setDrawerOpen(false)}
                  className="h-8 w-8 items-center justify-center rounded-md"
                >
                  <X size={16} color={iconColor} />
                </Pressable>
              </View>
              {Sidebar}
            </SafeAreaView>
          </View>
        </View>
      )}
    </View>
  );
}

function MobileNav({ pathname, role, iconColor }: { pathname: string; role: Role; iconColor: string }) {
  const insets = useSafeAreaInsets();
  const items = NAV.filter((n) => n.roles.includes(role) && n.section === "Opérations").slice(0, 4);
  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="border-t border-hairline bg-surface"
    >
      <View className="flex-row">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link key={item.to} href={item.to as any} asChild>
              <Pressable className="flex-1 items-center justify-center py-2.5 gap-1">
                <Icon size={16} color={active ? iconColor : INK_MUTE} />
                <Text
                  className={cn("text-[11px]", active ? "text-ink" : "text-ink-mute")}
                  numberOfLines={1}
                >
                  {item.label.split(" ")[0]}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
