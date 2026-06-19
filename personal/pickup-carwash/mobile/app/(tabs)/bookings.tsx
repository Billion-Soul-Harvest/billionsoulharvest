import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-gray-500">Your bookings</Text>
      </View>
    </SafeAreaView>
  );
}
