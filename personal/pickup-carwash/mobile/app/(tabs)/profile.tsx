import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";
import { Avatar, Button } from "@/shared/components";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const displayName = user?.user_metadata?.full_name || "User";
  const email = user?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 py-6">
        <View className="items-center pb-6">
          <Avatar fallback={displayName} size="lg" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            {displayName}
          </Text>
          <Text className="text-gray-500">{email}</Text>
        </View>

        <View className="mt-auto pb-4">
          <Button variant="destructive" onPress={logout}>
            Sign Out
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
