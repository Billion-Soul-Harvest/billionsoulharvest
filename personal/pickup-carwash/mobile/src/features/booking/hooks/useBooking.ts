import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { BookingWithRelations } from "@/shared/types/database";

export function useBooking(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.bookings.detail(id),
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
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BookingWithRelations;
    },
    enabled: !!id,
  });

  // Realtime subscription for status updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`booking-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          queryClient.setQueryData(queryKeys.bookings.detail(id), (old: any) => ({
            ...old,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return query;
}
