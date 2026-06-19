import { View, Text, TextInput, type TextInputProps } from "react-native";
import { forwardRef } from "react";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-gray-700">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`h-12 rounded-xl border bg-white px-4 text-base ${
            error ? "border-error" : "border-gray-300"
          } ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {error && (
          <Text className="mt-1 text-sm text-error">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
