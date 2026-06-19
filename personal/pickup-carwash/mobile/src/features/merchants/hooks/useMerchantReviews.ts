import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Review } from "@/shared/types/database";

interface ReviewWithCustomer extends Review {
  customer: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useMerchantReviews(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.merchants.reviews(merchantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          *,
          customer:customers(full_name, avatar_url)
        `
        )
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ReviewWithCustomer[];
    },
    enabled: !!merchantId,
  });
}
