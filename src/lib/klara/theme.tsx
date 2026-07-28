import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";

type Theme = "light" | "dark";
const KEY = "klara.theme";

const Ctx = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    (Appearance.getColorScheme() as Theme) ?? "light",
  );

  useEffect(() => {
    (async () => {
      try {
        const stored = (await AsyncStorage.getItem(KEY)) as Theme | null;
        const initial = stored ?? (Appearance.getColorScheme() as Theme) ?? "light";
        setTheme(initial);
        colorScheme.set(initial);
      } catch {
        // fallback silencieux
      }
    })();
  }, []);

  useEffect(() => {
    colorScheme.set(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      AsyncStorage.setItem(KEY, next).catch(() => {});
      colorScheme.set(next);
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ theme, toggleTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
