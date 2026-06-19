import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { useAuthStore } from "../store";
import type { LoginFormData, RegisterFormData } from "../types";

export function useAuth() {
  const { setSession, clear } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { data: result, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      setSession(data.session);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      setSession(data.session);
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, token }: { phone: string; token: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) throw error;
      return data;
    },
  });

  const logout = async () => {
    await supabase.auth.signOut();
    clear();
  };

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    sendOtp: sendOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isSendingOtp: sendOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
