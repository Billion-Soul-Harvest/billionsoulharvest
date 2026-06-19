import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/features/auth/hooks";
import { Button, Input } from "@/shared/components";

export default function VerifyPhoneScreen() {
  const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    try {
      setError(null);
      await sendOtp(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError(null);
      await verifyOtp({ phone, token: otp });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-gray-900">
            Verify your phone
          </Text>
          <Text className="mt-2 text-gray-500">
            We'll send you a code to verify your phone number
          </Text>

          <View className="mt-8 gap-4">
            {!otpSent ? (
              <>
                <Input
                  label="Phone Number"
                  placeholder="+63 917 123 4567"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={phone}
                  onChangeText={setPhone}
                />

                {error && <Text className="text-sm text-error">{error}</Text>}

                <View className="mt-4">
                  <Button onPress={handleSendOtp} loading={isSendingOtp}>
                    Send Code
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Input
                  label="Verification Code"
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />

                {error && <Text className="text-sm text-error">{error}</Text>}

                <View className="mt-4">
                  <Button onPress={handleVerifyOtp} loading={isVerifyingOtp}>
                    Verify
                  </Button>
                </View>

                <Button variant="ghost" onPress={() => setOtpSent(false)}>
                  Change phone number
                </Button>
              </>
            )}

            <View className="mt-4">
              <Button variant="ghost" onPress={handleSkip}>
                Skip for now
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
