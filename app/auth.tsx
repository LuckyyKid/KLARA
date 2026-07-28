import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRole } from "@/lib/klara/role-context";
import type { Role } from "@/lib/klara/mock-data";
import { cn } from "@/lib/utils";

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  "joseph.tremblay@parkinglink.ca": { password: "superviseur", role: "supervisor" },
  "mahdi.bensalah@parkinglink.ca":  { password: "gestionnaire", role: "manager" },
  "sophie.girard@parkinglink.ca":   { password: "admin", role: "admin" },
};

export default function AuthScreen() {
  const { signIn, isAuthenticated } = useRole();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleSubmit = () => {
    setError(null);
    setLoading(true);
    const key = email.trim().toLowerCase();
    const entry = CREDENTIALS[key];
    setTimeout(() => {
      if (!entry || entry.password !== password) {
        setError("Identifiants invalides. Vérifiez votre courriel et votre mot de passe.");
        setLoading(false);
        return;
      }
      signIn(entry.role);
      router.replace("/");
    }, 300);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center px-6 py-10">
          <View className="w-full max-w-md gap-6">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 rounded-md bg-ink items-center justify-center">
                <Text className="font-mono text-sm font-semibold text-primary-foreground">K</Text>
              </View>
              <Text className="font-semibold tracking-tight text-lg text-ink">Klara</Text>
            </View>

            <View className="gap-1">
              <Text className="label-mono text-ink-mute uppercase text-[11px] tracking-widest">Connexion</Text>
              <Text className="text-2xl font-semibold tracking-tight text-ink">Bienvenue sur Klara</Text>
              <Text className="text-sm text-ink-mute">
                Connectez-vous avec votre compte Precise ParkLink pour accéder à la plateforme.
              </Text>
            </View>

            <View className="gap-4">
              <View className="gap-1.5">
                <Text className="label-mono text-ink-dim uppercase text-[11px] tracking-widest font-medium">Courriel</Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Mail size={16} color="rgb(138,142,149)" />
                  </View>
                  <TextInput
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="prenom.nom@parkinglink.ca"
                    placeholderTextColor="rgb(138,142,149)"
                    className="w-full h-11 pl-9 pr-3 rounded-md border border-hairline bg-surface text-sm text-ink"
                  />
                </View>
              </View>

              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="label-mono text-ink-dim uppercase text-[11px] tracking-widest font-medium">Mot de passe</Text>
                </View>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Lock size={16} color="rgb(138,142,149)" />
                  </View>
                  <TextInput
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="********"
                    placeholderTextColor="rgb(138,142,149)"
                    className="w-full h-11 pl-9 pr-10 rounded-md border border-hairline bg-surface text-sm text-ink"
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded"
                  >
                    {showPassword ? <EyeOff size={16} color="rgb(138,142,149)" /> : <Eye size={16} color="rgb(138,142,149)" />}
                  </Pressable>
                </View>
              </View>

              {error && (
                <View className="flex-row items-start gap-2 p-3 rounded-md border border-danger/30 bg-danger/5">
                  <AlertCircle size={16} color="rgb(212,87,76)" />
                  <Text className="text-sm text-danger flex-1">{error}</Text>
                </View>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={cn(
                  "w-full h-11 rounded-md bg-ink flex-row items-center justify-center gap-2",
                  loading && "opacity-60",
                )}
              >
                <Text className="text-primary-foreground font-medium text-sm">
                  {loading ? "Connexion..." : "Se connecter"}
                </Text>
                {!loading && <ArrowRight size={16} color="rgb(252,252,251)" />}
              </Pressable>
            </View>

            <View className="border border-hairline rounded-md bg-surface overflow-hidden">
              <Pressable onPress={() => setShowDemo((v) => !v)} className="px-3 py-2">
                <Text className="label-mono text-ink-dim uppercase text-[11px] tracking-widest">
                  Comptes de démonstration
                </Text>
              </Pressable>
              {showDemo && (
                <View className="px-3 pb-3 pt-1 gap-1.5">
                  <Text className="text-xs font-mono text-ink-mute">
                    joseph.tremblay@parkinglink.ca · <Text className="text-ink">superviseur</Text>
                  </Text>
                  <Text className="text-xs font-mono text-ink-mute">
                    mahdi.bensalah@parkinglink.ca · <Text className="text-ink">gestionnaire</Text>
                  </Text>
                  <Text className="text-xs font-mono text-ink-mute">
                    sophie.girard@parkinglink.ca · <Text className="text-ink">admin</Text>
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-xs text-ink-mute">
              En vous connectant, vous acceptez les conditions d'utilisation internes Precise ParkLink.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
