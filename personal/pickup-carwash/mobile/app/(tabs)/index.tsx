import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/features/auth/store";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.full_name || "there";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-gray-900">
            Hi, {displayName}!
          </Text>
          <Text className="mt-1 text-gray-500">
            Ready to get your car washed?
          </Text>
        </View>

        {/* Active booking card will go here */}
        {/* Nearby merchants preview will go here */}
      </ScrollView>
    </SafeAreaView>
  );
}
