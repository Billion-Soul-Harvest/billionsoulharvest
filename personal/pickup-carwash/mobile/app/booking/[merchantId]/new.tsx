import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useStripe } from "@stripe/stripe-react-native";
import { useMerchant, useMerchantPackages } from "@/features/merchants/hooks";
import { useAvailableSlots, useCreateBooking } from "@/features/booking/hooks";
import { useBookingStore } from "@/features/booking/store";
import { PackageCard } from "@/features/merchants/components";
import { SlotPicker, StepIndicator } from "@/features/booking/components";
import { Button } from "@/shared/components";
import { useLocation } from "@/shared/hooks";

const STEPS = ["Package", "Schedule", "Address", "Pay"];
const PLATFORM_FEE = 50;

export default function NewBookingScreen() {
  const { merchantId } = useLocalSearchParams<{ merchantId: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { data: merchant } = useMerchant(merchantId);
  const { data: packages } = useMerchantPackages(merchantId);
  const createBooking = useCreateBooking();
  const { coords: userLocation } = useLocation();

  const store = useBookingStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: slots } = useAvailableSlots(
    merchantId,
    selectedDate?.toISOString().split("T")[0] ?? null
  );

  const selectedPackage = packages?.find((p) => p.id === store.packageId);

  const totalAmount = selectedPackage
    ? selectedPackage.price + selectedPackage.pickup_fee + PLATFORM_FEE
    : 0;

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      store.setDateTime(date.toISOString().split("T")[0], "");
    }
  };

  const handleSlotSelect = (slot: string) => {
    if (selectedDate) {
      store.setDateTime(selectedDate.toISOString().split("T")[0], slot);
    }
  };

  const handleNext = () => {
    if (store.currentStep < STEPS.length - 1) {
      store.setStep(store.currentStep + 1);
    }
  };

  const handleBack = () => {
    if (store.currentStep > 0) {
      store.setStep(store.currentStep - 1);
    } else {
      router.back();
    }
  };

  const handlePay = async () => {
    if (!store.packageId || !store.pickupDate || !store.pickupSlot || !store.pickupAddress) {
      Alert.alert("Error", "Please complete all steps");
      return;
    }

    try {
      const result = await createBooking.mutateAsync({
        merchantId,
        packageId: store.packageId,
        vehicleId: store.vehicleId ?? undefined,
        pickupAddress: store.pickupAddress,
        pickupLat: store.pickupCoords?.lat ?? 0,
        pickupLng: store.pickupCoords?.lng ?? 0,
        pickupDate: store.pickupDate,
        pickupSlot: store.pickupSlot,
        driverNote: store.driverNote || undefined,
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.clientSecret,
        merchantDisplayName: merchant?.name ?? "PickupWash",
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== "Canceled") {
          Alert.alert("Payment failed", presentError.message);
        }
        return;
      }

      store.reset();
      router.replace(`/booking/${result.bookingId}`);
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Failed to create booking");
    }
  };

  const canProceed = () => {
    switch (store.currentStep) {
      case 0:
        return !!store.packageId;
      case 1:
        return !!store.pickupDate && !!store.pickupSlot;
      case 2:
        return !!store.pickupAddress;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Book Service",
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <Text className="text-primary-500">Back</Text>
            </Pressable>
          ),
        }}
      />

      <StepIndicator steps={STEPS} currentStep={store.currentStep} />

      <ScrollView className="flex-1 px-4">
        {/* Step 0: Package Selection */}
        {store.currentStep === 0 && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Select a package</Text>
            <View className="gap-3">
              {packages?.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={store.packageId === pkg.id}
                  onSelect={() => store.setPackage(pkg.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step 1: Date & Time */}
        {store.currentStep === 1 && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Choose date & time</Text>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-4"
            >
              <Text className={selectedDate ? "text-gray-900" : "text-gray-400"}>
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate ?? new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {slots && (
              <View className="mt-6">
                <Text className="mb-3 font-medium text-gray-700">
                  Available time slots
                </Text>
                <SlotPicker
                  slots={slots}
                  selectedSlot={store.pickupSlot}
                  onSelectSlot={handleSlotSelect}
                />
              </View>
            )}
          </View>
        )}

        {/* Step 2: Address */}
        {store.currentStep === 2 && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Pickup address</Text>

            <TextInput
              className="rounded-xl border border-gray-300 bg-white px-4 py-4"
              placeholder="Enter your full address"
              value={store.pickupAddress ?? ""}
              onChangeText={(text) =>
                // TODO: Implement proper geocoding service to convert address to coordinates
                // Currently using user's current location as a reasonable default
                store.setAddress(text, userLocation ?? { lat: 14.5547, lng: 121.0244 })
              }
              multiline
              numberOfLines={3}
            />

            <View className="mt-4">
              <Text className="mb-2 font-medium text-gray-700">
                Note for driver (optional)
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4"
                placeholder="E.g., Gate code, parking instructions..."
                value={store.driverNote}
                onChangeText={store.setDriverNote}
                multiline
              />
            </View>
          </View>
        )}

        {/* Step 3: Review & Pay */}
        {store.currentStep === 3 && selectedPackage && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Review & Pay</Text>

            <View className="rounded-xl bg-gray-50 p-4">
              <Text className="font-semibold text-gray-900">{merchant?.name}</Text>
              <Text className="text-gray-500">{selectedPackage.name}</Text>

              <View className="mt-4 border-t border-gray-200 pt-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Package</Text>
                  <Text>₱{selectedPackage.price}</Text>
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-gray-500">Pickup fee</Text>
                  <Text>₱{selectedPackage.pickup_fee}</Text>
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-gray-500">Service fee</Text>
                  <Text>₱{PLATFORM_FEE}</Text>
                </View>
                <View className="mt-4 flex-row justify-between border-t border-gray-200 pt-4">
                  <Text className="font-semibold">Total</Text>
                  <Text className="text-lg font-bold text-primary-500">
                    ₱{totalAmount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="border-t border-gray-200 px-4 py-4">
        {store.currentStep < 3 ? (
          <Button onPress={handleNext} disabled={!canProceed()}>
            Continue
          </Button>
        ) : (
          <Button onPress={handlePay} loading={createBooking.isPending}>
            Pay ₱{totalAmount}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
