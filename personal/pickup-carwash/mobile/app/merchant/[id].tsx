import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMerchant, useMerchantPackages, useMerchantReviews } from "@/features/merchants/hooks";
import { PackageCard, ReviewCard, RatingStars } from "@/features/merchants/components";
import { Button, Skeleton } from "@/shared/components";

export default function MerchantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: merchant, isLoading: merchantLoading } = useMerchant(id);
  const { data: packages, isLoading: packagesLoading } = useMerchantPackages(id);
  const { data: reviews } = useMerchantReviews(id);

  const handleBookPress = () => {
    router.push(`/booking/${id}/new`);
  };

  if (merchantLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!merchant) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "Not Found" }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Merchant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: merchant.name }} />

      <ScrollView className="flex-1">
        {merchant.cover_image_url && (
          <Image
            source={{ uri: merchant.cover_image_url }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-6">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-900">{merchant.name}</Text>
          <View className="mt-2 flex-row items-center gap-4">
            <RatingStars
              rating={merchant.rating_avg}
              count={merchant.review_count}
            />
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500">{merchant.address}</Text>
            </View>
          </View>

          {merchant.description && (
            <Text className="mt-4 text-gray-600">{merchant.description}</Text>
          )}

          {/* Contact */}
          <View className="mt-6 flex-row gap-4">
            {merchant.phone && (
              <Pressable className="flex-row items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                <Ionicons name="call-outline" size={18} color="#3B82F6" />
                <Text className="text-primary-500">Call</Text>
              </Pressable>
            )}
          </View>

          {/* Packages */}
          <View className="mt-8">
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Services
            </Text>
            {packagesLoading ? (
              <View className="gap-3">
                <Skeleton height={100} rounded="lg" />
                <Skeleton height={100} rounded="lg" />
              </View>
            ) : (
              <View className="gap-3">
                {packages?.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </View>
            )}
          </View>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <View className="mt-8">
              <Text className="mb-2 text-xl font-semibold text-gray-900">
                Reviews
              </Text>
              <View className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Button */}
      <View className="border-t border-gray-200 bg-white px-4 py-4">
        <Button onPress={handleBookPress}>Book Now</Button>
      </View>
    </View>
  );
}
