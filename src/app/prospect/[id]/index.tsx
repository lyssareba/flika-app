import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProspectScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Prospect {id}</Text>
    </View>
  );
}
