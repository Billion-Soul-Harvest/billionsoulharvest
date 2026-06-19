import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useAuthStore } from "@/features/auth/store";
import type { BookingWithRelations } from "@/shared/types/database";

export function useMyBookings() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.bookings.all(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          merchant:merchants(name, logo_url),
          package:packages(name)
        `
        )
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BookingWithRelations[];
    },
    enabled: !!user,
  });
}
