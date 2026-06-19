import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BookingStatus } from "@/shared/types/database";

interface Step {
  status: BookingStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STEPS: Step[] = [
  { status: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { status: "picked_up", label: "Picked Up", icon: "car" },
  { status: "in_progress", label: "Washing", icon: "water" },
  { status: "completed", label: "Completed", icon: "checkmark-done-circle" },
];

const STATUS_ORDER: BookingStatus[] = [
  "pending",
  "confirmed",
  "picked_up",
  "in_progress",
  "completed",
];

interface StatusTrackerProps {
  status: BookingStatus;
}

export function StatusTracker({ status }: StatusTrackerProps) {
  if (status === "cancelled" || status === "pending") {
    return null;
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <View className="py-4">
      {STEPS.map((step, index) => {
        const stepIndex = STATUS_ORDER.indexOf(step.status);
        const isCompleted = currentIndex >= stepIndex;
        const isCurrent = status === step.status;

        return (
          <View key={step.status} className="flex-row">
            {/* Line and circle */}
            <View className="items-center">
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isCompleted ? "bg-primary-500" : "bg-gray-200"
                }`}
              >
                <Ionicons
                  name={step.icon}
                  size={20}
                  color={isCompleted ? "white" : "#9CA3AF"}
                />
              </View>
              {index < STEPS.length - 1 && (
                <View
                  className={`h-8 w-0.5 ${
                    currentIndex > stepIndex ? "bg-primary-500" : "bg-gray-200"
                  }`}
                />
              )}
            </View>

            {/* Label */}
            <View className="ml-4 flex-1 justify-center pb-8">
              <Text
                className={`font-medium ${
                  isCompleted ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </Text>
              {isCurrent && (
                <Text className="text-sm text-primary-500">Current status</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
