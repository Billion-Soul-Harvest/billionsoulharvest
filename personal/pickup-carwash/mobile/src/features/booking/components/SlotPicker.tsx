import { View, Text, Pressable, ScrollView } from "react-native";
import type { AvailableSlot } from "@/shared/types/database";

interface SlotPickerProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export function SlotPicker({ slots, selectedSlot, onSelectSlot }: SlotPickerProps) {
  if (slots.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500">No slots available for this date</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-3 py-2">
        {slots.map((slot) => {
          const slotValue = `${slot.slot_start}-${slot.slot_end}`;
          const isSelected = selectedSlot === slotValue;
          const isDisabled = !slot.available;

          return (
            <Pressable
              key={slotValue}
              onPress={() => !isDisabled && onSelectSlot(slotValue)}
              disabled={isDisabled}
              className={`rounded-xl border-2 px-4 py-3 ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : isDisabled
                  ? "border-gray-200 bg-gray-100"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isSelected
                    ? "text-primary-600"
                    : isDisabled
                    ? "text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {slot.slot_label}
              </Text>
              <Text
                className={`mt-1 text-center text-xs ${
                  isDisabled ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isDisabled ? "Full" : `${slot.remaining} left`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
