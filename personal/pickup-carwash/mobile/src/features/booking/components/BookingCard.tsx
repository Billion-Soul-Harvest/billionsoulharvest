import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { BookingWithRelations } from "@/shared/types/database";
import { Card, Badge, Avatar } from "@/shared/components";

interface BookingCardProps {
  booking: BookingWithRelations;
}

export function BookingCard({ booking }: BookingCardProps) {
  const date = new Date(booking.pickup_date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/booking/${booking.id}`} asChild>
      <Pressable>
        <Card>
          <View className="flex-row items-center gap-3">
            <Avatar
              src={booking.merchant.logo_url}
              fallback={booking.merchant.name}
            />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {booking.merchant.name}
              </Text>
              <Text className="text-sm text-gray-500">{booking.package.name}</Text>
            </View>
            <Badge status={booking.status} />
          </View>

          <View className="mt-4 flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500">{date}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500">{booking.pickup_slot}</Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-gray-500">Total</Text>
            <Text className="font-semibold text-gray-900">
              ₱{booking.total_amount}
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
