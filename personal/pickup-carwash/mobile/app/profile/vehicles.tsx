import { useState } from "react";
import { View, Text, FlatList, TextInput, Alert } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicles, useAddVehicle, useDeleteVehicle } from "@/features/profile/hooks";
import { VehicleCard } from "@/features/profile/components";
import { Button, Card, EmptyState } from "@/shared/components";

export default function VehiclesScreen() {
  const { data: vehicles, isLoading } = useVehicles();
  const addVehicle = useAddVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [showForm, setShowForm] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const handleAdd = async () => {
    if (!make || !model || !color) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await addVehicle.mutateAsync({
        make,
        model,
        color,
        plate_number: plateNumber || null,
        is_default: vehicles?.length === 0,
      });
      setShowForm(false);
      setMake("");
      setModel("");
      setColor("");
      setPlateNumber("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Stack.Screen options={{ title: "My Vehicles" }} />

      {showForm ? (
        <View className="flex-1 px-4 py-4">
          <Card>
            <Text className="mb-4 text-lg font-semibold">Add Vehicle</Text>

            <View className="gap-4">
              <View>
                <Text className="mb-1 text-sm text-gray-600">Make *</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="Toyota"
                  value={make}
                  onChangeText={setMake}
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-gray-600">Model *</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="Vios"
                  value={model}
                  onChangeText={setModel}
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-gray-600">Color *</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="White"
                  value={color}
                  onChangeText={setColor}
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-gray-600">
                  Plate Number (optional)
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="ABC 1234"
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <View className="flex-1">
                <Button variant="secondary" onPress={() => setShowForm(false)}>
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button onPress={handleAdd} loading={addVehicle.isPending}>
                  Add
                </Button>
              </View>
            </View>
          </Card>
        </View>
      ) : (
        <>
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VehicleCard
                vehicle={item}
                onDelete={() => deleteVehicle.mutate(item.id)}
              />
            )}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            ListEmptyComponent={
              <EmptyState
                title="No vehicles yet"
                description="Add your first vehicle to get started"
              />
            }
          />

          <View className="border-t border-gray-200 bg-white px-4 py-4">
            <Button onPress={() => setShowForm(true)}>Add Vehicle</Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
