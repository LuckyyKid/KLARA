import "../global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/lib/klara/theme";
import { RoleProvider } from "@/lib/klara/role-context";
import { StoreProvider } from "@/lib/klara/store";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RoleProvider>
            <StoreProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(app)" />
                <Stack.Screen name="auth" options={{ presentation: "modal" }} />
              </Stack>
            </StoreProvider>
          </RoleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
