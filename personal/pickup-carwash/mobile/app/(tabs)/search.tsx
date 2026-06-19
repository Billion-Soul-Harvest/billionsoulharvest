import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "@/shared/hooks/useLocation";
import { useNearbyMerchants } from "@/features/merchants/hooks";
import { useMerchantsStore } from "@/features/merchants/store";
import { MerchantCard } from "@/features/merchants/components";
import { EmptyState } from "@/shared/components";

export default function SearchScreen() {
  const { coords, isLoading: locationLoading, error: locationError } = useLocation();
  const { filters } = useMerchantsStore();

  const {
    data: merchants,
    isLoading: merchantsLoading,
    error: merchantsError,
    refetch,
  } = useNearbyMerchants({
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    radius: filters.radius,
    enabled: !!coords,
  });

  const isLoading = locationLoading || merchantsLoading;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">Finding nearby car washes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="Location access needed"
          description="Enable location to find car washes near you"
          actionLabel="Try again"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  if (merchantsError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="Something went wrong"
          description="Failed to load merchants"
          actionLabel="Retry"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">Find Car Wash</Text>
        <Text className="text-gray-500">
          {merchants?.length || 0} places within {filters.radius} km
        </Text>
      </View>

      <FlatList
        data={merchants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MerchantCard merchant={item} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            title="No car washes nearby"
            description="Try expanding your search radius"
          />
        }
      />
    </SafeAreaView>
  );
}
