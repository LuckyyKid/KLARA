import { Slot, Redirect } from "expo-router";
import { useRole } from "@/lib/klara/role-context";
import { AppShell } from "@/components/klara/AppShell";

export default function AppGroupLayout() {
  const { isAuthenticated } = useRole();
  if (!isAuthenticated) return <Redirect href="/auth" />;
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
