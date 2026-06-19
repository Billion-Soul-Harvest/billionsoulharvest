import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AppProviders } from "@/shared/providers/AppProviders";
import { useAuthStore } from "@/features/auth/store";
import { supabase } from "@/shared/lib/supabase";
import { usePushNotifications } from "@/shared/hooks/usePushNotifications";

export default function RootLayout() {
  const { setSession, setInitialized } = useAuthStore();
  usePushNotifications();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
        <AppProviders>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="merchant/[id]" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="booking" />
          </Stack>
        </AppProviders>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
