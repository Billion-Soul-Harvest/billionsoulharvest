import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { CreateBookingRequest, CreateBookingResponse } from "../types";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBookingRequest): Promise<CreateBookingResponse> => {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: request,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
  });
}
