import { View, Text } from "react-native";
import { Avatar } from "@/shared/components";
import { RatingStars } from "./RatingStars";

interface ReviewCardProps {
  review: {
    rating: number;
    comment: string | null;
    created_at: string;
    customer: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const name = review.customer.full_name || "Customer";
  const date = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View className="py-4">
      <View className="flex-row items-center gap-3">
        <Avatar
          src={review.customer.avatar_url}
          fallback={name}
          size="sm"
        />
        <View className="flex-1">
          <Text className="font-medium text-gray-900">{name}</Text>
          <Text className="text-xs text-gray-500">{date}</Text>
        </View>
        <RatingStars rating={review.rating} size="sm" />
      </View>
      {review.comment && (
        <Text className="mt-3 text-gray-600">{review.comment}</Text>
      )}
    </View>
  );
}
