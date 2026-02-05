import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

const TraitsScreen = () => {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Traits for Prospect {id}</Text>
    </View>
  );
};

export default TraitsScreen;
