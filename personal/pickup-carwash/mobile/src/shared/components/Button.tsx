import { Pressable, Text, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 active:bg-primary-600",
        secondary: "bg-gray-100 active:bg-gray-200",
        outline: "border border-gray-300 bg-transparent active:bg-gray-50",
        destructive: "bg-error active:bg-red-600",
        ghost: "bg-transparent active:bg-gray-100",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-12 px-6",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-gray-900",
      outline: "text-gray-900",
      destructive: "text-white",
      ghost: "text-gray-900",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress: () => void;
  children: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant,
  size,
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${buttonVariants({ variant, size })} ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "destructive" ? "white" : "#3B82F6"}
          size="small"
        />
      ) : (
        <Text className={textVariants({ variant, size })}>{children}</Text>
      )}
    </Pressable>
  );
}
