import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { AvailableSlot } from "@/shared/types/database";

export function useAvailableSlots(merchantId: string, date: string | null) {
  return useQuery({
    queryKey: queryKeys.merchants.slots(merchantId, date ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_available_slots", {
        p_merchant_id: merchantId,
        p_date: date ?? "",
      });

      if (error) throw error;
      return data as AvailableSlot[];
    },
    enabled: !!merchantId && !!date,
  });
}
