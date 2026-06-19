import { View, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { NearbyMerchant } from "@/shared/types/database";
import { Card } from "@/shared/components";
import { RatingStars } from "./RatingStars";

interface MerchantCardProps {
  merchant: NearbyMerchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  return (
    <Link href={`/merchant/${merchant.id}`} asChild>
      <Pressable>
        <Card className="overflow-hidden p-0">
          {merchant.cover_image_url && (
            <Image
              source={{ uri: merchant.cover_image_url }}
              className="h-32 w-full"
              resizeMode="cover"
            />
          )}
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {merchant.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-500">
                    {merchant.distance_km.toFixed(1)} km away
                  </Text>
                </View>
              </View>
              <RatingStars
                rating={merchant.rating_avg}
                count={merchant.review_count}
                size="sm"
              />
            </View>
            {merchant.starting_price && (
              <View className="mt-3 flex-row items-center">
                <Text className="text-sm text-gray-500">From </Text>
                <Text className="font-semibold text-primary-500">
                  ₱{merchant.starting_price}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
