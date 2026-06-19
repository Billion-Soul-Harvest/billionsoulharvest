import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Package } from "@/shared/types/database";

export function useMerchantPackages(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.merchants.packages(merchantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("merchant_id", merchantId)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as Package[];
    },
    enabled: !!merchantId,
  });
}
