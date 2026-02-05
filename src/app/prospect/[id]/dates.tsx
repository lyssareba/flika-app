import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

const DatesScreen = () => {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Dates for Prospect {id}</Text>
    </View>
  );
};

export default DatesScreen;
