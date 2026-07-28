import { Alert, Image, Pressable, Text, View } from "react-native";
import { Camera, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

const WARN = "rgb(217,119,6)";
const INK_DIM = "rgb(66,71,79)";
const PRIMARY_FG = "rgb(250,250,247)";

export function InspectionPhotoInput({
  photos,
  onChange,
  recommended,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
  recommended?: boolean;
}) {
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission requise", "Accès à la galerie refusé.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    const uris = result.assets.map((a) => a.uri);
    onChange([...photos, ...uris]);
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={pick}
          className="flex-row items-center gap-1.5 h-8 px-2.5 rounded-md border border-hairline bg-surface"
        >
          <Camera size={14} color={INK_DIM} />
          <Text className="text-xs text-ink-dim">Ajouter une photo</Text>
        </Pressable>
        {recommended && (
          <Text className="text-xs" style={{ color: WARN }}>
            Photo fortement recommandée
          </Text>
        )}
      </View>
      {photos.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {photos.map((src, i) => (
            <View key={src} className="relative">
              <Image
                source={{ uri: src }}
                className="h-16 w-16 rounded-md border border-hairline"
              />
              <Pressable
                onPress={() => onChange(photos.filter((p) => p !== src))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 items-center justify-center rounded-full bg-ink"
              >
                <X size={10} color={PRIMARY_FG} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
