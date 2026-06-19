import { View, Text } from "react-native";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-4">
      {steps.map((step, index) => (
        <View key={step} className="flex-1 flex-row items-center">
          <View className="items-center">
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                index <= currentStep ? "bg-primary-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-semibold ${
                  index <= currentStep ? "text-white" : "text-gray-500"
                }`}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              className={`mt-1 text-xs ${
                index <= currentStep ? "text-primary-500" : "text-gray-400"
              }`}
            >
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              className={`mx-2 h-0.5 flex-1 ${
                index < currentStep ? "bg-primary-500" : "bg-gray-200"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );
}
