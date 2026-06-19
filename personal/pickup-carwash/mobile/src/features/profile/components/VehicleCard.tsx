import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Vehicle } from "@/shared/types/database";
import { Card } from "@/shared/components";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete: () => void;
}

export function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      `Remove ${vehicle.make} ${vehicle.model}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Ionicons name="car" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="font-semibold text-gray-900">
              {vehicle.make} {vehicle.model}
            </Text>
            <Text className="text-sm text-gray-500">
              {vehicle.color}
              {vehicle.plate_number && ` • ${vehicle.plate_number}`}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {vehicle.is_default && (
            <View className="rounded-full bg-primary-100 px-2 py-1">
              <Text className="text-xs text-primary-600">Default</Text>
            </View>
          )}
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
