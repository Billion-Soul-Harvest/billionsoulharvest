import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Package } from "@/shared/types/database";
import { Card } from "@/shared/components";

interface PackageCardProps {
  pkg: Package;
  selected?: boolean;
  onSelect?: () => void;
}

export function PackageCard({ pkg, selected = false, onSelect }: PackageCardProps) {
  return (
    <Pressable onPress={onSelect}>
      <Card
        className={`border-2 ${
          selected ? "border-primary-500 bg-primary-50" : "border-transparent"
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {pkg.name}
            </Text>
            {pkg.description && (
              <Text className="mt-1 text-sm text-gray-500">
                {pkg.description}
              </Text>
            )}
            <View className="mt-2 flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500">
                  {pkg.duration_mins} min
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="car-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500">
                  +₱{pkg.pickup_fee} pickup
                </Text>
              </View>
            </View>
          </View>
          <Text className="text-xl font-bold text-primary-500">
            ₱{pkg.price}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
