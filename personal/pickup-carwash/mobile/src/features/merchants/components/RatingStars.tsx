import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RatingStarsProps {
  rating: number | null;
  count?: number;
  size?: "sm" | "md";
}

export function RatingStars({ rating, count, size = "md" }: RatingStarsProps) {
  const iconSize = size === "sm" ? 14 : 18;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (rating === null) {
    return (
      <Text className={`${textSize} text-gray-400`}>No reviews yet</Text>
    );
  }

  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={iconSize} color="#F59E0B" />
      <Text className={`${textSize} font-medium text-gray-900`}>
        {rating.toFixed(1)}
      </Text>
      {count !== undefined && (
        <Text className={`${textSize} text-gray-500`}>({count})</Text>
      )}
    </View>
  );
}
