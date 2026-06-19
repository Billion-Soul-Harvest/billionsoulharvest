import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useBooking } from "@/features/booking/hooks";
import { StatusTracker } from "@/features/booking/components";
import { Button, Badge, Avatar, Card } from "@/shared/components";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useBooking(id);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("cancel-booking", {
        body: { bookingId: id, cancelledBy: "customer" },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
    },
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? You will receive a full refund.",
      [
        { text: "No, keep it", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "Booking" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "Not Found" }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(booking.pickup_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const canCancel = booking.status === "confirmed";

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: "Booking Details" }} />

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6">
          <View className="flex-row items-center gap-4">
            <Avatar
              src={booking.merchant.logo_url}
              fallback={booking.merchant.name}
              size="lg"
            />
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {booking.merchant.name}
              </Text>
              <Text className="text-gray-500">{booking.package.name}</Text>
            </View>
            <Badge status={booking.status} />
          </View>
        </View>

        {/* Status Tracker */}
        {booking.status !== "cancelled" && booking.status !== "pending" && (
          <Card className="mx-4 mt-4">
            <Text className="mb-2 font-semibold text-gray-900">Status</Text>
            <StatusTracker status={booking.status} />
          </Card>
        )}

        {/* Details */}
        <Card className="mx-4 mt-4">
          <Text className="mb-4 font-semibold text-gray-900">Details</Text>

          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View>
                <Text className="text-gray-500">Date</Text>
                <Text className="font-medium text-gray-900">{date}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View>
                <Text className="text-gray-500">Time</Text>
                <Text className="font-medium text-gray-900">
                  {booking.pickup_slot}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View className="flex-1">
                <Text className="text-gray-500">Pickup Address</Text>
                <Text className="font-medium text-gray-900">
                  {booking.pickup_address}
                </Text>
              </View>
            </View>

            {booking.driver_note && (
              <View className="flex-row items-center gap-3">
                <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                <View className="flex-1">
                  <Text className="text-gray-500">Note</Text>
                  <Text className="font-medium text-gray-900">
                    {booking.driver_note}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Payment Summary */}
        <Card className="mx-4 mt-4 mb-6">
          <Text className="mb-4 font-semibold text-gray-900">Payment</Text>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Package</Text>
              <Text>₱{booking.package_price}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Pickup fee</Text>
              <Text>₱{booking.pickup_fee}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Service fee</Text>
              <Text>₱{booking.platform_fee}</Text>
            </View>
            <View className="mt-2 flex-row justify-between border-t border-gray-200 pt-2">
              <Text className="font-semibold">Total paid</Text>
              <Text className="font-bold text-primary-500">
                ₱{booking.total_amount}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Cancel Button */}
      {canCancel && (
        <View className="border-t border-gray-200 bg-white px-4 py-4">
          <Button
            variant="destructive"
            onPress={handleCancel}
            loading={cancelMutation.isPending}
          >
            Cancel Booking
          </Button>
        </View>
      )}
    </View>
  );
}
