import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useAuthStore } from "@/features/auth/store";
import type { Customer } from "@/shared/types/database";

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data as Customer;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (updates: Partial<Customer>) => {
      const { error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    },
  });
}
