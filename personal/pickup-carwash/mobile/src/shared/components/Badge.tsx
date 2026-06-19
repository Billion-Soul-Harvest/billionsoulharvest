import { View, Text } from "react-native";
import type { BookingStatus } from "../types/database";

const statusConfig: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Awaiting Payment" },
  confirmed: { bg: "bg-primary-100", text: "text-primary-700", label: "Confirmed" },
  picked_up: { bg: "bg-warning/20", text: "text-warning", label: "Car Picked Up" },
  in_progress: { bg: "bg-warning/20", text: "text-warning", label: "Washing" },
  completed: { bg: "bg-success/20", text: "text-success", label: "Completed" },
  cancelled: { bg: "bg-error/20", text: "text-error", label: "Cancelled" },
};

interface BadgeProps {
  status: BookingStatus;
}

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <View className={`rounded-full px-3 py-1 ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
