import { View, Image, Text } from "react-native";

interface AvatarProps {
  src?: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
};

export function Avatar({ src, fallback, size = "md" }: AvatarProps) {
  const initials = fallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        className={`${sizeClasses[size]} rounded-full bg-gray-200`}
      />
    );
  }

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center rounded-full bg-primary-100`}
    >
      <Text className={`${textSizeClasses[size]} font-semibold text-primary-600`}>
        {initials}
      </Text>
    </View>
  );
}
