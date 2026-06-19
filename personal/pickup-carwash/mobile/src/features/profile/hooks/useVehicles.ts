import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useAuthStore } from "@/features/auth/store";
import type { Vehicle } from "@/shared/types/database";

export function useVehicles() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.vehicles(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!user,
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, "id" | "customer_id" | "created_at">) => {
      const { error } = await supabase.from("vehicles").insert({
        ...vehicle,
        customer_id: user!.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
    },
  });
}
