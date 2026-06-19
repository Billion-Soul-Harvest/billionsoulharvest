import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";
import { useProfile } from "@/features/profile/hooks";
import { Avatar, Button } from "@/shared/components";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function SettingsRow({ icon, label, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-white px-4 py-4"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={22} color="#6B7280" />
        <Text className="text-gray-900">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { data: profile } = useProfile();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const email = user?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
        <View className="items-center bg-white pb-6 pt-8">
          <Avatar fallback={displayName} size="lg" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            {displayName}
          </Text>
          <Text className="text-gray-500">{email}</Text>
        </View>

        {/* Settings */}
        <View className="mt-6">
          <Text className="mb-2 px-4 text-sm font-medium uppercase text-gray-500">
            Account
          </Text>
          <SettingsRow
            icon="car-outline"
            label="My Vehicles"
            onPress={() => router.push("/profile/vehicles")}
          />
          <View className="h-px bg-gray-200" />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
        </View>

        <View className="mt-6">
          <Text className="mb-2 px-4 text-sm font-medium uppercase text-gray-500">
            Support
          </Text>
          <SettingsRow
            icon="help-circle-outline"
            label="Help & FAQ"
            onPress={() => {}}
          />
          <View className="h-px bg-gray-200" />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
          />
        </View>

        <View className="mt-8 px-4 pb-8">
          <Button variant="destructive" onPress={logout}>
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
