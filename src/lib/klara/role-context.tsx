import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Role } from "./mock-data";

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  isAuthenticated: boolean;
  signIn: (r: Role) => void;
  signOut: () => void;
}

const Ctx = createContext<RoleCtx | null>(null);
const STORAGE_KEY = "klara.role";
const AUTH_KEY = "klara.auth";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("manager");
  const [isAuthenticated, setAuth] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v === "supervisor" || v === "manager" || v === "admin") setRoleState(v);
        const a = await AsyncStorage.getItem(AUTH_KEY);
        if (a === "1") setAuth(true);
      } catch {}
    })();
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    AsyncStorage.setItem(STORAGE_KEY, r).catch(() => {});
  };

  const signIn = (r: Role) => {
    setRoleState(r);
    setAuth(true);
    AsyncStorage.setItem(STORAGE_KEY, r).catch(() => {});
    AsyncStorage.setItem(AUTH_KEY, "1").catch(() => {});
  };

  const signOut = () => {
    setAuth(false);
    AsyncStorage.removeItem(AUTH_KEY).catch(() => {});
  };

  return <Ctx.Provider value={{ role, setRole, isAuthenticated, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole must be used within RoleProvider");
  return c;
}

export const ROLE_LABEL: Record<Role, string> = {
  supervisor: "Superviseur",
  manager: "Gestionnaire",
  admin: "Administrateur",
};

export const CURRENT_USER: Record<Role, { name: string; initials: string; location: string }> = {
  supervisor: { name: "Joseph Tremblay", initials: "JT", location: "YUL" },
  manager:    { name: "Mahdi Ben Salah", initials: "MB", location: "YUL" },
  admin:      { name: "Sophie Girard",   initials: "SG", location: "YUL" },
};

export type { Role };
