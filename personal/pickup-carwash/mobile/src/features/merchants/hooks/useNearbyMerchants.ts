import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { NearbyMerchant } from "@/shared/types/database";

interface UseNearbyMerchantsParams {
  lat: number | null;
  lng: number | null;
  radius?: number;
  enabled?: boolean;
}

export function useNearbyMerchants({
  lat,
  lng,
  radius = 10,
  enabled = true,
}: UseNearbyMerchantsParams) {
  return useQuery({
    queryKey: queryKeys.merchants.nearby(lat ?? 0, lng ?? 0, radius),
    queryFn: async () => {
      if (lat === null || lng === null) {
        return [];
      }

      const { data, error } = await supabase.rpc("get_nearby_merchants", {
        user_lat: lat,
        user_lng: lng,
        radius_km: radius,
      });

      if (error) throw error;
      return data as NearbyMerchant[];
    },
    enabled: enabled && lat !== null && lng !== null,
  });
}
