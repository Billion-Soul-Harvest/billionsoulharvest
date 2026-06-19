# PickupWash Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Native customer app for discovering car wash merchants, booking pickups, paying via Stripe, and tracking bookings in real-time.

**Architecture:** Feature-based structure with Expo Router for navigation, Zustand for local state, TanStack Query for server state, and NativeWind for styling. Each feature (auth, merchants, booking, profile) owns its screens, components, hooks, and types.

**Tech Stack:** Expo SDK 52, TypeScript, Expo Router, NativeWind v4, Zustand, TanStack Query, Supabase, Stripe, react-native-maps

## Global Constraints

- Expo SDK 52 managed workflow
- TypeScript strict mode
- NativeWind v4 for all styling (no inline StyleSheet)
- All API calls through TanStack Query hooks
- Zustand for local-only state (auth session, booking draft, location)
- File-based routing with Expo Router
- Environment variables prefixed with `EXPO_PUBLIC_`

---

### Task 1: Project Initialization

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/app.json`
- Create: `mobile/tsconfig.json`
- Create: `mobile/tailwind.config.js`
- Create: `mobile/global.css`
- Create: `mobile/babel.config.js`
- Create: `mobile/.env.example`
- Create: `mobile/metro.config.js`

**Interfaces:**
- Produces: Configured Expo project with NativeWind ready

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/bertwinromero/Documents/personal/pickup-carwash
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
```

- [ ] **Step 2: Install core dependencies**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens react-native-gesture-handler
npm install nativewind tailwindcss@^3.4.0 --save-dev
npm install zustand @tanstack/react-query @supabase/supabase-js react-hook-form zod @hookform/resolvers
npm install @react-native-async-storage/async-storage
```

- [ ] **Step 3: Create tailwind.config.js**

Create file `mobile/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Create global.css**

Create file `mobile/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create babel.config.js**

Create file `mobile/babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- [ ] **Step 6: Create metro.config.js**

Create file `mobile/metro.config.js`:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 7: Create nativewind-env.d.ts**

Create file `mobile/nativewind-env.d.ts`:

```typescript
/// <reference types="nativewind/types" />
```

- [ ] **Step 8: Update tsconfig.json**

Create file `mobile/tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts", "nativewind-env.d.ts"]
}
```

- [ ] **Step 9: Update app.json for Expo Router**

Update `mobile/app.json`:

```json
{
  "expo": {
    "name": "PickupWash",
    "slug": "pickupwash",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "pickupwash",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.pickupwash.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "com.pickupwash.app"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 10: Create .env.example**

Create file `mobile/.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

- [ ] **Step 11: Create src directory structure**

```bash
mkdir -p src/features/auth/components src/features/auth/hooks
mkdir -p src/features/merchants/components src/features/merchants/hooks
mkdir -p src/features/booking/components src/features/booking/hooks
mkdir -p src/features/profile/components src/features/profile/hooks
mkdir -p src/shared/components src/shared/hooks src/shared/lib src/shared/types
```

- [ ] **Step 12: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): initialize Expo project with NativeWind"
```

---

### Task 2: Shared Library Setup

**Files:**
- Create: `mobile/src/shared/lib/supabase.ts`
- Create: `mobile/src/shared/lib/queryClient.ts`
- Create: `mobile/src/shared/lib/queryKeys.ts`
- Create: `mobile/src/shared/types/database.ts`

**Interfaces:**
- Produces: `supabase` client, `queryClient` instance, `queryKeys` object, database types

- [ ] **Step 1: Create Supabase client**

Create file `mobile/src/shared/lib/supabase.ts`:

```typescript
import "react-native-url-polyfill/dist/polyfill";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 2: Install URL polyfill**

```bash
cd mobile && npm install react-native-url-polyfill
```

- [ ] **Step 3: Create query client**

Create file `mobile/src/shared/lib/queryClient.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
```

- [ ] **Step 4: Create query keys**

Create file `mobile/src/shared/lib/queryKeys.ts`:

```typescript
export const queryKeys = {
  merchants: {
    nearby: (lat: number, lng: number, radius: number) =>
      ["merchants", "nearby", { lat, lng, radius }] as const,
    detail: (id: string) => ["merchants", id] as const,
    packages: (id: string) => ["merchants", id, "packages"] as const,
    reviews: (id: string) => ["merchants", id, "reviews"] as const,
    slots: (id: string, date: string) =>
      ["merchants", id, "slots", date] as const,
  },
  bookings: {
    all: () => ["bookings"] as const,
    detail: (id: string) => ["bookings", id] as const,
  },
  profile: () => ["profile"] as const,
  vehicles: () => ["vehicles"] as const,
};
```

- [ ] **Step 5: Create database types**

Create file `mobile/src/shared/types/database.ts`:

```typescript
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  rating_avg: number | null;
  review_count: number;
  default_slot_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NearbyMerchant extends Merchant {
  distance_km: number;
  starting_price: number | null;
}

export interface Package {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number;
  pickup_fee: number;
  duration_mins: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  avatar_url: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  color: string;
  plate_number: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  merchant_id: string;
  package_id: string;
  vehicle_id: string | null;
  status: BookingStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_date: string;
  pickup_slot: string;
  driver_note: string | null;
  package_price: number;
  pickup_fee: number;
  platform_fee: number;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithRelations extends Booking {
  merchant: Pick<Merchant, "name" | "logo_url">;
  package: Pick<Package, "name">;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  merchant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
  slot_label: string;
  available: boolean;
  remaining: number;
}

export interface Database {
  public: {
    Tables: {
      merchants: { Row: Merchant };
      packages: { Row: Package };
      customers: { Row: Customer };
      vehicles: { Row: Vehicle };
      bookings: { Row: Booking };
      reviews: { Row: Review };
    };
    Functions: {
      get_nearby_merchants: {
        Args: { user_lat: number; user_lng: number; radius_km: number };
        Returns: NearbyMerchant[];
      };
      get_available_slots: {
        Args: { p_merchant_id: string; p_date: string };
        Returns: AvailableSlot[];
      };
    };
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add mobile/src/shared/
git commit -m "feat(mobile): add Supabase client, query client, and database types"
```

---

### Task 3: Shared UI Components

**Files:**
- Create: `mobile/src/shared/components/Button.tsx`
- Create: `mobile/src/shared/components/Input.tsx`
- Create: `mobile/src/shared/components/Card.tsx`
- Create: `mobile/src/shared/components/Avatar.tsx`
- Create: `mobile/src/shared/components/Badge.tsx`
- Create: `mobile/src/shared/components/Skeleton.tsx`
- Create: `mobile/src/shared/components/EmptyState.tsx`
- Create: `mobile/src/shared/components/index.ts`

**Interfaces:**
- Produces: Reusable UI components with NativeWind styling

- [ ] **Step 1: Create Button component**

Create file `mobile/src/shared/components/Button.tsx`:

```typescript
import { Pressable, Text, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 active:bg-primary-600",
        secondary: "bg-gray-100 active:bg-gray-200",
        outline: "border border-gray-300 bg-transparent active:bg-gray-50",
        destructive: "bg-error active:bg-red-600",
        ghost: "bg-transparent active:bg-gray-100",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-12 px-6",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-gray-900",
      outline: "text-gray-900",
      destructive: "text-white",
      ghost: "text-gray-900",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress: () => void;
  children: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant,
  size,
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${buttonVariants({ variant, size })} ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "destructive" ? "white" : "#3B82F6"}
          size="small"
        />
      ) : (
        <Text className={textVariants({ variant, size })}>{children}</Text>
      )}
    </Pressable>
  );
}
```

- [ ] **Step 2: Install class-variance-authority**

```bash
cd mobile && npm install class-variance-authority
```

- [ ] **Step 3: Create Input component**

Create file `mobile/src/shared/components/Input.tsx`:

```typescript
import { View, Text, TextInput, type TextInputProps } from "react-native";
import { forwardRef } from "react";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-gray-700">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`h-12 rounded-xl border bg-white px-4 text-base ${
            error ? "border-error" : "border-gray-300"
          } ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {error && (
          <Text className="mt-1 text-sm text-error">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
```

- [ ] **Step 4: Create Card component**

Create file `mobile/src/shared/components/Card.tsx`:

```typescript
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 5: Create Avatar component**

Create file `mobile/src/shared/components/Avatar.tsx`:

```typescript
import { View, Image, Text } from "react-native";

interface AvatarProps {
  src?: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
};

export function Avatar({ src, fallback, size = "md" }: AvatarProps) {
  const initials = fallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        className={`${sizeClasses[size]} rounded-full bg-gray-200`}
      />
    );
  }

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center rounded-full bg-primary-100`}
    >
      <Text className={`${textSizeClasses[size]} font-semibold text-primary-600`}>
        {initials}
      </Text>
    </View>
  );
}
```

- [ ] **Step 6: Create Badge component**

Create file `mobile/src/shared/components/Badge.tsx`:

```typescript
import { View, Text } from "react-native";
import type { BookingStatus } from "../types/database";

const statusConfig: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Awaiting Payment" },
  confirmed: { bg: "bg-primary-100", text: "text-primary-700", label: "Confirmed" },
  picked_up: { bg: "bg-warning/20", text: "text-warning", label: "Car Picked Up" },
  in_progress: { bg: "bg-warning/20", text: "text-warning", label: "Washing" },
  completed: { bg: "bg-success/20", text: "text-success", label: "Completed" },
  cancelled: { bg: "bg-error/20", text: "text-error", label: "Cancelled" },
};

interface BadgeProps {
  status: BookingStatus;
}

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <View className={`rounded-full px-3 py-1 ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
```

- [ ] **Step 7: Create Skeleton component**

Create file `mobile/src/shared/components/Skeleton.tsx`:

```typescript
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedClasses = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({
  width = "100%",
  height = 20,
  rounded = "md",
  className = "",
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width, height }, animatedStyle]}
      className={`bg-gray-200 ${roundedClasses[rounded]} ${className}`}
    />
  );
}
```

- [ ] **Step 8: Install reanimated**

```bash
cd mobile && npx expo install react-native-reanimated
```

- [ ] **Step 9: Create EmptyState component**

Create file `mobile/src/shared/components/EmptyState.tsx`:

```typescript
import { View, Text } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-center text-lg font-semibold text-gray-900">
        {title}
      </Text>
      {description && (
        <Text className="mt-2 text-center text-gray-500">{description}</Text>
      )}
      {actionLabel && onAction && (
        <View className="mt-6">
          <Button onPress={onAction}>{actionLabel}</Button>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 10: Create index barrel export**

Create file `mobile/src/shared/components/index.ts`:

```typescript
export { Button } from "./Button";
export { Input } from "./Input";
export { Card } from "./Card";
export { Avatar } from "./Avatar";
export { Badge } from "./Badge";
export { Skeleton } from "./Skeleton";
export { EmptyState } from "./EmptyState";
```

- [ ] **Step 11: Commit**

```bash
git add mobile/src/shared/components/
git commit -m "feat(mobile): add shared UI components"
```

---

### Task 4: Auth Store and Hooks

**Files:**
- Create: `mobile/src/features/auth/store.ts`
- Create: `mobile/src/features/auth/hooks/useAuth.ts`
- Create: `mobile/src/features/auth/types.ts`
- Create: `mobile/src/features/auth/hooks/index.ts`

**Interfaces:**
- Produces: `useAuthStore` (Zustand), `useAuth()` hook with login/register/logout

- [ ] **Step 1: Create auth types**

Create file `mobile/src/features/auth/types.ts`:

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const verifyPhoneSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;
```

- [ ] **Step 2: Create auth store**

Create file `mobile/src/features/auth/store.ts`:

```typescript
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clear: () =>
    set({
      user: null,
      session: null,
      isLoading: false,
    }),
}));
```

- [ ] **Step 3: Create useAuth hook**

Create file `mobile/src/features/auth/hooks/useAuth.ts`:

```typescript
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
```

- [ ] **Step 4: Create hooks barrel export**

Create file `mobile/src/features/auth/hooks/index.ts`:

```typescript
export { useAuth } from "./useAuth";
```

- [ ] **Step 5: Commit**

```bash
git add mobile/src/features/auth/
git commit -m "feat(mobile): add auth store and hooks"
```

---

### Task 5: App Layout and Navigation

**Files:**
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/(tabs)/_layout.tsx`
- Create: `mobile/app/(tabs)/index.tsx`
- Create: `mobile/app/(tabs)/search.tsx`
- Create: `mobile/app/(tabs)/bookings.tsx`
- Create: `mobile/app/(tabs)/profile.tsx`
- Create: `mobile/app/(auth)/_layout.tsx`
- Create: `mobile/src/shared/providers/AppProviders.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `queryClient`, `supabase`
- Produces: Root layout with providers, tab navigation, auth guard

- [ ] **Step 1: Create AppProviders**

Create file `mobile/src/shared/providers/AppProviders.tsx`:

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create root layout**

Create file `mobile/app/_layout.tsx`:

```typescript
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProviders } from "@/shared/providers/AppProviders";
import { useAuthStore } from "@/features/auth/store";
import { supabase } from "@/shared/lib/supabase";

export default function RootLayout() {
  const { setSession, setInitialized } = useAuthStore();

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
      <AppProviders>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="merchant/[id]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="booking" />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 3: Create tabs layout**

Create file `mobile/app/(tabs)/_layout.tsx`:

```typescript
import { Tabs, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/features/auth/store";

export default function TabsLayout() {
  const { session, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 4: Install expo icons**

```bash
cd mobile && npx expo install @expo/vector-icons
```

- [ ] **Step 5: Create Home tab placeholder**

Create file `mobile/app/(tabs)/index.tsx`:

```typescript
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/features/auth/store";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.full_name || "there";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-gray-900">
            Hi, {displayName}!
          </Text>
          <Text className="mt-1 text-gray-500">
            Ready to get your car washed?
          </Text>
        </View>

        {/* Active booking card will go here */}
        {/* Nearby merchants preview will go here */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 6: Create Search tab placeholder**

Create file `mobile/app/(tabs)/search.tsx`:

```typescript
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-gray-500">Search merchants</Text>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 7: Create Bookings tab placeholder**

Create file `mobile/app/(tabs)/bookings.tsx`:

```typescript
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-gray-500">Your bookings</Text>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 8: Create Profile tab placeholder**

Create file `mobile/app/(tabs)/profile.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";
import { Avatar, Button } from "@/shared/components";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const displayName = user?.user_metadata?.full_name || "User";
  const email = user?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 py-6">
        <View className="items-center pb-6">
          <Avatar fallback={displayName} size="lg" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            {displayName}
          </Text>
          <Text className="text-gray-500">{email}</Text>
        </View>

        <View className="mt-auto pb-4">
          <Button variant="destructive" onPress={logout}>
            Sign Out
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 9: Create auth layout**

Create file `mobile/app/(auth)/_layout.tsx`:

```typescript
import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/features/auth/store";

export default function AuthLayout() {
  const { session, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-phone" />
    </Stack>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add mobile/app/ mobile/src/shared/providers/
git commit -m "feat(mobile): add navigation structure with auth guard"
```

---

### Task 6: Auth Screens

**Files:**
- Create: `mobile/app/(auth)/login.tsx`
- Create: `mobile/app/(auth)/register.tsx`
- Create: `mobile/app/(auth)/verify-phone.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `Input`, `Button`
- Produces: Complete auth flow screens

- [ ] **Step 1: Create Login screen**

Create file `mobile/app/(auth)/login.tsx`:

```typescript
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks";
import { loginSchema, type LoginFormData } from "@/features/auth/types";
import { Button, Input } from "@/shared/components";

export default function LoginScreen() {
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
          <Text className="mt-2 text-gray-500">Sign in to your account</Text>

          <View className="mt-8 gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            {loginError && (
              <Text className="text-sm text-error">
                {loginError.message || "Invalid email or password"}
              </Text>
            )}

            <View className="mt-4">
              <Button onPress={handleSubmit(onSubmit)} loading={isLoggingIn}>
                Sign In
              </Button>
            </View>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="font-semibold text-primary-500">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Create Register screen**

Create file `mobile/app/(auth)/register.tsx`:

```typescript
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks";
import { registerSchema, type RegisterFormData } from "@/features/auth/types";
import { Button, Input } from "@/shared/components";

export default function RegisterScreen() {
  const { register, isRegistering, registerError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      router.replace("/(auth)/verify-phone");
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-8">
            <Text className="text-3xl font-bold text-gray-900">Create account</Text>
            <Text className="mt-2 text-gray-500">
              Sign up to start booking car washes
            </Text>

            <View className="mt-8 gap-4">
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    autoComplete="name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="At least 8 characters"
                    secureTextEntry
                    autoComplete="new-password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              {registerError && (
                <Text className="text-sm text-error">
                  {registerError.message || "Failed to create account"}
                </Text>
              )}

              <View className="mt-4">
                <Button onPress={handleSubmit(onSubmit)} loading={isRegistering}>
                  Create Account
                </Button>
              </View>
            </View>

            <View className="mt-8 flex-row justify-center">
              <Text className="text-gray-500">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="font-semibold text-primary-500">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Create Verify Phone screen**

Create file `mobile/app/(auth)/verify-phone.tsx`:

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add mobile/app/\(auth\)/
git commit -m "feat(mobile): add auth screens (login, register, verify-phone)"
```

---

### Task 7: Merchants Feature Hooks

**Files:**
- Create: `mobile/src/features/merchants/types.ts`
- Create: `mobile/src/features/merchants/hooks/useNearbyMerchants.ts`
- Create: `mobile/src/features/merchants/hooks/useMerchant.ts`
- Create: `mobile/src/features/merchants/hooks/useMerchantPackages.ts`
- Create: `mobile/src/features/merchants/hooks/useMerchantReviews.ts`
- Create: `mobile/src/features/merchants/hooks/index.ts`

**Interfaces:**
- Consumes: `supabase`, `queryKeys`
- Produces: Query hooks for merchant data

- [ ] **Step 1: Create merchants types**

Create file `mobile/src/features/merchants/types.ts`:

```typescript
export interface MerchantFilters {
  radius: number;
  minRating?: number;
  maxPrice?: number;
}

export const DEFAULT_FILTERS: MerchantFilters = {
  radius: 10,
};
```

- [ ] **Step 2: Create useNearbyMerchants hook**

Create file `mobile/src/features/merchants/hooks/useNearbyMerchants.ts`:

```typescript
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
```

- [ ] **Step 3: Create useMerchant hook**

Create file `mobile/src/features/merchants/hooks/useMerchant.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Merchant } from "@/shared/types/database";

export function useMerchant(id: string) {
  return useQuery({
    queryKey: queryKeys.merchants.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Merchant;
    },
    enabled: !!id,
  });
}
```

- [ ] **Step 4: Create useMerchantPackages hook**

Create file `mobile/src/features/merchants/hooks/useMerchantPackages.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Package } from "@/shared/types/database";

export function useMerchantPackages(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.merchants.packages(merchantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("merchant_id", merchantId)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as Package[];
    },
    enabled: !!merchantId,
  });
}
```

- [ ] **Step 5: Create useMerchantReviews hook**

Create file `mobile/src/features/merchants/hooks/useMerchantReviews.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Review } from "@/shared/types/database";

interface ReviewWithCustomer extends Review {
  customer: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useMerchantReviews(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.merchants.reviews(merchantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          *,
          customer:customers(full_name, avatar_url)
        `
        )
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ReviewWithCustomer[];
    },
    enabled: !!merchantId,
  });
}
```

- [ ] **Step 6: Create hooks barrel export**

Create file `mobile/src/features/merchants/hooks/index.ts`:

```typescript
export { useNearbyMerchants } from "./useNearbyMerchants";
export { useMerchant } from "./useMerchant";
export { useMerchantPackages } from "./useMerchantPackages";
export { useMerchantReviews } from "./useMerchantReviews";
```

- [ ] **Step 7: Commit**

```bash
git add mobile/src/features/merchants/
git commit -m "feat(mobile): add merchant query hooks"
```

---

### Task 8: Merchant Components

**Files:**
- Create: `mobile/src/features/merchants/components/MerchantCard.tsx`
- Create: `mobile/src/features/merchants/components/PackageCard.tsx`
- Create: `mobile/src/features/merchants/components/ReviewCard.tsx`
- Create: `mobile/src/features/merchants/components/RatingStars.tsx`
- Create: `mobile/src/features/merchants/components/index.ts`

**Interfaces:**
- Consumes: `NearbyMerchant`, `Package`, `Review`
- Produces: Display components for merchant data

- [ ] **Step 1: Create RatingStars component**

Create file `mobile/src/features/merchants/components/RatingStars.tsx`:

```typescript
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RatingStarsProps {
  rating: number | null;
  count?: number;
  size?: "sm" | "md";
}

export function RatingStars({ rating, count, size = "md" }: RatingStarsProps) {
  const iconSize = size === "sm" ? 14 : 18;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (rating === null) {
    return (
      <Text className={`${textSize} text-gray-400`}>No reviews yet</Text>
    );
  }

  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={iconSize} color="#F59E0B" />
      <Text className={`${textSize} font-medium text-gray-900`}>
        {rating.toFixed(1)}
      </Text>
      {count !== undefined && (
        <Text className={`${textSize} text-gray-500`}>({count})</Text>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Create MerchantCard component**

Create file `mobile/src/features/merchants/components/MerchantCard.tsx`:

```typescript
import { View, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { NearbyMerchant } from "@/shared/types/database";
import { Card } from "@/shared/components";
import { RatingStars } from "./RatingStars";

interface MerchantCardProps {
  merchant: NearbyMerchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  return (
    <Link href={`/merchant/${merchant.id}`} asChild>
      <Pressable>
        <Card className="overflow-hidden p-0">
          {merchant.cover_image_url && (
            <Image
              source={{ uri: merchant.cover_image_url }}
              className="h-32 w-full"
              resizeMode="cover"
            />
          )}
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {merchant.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-500">
                    {merchant.distance_km.toFixed(1)} km away
                  </Text>
                </View>
              </View>
              <RatingStars
                rating={merchant.rating_avg}
                count={merchant.review_count}
                size="sm"
              />
            </View>
            {merchant.starting_price && (
              <View className="mt-3 flex-row items-center">
                <Text className="text-sm text-gray-500">From </Text>
                <Text className="font-semibold text-primary-500">
                  ₱{merchant.starting_price}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
```

- [ ] **Step 3: Create PackageCard component**

Create file `mobile/src/features/merchants/components/PackageCard.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Package } from "@/shared/types/database";
import { Card } from "@/shared/components";

interface PackageCardProps {
  pkg: Package;
  selected?: boolean;
  onSelect?: () => void;
}

export function PackageCard({ pkg, selected = false, onSelect }: PackageCardProps) {
  return (
    <Pressable onPress={onSelect}>
      <Card
        className={`border-2 ${
          selected ? "border-primary-500 bg-primary-50" : "border-transparent"
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {pkg.name}
            </Text>
            {pkg.description && (
              <Text className="mt-1 text-sm text-gray-500">
                {pkg.description}
              </Text>
            )}
            <View className="mt-2 flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500">
                  {pkg.duration_mins} min
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="car-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500">
                  +₱{pkg.pickup_fee} pickup
                </Text>
              </View>
            </View>
          </View>
          <Text className="text-xl font-bold text-primary-500">
            ₱{pkg.price}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
```

- [ ] **Step 4: Create ReviewCard component**

Create file `mobile/src/features/merchants/components/ReviewCard.tsx`:

```typescript
import { View, Text } from "react-native";
import { Avatar } from "@/shared/components";
import { RatingStars } from "./RatingStars";

interface ReviewCardProps {
  review: {
    rating: number;
    comment: string | null;
    created_at: string;
    customer: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const name = review.customer.full_name || "Customer";
  const date = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View className="py-4">
      <View className="flex-row items-center gap-3">
        <Avatar
          src={review.customer.avatar_url}
          fallback={name}
          size="sm"
        />
        <View className="flex-1">
          <Text className="font-medium text-gray-900">{name}</Text>
          <Text className="text-xs text-gray-500">{date}</Text>
        </View>
        <RatingStars rating={review.rating} size="sm" />
      </View>
      {review.comment && (
        <Text className="mt-3 text-gray-600">{review.comment}</Text>
      )}
    </View>
  );
}
```

- [ ] **Step 5: Create components barrel export**

Create file `mobile/src/features/merchants/components/index.ts`:

```typescript
export { MerchantCard } from "./MerchantCard";
export { PackageCard } from "./PackageCard";
export { ReviewCard } from "./ReviewCard";
export { RatingStars } from "./RatingStars";
```

- [ ] **Step 6: Commit**

```bash
git add mobile/src/features/merchants/components/
git commit -m "feat(mobile): add merchant display components"
```

---

### Task 9: Location Hook and Search Screen

**Files:**
- Create: `mobile/src/shared/hooks/useLocation.ts`
- Create: `mobile/src/features/merchants/store.ts`
- Modify: `mobile/app/(tabs)/search.tsx`

**Interfaces:**
- Consumes: `useNearbyMerchants`, `MerchantCard`
- Produces: Working search screen with merchant list

- [ ] **Step 1: Install expo-location**

```bash
cd mobile && npx expo install expo-location
```

- [ ] **Step 2: Create useLocation hook**

Create file `mobile/src/shared/hooks/useLocation.ts`:

```typescript
import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function getLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) {
            setState({
              coords: null,
              error: "Location permission denied",
              isLoading: false,
            });
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setState({
            coords: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
            error: null,
            isLoading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            coords: null,
            error: "Failed to get location",
            isLoading: false,
          });
        }
      }
    }

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
```

- [ ] **Step 3: Create location store**

Create file `mobile/src/features/merchants/store.ts`:

```typescript
import { create } from "zustand";
import type { MerchantFilters } from "./types";

interface MerchantsState {
  filters: MerchantFilters;
  setFilters: (filters: Partial<MerchantFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: MerchantFilters = {
  radius: 10,
};

export const useMerchantsStore = create<MerchantsState>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
```

- [ ] **Step 4: Update Search screen**

Replace file `mobile/app/(tabs)/search.tsx`:

```typescript
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "@/shared/hooks/useLocation";
import { useNearbyMerchants } from "@/features/merchants/hooks";
import { useMerchantsStore } from "@/features/merchants/store";
import { MerchantCard } from "@/features/merchants/components";
import { EmptyState } from "@/shared/components";

export default function SearchScreen() {
  const { coords, isLoading: locationLoading, error: locationError } = useLocation();
  const { filters } = useMerchantsStore();

  const {
    data: merchants,
    isLoading: merchantsLoading,
    error: merchantsError,
    refetch,
  } = useNearbyMerchants({
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    radius: filters.radius,
    enabled: !!coords,
  });

  const isLoading = locationLoading || merchantsLoading;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">Finding nearby car washes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="Location access needed"
          description="Enable location to find car washes near you"
          actionLabel="Try again"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  if (merchantsError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="Something went wrong"
          description="Failed to load merchants"
          actionLabel="Retry"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">Find Car Wash</Text>
        <Text className="text-gray-500">
          {merchants?.length || 0} places within {filters.radius} km
        </Text>
      </View>

      <FlatList
        data={merchants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MerchantCard merchant={item} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            title="No car washes nearby"
            description="Try expanding your search radius"
          />
        }
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: Create hooks index**

Create file `mobile/src/shared/hooks/index.ts`:

```typescript
export { useLocation } from "./useLocation";
```

- [ ] **Step 6: Commit**

```bash
git add mobile/src/shared/hooks/ mobile/src/features/merchants/store.ts mobile/app/\(tabs\)/search.tsx
git commit -m "feat(mobile): add location hook and search screen"
```

---

### Task 10: Merchant Detail Screen

**Files:**
- Create: `mobile/app/merchant/[id].tsx`

**Interfaces:**
- Consumes: `useMerchant`, `useMerchantPackages`, `useMerchantReviews`, merchant components
- Produces: Merchant detail screen with packages and reviews

- [ ] **Step 1: Create Merchant Detail screen**

Create file `mobile/app/merchant/[id].tsx`:

```typescript
import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMerchant, useMerchantPackages, useMerchantReviews } from "@/features/merchants/hooks";
import { PackageCard, ReviewCard, RatingStars } from "@/features/merchants/components";
import { Button, Skeleton } from "@/shared/components";

export default function MerchantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: merchant, isLoading: merchantLoading } = useMerchant(id);
  const { data: packages, isLoading: packagesLoading } = useMerchantPackages(id);
  const { data: reviews } = useMerchantReviews(id);

  const handleBookPress = () => {
    router.push(`/booking/${id}/new`);
  };

  if (merchantLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!merchant) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "Not Found" }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Merchant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: merchant.name }} />

      <ScrollView className="flex-1">
        {merchant.cover_image_url && (
          <Image
            source={{ uri: merchant.cover_image_url }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-6">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-900">{merchant.name}</Text>
          <View className="mt-2 flex-row items-center gap-4">
            <RatingStars
              rating={merchant.rating_avg}
              count={merchant.review_count}
            />
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500">{merchant.address}</Text>
            </View>
          </View>

          {merchant.description && (
            <Text className="mt-4 text-gray-600">{merchant.description}</Text>
          )}

          {/* Contact */}
          <View className="mt-6 flex-row gap-4">
            {merchant.phone && (
              <Pressable className="flex-row items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                <Ionicons name="call-outline" size={18} color="#3B82F6" />
                <Text className="text-primary-500">Call</Text>
              </Pressable>
            )}
          </View>

          {/* Packages */}
          <View className="mt-8">
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Services
            </Text>
            {packagesLoading ? (
              <View className="gap-3">
                <Skeleton height={100} rounded="lg" />
                <Skeleton height={100} rounded="lg" />
              </View>
            ) : (
              <View className="gap-3">
                {packages?.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </View>
            )}
          </View>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <View className="mt-8">
              <Text className="mb-2 text-xl font-semibold text-gray-900">
                Reviews
              </Text>
              <View className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Button */}
      <View className="border-t border-gray-200 bg-white px-4 py-4">
        <Button onPress={handleBookPress}>Book Now</Button>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/app/merchant/
git commit -m "feat(mobile): add merchant detail screen"
```

---

### Task 11: Booking Store and Hooks

**Files:**
- Create: `mobile/src/features/booking/store.ts`
- Create: `mobile/src/features/booking/types.ts`
- Create: `mobile/src/features/booking/hooks/useAvailableSlots.ts`
- Create: `mobile/src/features/booking/hooks/useMyBookings.ts`
- Create: `mobile/src/features/booking/hooks/useBooking.ts`
- Create: `mobile/src/features/booking/hooks/useCreateBooking.ts`
- Create: `mobile/src/features/booking/hooks/index.ts`

**Interfaces:**
- Produces: Booking state management and query/mutation hooks

- [ ] **Step 1: Create booking types**

Create file `mobile/src/features/booking/types.ts`:

```typescript
import { z } from "zod";

export const addressSchema = z.object({
  address: z.string().min(10, "Enter a complete address"),
  lat: z.number(),
  lng: z.number(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export interface CreateBookingRequest {
  merchantId: string;
  packageId: string;
  vehicleId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupDate: string;
  pickupSlot: string;
  driverNote?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  clientSecret: string;
  totalAmount: number;
}
```

- [ ] **Step 2: Create booking store**

Create file `mobile/src/features/booking/store.ts`:

```typescript
import { create } from "zustand";

interface BookingDraft {
  merchantId: string | null;
  packageId: string | null;
  vehicleId: string | null;
  pickupDate: string | null;
  pickupSlot: string | null;
  pickupAddress: string | null;
  pickupCoords: { lat: number; lng: number } | null;
  driverNote: string;
}

interface BookingState extends BookingDraft {
  currentStep: number;
  setMerchant: (merchantId: string) => void;
  setPackage: (packageId: string) => void;
  setVehicle: (vehicleId: string | null) => void;
  setDateTime: (date: string, slot: string) => void;
  setAddress: (address: string, coords: { lat: number; lng: number }) => void;
  setDriverNote: (note: string) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState: BookingDraft & { currentStep: number } = {
  merchantId: null,
  packageId: null,
  vehicleId: null,
  pickupDate: null,
  pickupSlot: null,
  pickupAddress: null,
  pickupCoords: null,
  driverNote: "",
  currentStep: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setMerchant: (merchantId) => set({ merchantId }),
  setPackage: (packageId) => set({ packageId }),
  setVehicle: (vehicleId) => set({ vehicleId }),
  setDateTime: (date, slot) => set({ pickupDate: date, pickupSlot: slot }),
  setAddress: (address, coords) =>
    set({ pickupAddress: address, pickupCoords: coords }),
  setDriverNote: (driverNote) => set({ driverNote }),
  setStep: (currentStep) => set({ currentStep }),
  reset: () => set(initialState),
}));
```

- [ ] **Step 3: Create useAvailableSlots hook**

Create file `mobile/src/features/booking/hooks/useAvailableSlots.ts`:

```typescript
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
        p_date: date!,
      });

      if (error) throw error;
      return data as AvailableSlot[];
    },
    enabled: !!merchantId && !!date,
  });
}
```

- [ ] **Step 4: Create useMyBookings hook**

Create file `mobile/src/features/booking/hooks/useMyBookings.ts`:

```typescript
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
```

- [ ] **Step 5: Create useBooking hook**

Create file `mobile/src/features/booking/hooks/useBooking.ts`:

```typescript
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
          merchant:merchants(name, logo_url, phone, address),
          package:packages(name, duration_mins)
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
```

- [ ] **Step 6: Create useCreateBooking hook**

Create file `mobile/src/features/booking/hooks/useCreateBooking.ts`:

```typescript
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
```

- [ ] **Step 7: Create hooks barrel export**

Create file `mobile/src/features/booking/hooks/index.ts`:

```typescript
export { useAvailableSlots } from "./useAvailableSlots";
export { useMyBookings } from "./useMyBookings";
export { useBooking } from "./useBooking";
export { useCreateBooking } from "./useCreateBooking";
```

- [ ] **Step 8: Commit**

```bash
git add mobile/src/features/booking/
git commit -m "feat(mobile): add booking store and hooks"
```

---

### Task 12: Booking Components

**Files:**
- Create: `mobile/src/features/booking/components/SlotPicker.tsx`
- Create: `mobile/src/features/booking/components/BookingCard.tsx`
- Create: `mobile/src/features/booking/components/StatusTracker.tsx`
- Create: `mobile/src/features/booking/components/StepIndicator.tsx`
- Create: `mobile/src/features/booking/components/index.ts`

**Interfaces:**
- Consumes: `AvailableSlot`, `BookingWithRelations`, booking store
- Produces: Booking UI components

- [ ] **Step 1: Create SlotPicker component**

Create file `mobile/src/features/booking/components/SlotPicker.tsx`:

```typescript
import { View, Text, Pressable, ScrollView } from "react-native";
import type { AvailableSlot } from "@/shared/types/database";

interface SlotPickerProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export function SlotPicker({ slots, selectedSlot, onSelectSlot }: SlotPickerProps) {
  if (slots.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500">No slots available for this date</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-3 py-2">
        {slots.map((slot) => {
          const slotValue = `${slot.slot_start}-${slot.slot_end}`;
          const isSelected = selectedSlot === slotValue;
          const isDisabled = !slot.available;

          return (
            <Pressable
              key={slotValue}
              onPress={() => !isDisabled && onSelectSlot(slotValue)}
              disabled={isDisabled}
              className={`rounded-xl border-2 px-4 py-3 ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : isDisabled
                  ? "border-gray-200 bg-gray-100"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isSelected
                    ? "text-primary-600"
                    : isDisabled
                    ? "text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {slot.slot_label}
              </Text>
              <Text
                className={`mt-1 text-center text-xs ${
                  isDisabled ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isDisabled ? "Full" : `${slot.remaining} left`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Create BookingCard component**

Create file `mobile/src/features/booking/components/BookingCard.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { BookingWithRelations } from "@/shared/types/database";
import { Card, Badge, Avatar } from "@/shared/components";

interface BookingCardProps {
  booking: BookingWithRelations;
}

export function BookingCard({ booking }: BookingCardProps) {
  const date = new Date(booking.pickup_date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/booking/${booking.id}`} asChild>
      <Pressable>
        <Card>
          <View className="flex-row items-center gap-3">
            <Avatar
              src={booking.merchant.logo_url}
              fallback={booking.merchant.name}
            />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {booking.merchant.name}
              </Text>
              <Text className="text-sm text-gray-500">{booking.package.name}</Text>
            </View>
            <Badge status={booking.status} />
          </View>

          <View className="mt-4 flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500">{date}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500">{booking.pickup_slot}</Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-gray-500">Total</Text>
            <Text className="font-semibold text-gray-900">
              ₱{booking.total_amount}
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
```

- [ ] **Step 3: Create StatusTracker component**

Create file `mobile/src/features/booking/components/StatusTracker.tsx`:

```typescript
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BookingStatus } from "@/shared/types/database";

interface Step {
  status: BookingStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STEPS: Step[] = [
  { status: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { status: "picked_up", label: "Picked Up", icon: "car" },
  { status: "in_progress", label: "Washing", icon: "water" },
  { status: "completed", label: "Completed", icon: "checkmark-done-circle" },
];

const STATUS_ORDER: BookingStatus[] = [
  "pending",
  "confirmed",
  "picked_up",
  "in_progress",
  "completed",
];

interface StatusTrackerProps {
  status: BookingStatus;
}

export function StatusTracker({ status }: StatusTrackerProps) {
  if (status === "cancelled" || status === "pending") {
    return null;
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <View className="py-4">
      {STEPS.map((step, index) => {
        const stepIndex = STATUS_ORDER.indexOf(step.status);
        const isCompleted = currentIndex >= stepIndex;
        const isCurrent = status === step.status;

        return (
          <View key={step.status} className="flex-row">
            {/* Line and circle */}
            <View className="items-center">
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isCompleted ? "bg-primary-500" : "bg-gray-200"
                }`}
              >
                <Ionicons
                  name={step.icon}
                  size={20}
                  color={isCompleted ? "white" : "#9CA3AF"}
                />
              </View>
              {index < STEPS.length - 1 && (
                <View
                  className={`h-8 w-0.5 ${
                    currentIndex > stepIndex ? "bg-primary-500" : "bg-gray-200"
                  }`}
                />
              )}
            </View>

            {/* Label */}
            <View className="ml-4 flex-1 justify-center pb-8">
              <Text
                className={`font-medium ${
                  isCompleted ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </Text>
              {isCurrent && (
                <Text className="text-sm text-primary-500">Current status</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 4: Create StepIndicator component**

Create file `mobile/src/features/booking/components/StepIndicator.tsx`:

```typescript
import { View, Text } from "react-native";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-4">
      {steps.map((step, index) => (
        <View key={step} className="flex-1 flex-row items-center">
          <View className="items-center">
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                index <= currentStep ? "bg-primary-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-semibold ${
                  index <= currentStep ? "text-white" : "text-gray-500"
                }`}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              className={`mt-1 text-xs ${
                index <= currentStep ? "text-primary-500" : "text-gray-400"
              }`}
            >
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              className={`mx-2 h-0.5 flex-1 ${
                index < currentStep ? "bg-primary-500" : "bg-gray-200"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 5: Create components barrel export**

Create file `mobile/src/features/booking/components/index.ts`:

```typescript
export { SlotPicker } from "./SlotPicker";
export { BookingCard } from "./BookingCard";
export { StatusTracker } from "./StatusTracker";
export { StepIndicator } from "./StepIndicator";
```

- [ ] **Step 6: Commit**

```bash
git add mobile/src/features/booking/components/
git commit -m "feat(mobile): add booking UI components"
```

---

### Task 13: Booking Flow Screen

**Files:**
- Create: `mobile/app/booking/[merchantId]/new.tsx`

**Interfaces:**
- Consumes: All booking hooks and components, merchant hooks
- Produces: Multi-step booking creation flow

- [ ] **Step 1: Install date picker and Stripe**

```bash
cd mobile && npx expo install @react-native-community/datetimepicker @stripe/stripe-react-native
```

- [ ] **Step 2: Create New Booking screen**

Create file `mobile/app/booking/[merchantId]/new.tsx`:

```typescript
import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useStripe } from "@stripe/stripe-react-native";
import { useMerchant, useMerchantPackages } from "@/features/merchants/hooks";
import { useAvailableSlots, useCreateBooking } from "@/features/booking/hooks";
import { useBookingStore } from "@/features/booking/store";
import { PackageCard } from "@/features/merchants/components";
import { SlotPicker, StepIndicator } from "@/features/booking/components";
import { Button } from "@/shared/components";

const STEPS = ["Package", "Schedule", "Address", "Pay"];
const PLATFORM_FEE = 50;

export default function NewBookingScreen() {
  const { merchantId } = useLocalSearchParams<{ merchantId: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { data: merchant } = useMerchant(merchantId);
  const { data: packages } = useMerchantPackages(merchantId);
  const createBooking = useCreateBooking();

  const store = useBookingStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: slots } = useAvailableSlots(
    merchantId,
    selectedDate?.toISOString().split("T")[0] ?? null
  );

  const selectedPackage = packages?.find((p) => p.id === store.packageId);

  const totalAmount = selectedPackage
    ? selectedPackage.price + selectedPackage.pickup_fee + PLATFORM_FEE
    : 0;

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      store.setDateTime(date.toISOString().split("T")[0], "");
    }
  };

  const handleSlotSelect = (slot: string) => {
    if (selectedDate) {
      store.setDateTime(selectedDate.toISOString().split("T")[0], slot);
    }
  };

  const handleNext = () => {
    if (store.currentStep < STEPS.length - 1) {
      store.setStep(store.currentStep + 1);
    }
  };

  const handleBack = () => {
    if (store.currentStep > 0) {
      store.setStep(store.currentStep - 1);
    } else {
      router.back();
    }
  };

  const handlePay = async () => {
    if (!store.packageId || !store.pickupDate || !store.pickupSlot || !store.pickupAddress) {
      Alert.alert("Error", "Please complete all steps");
      return;
    }

    try {
      const result = await createBooking.mutateAsync({
        merchantId,
        packageId: store.packageId,
        vehicleId: store.vehicleId ?? undefined,
        pickupAddress: store.pickupAddress,
        pickupLat: store.pickupCoords?.lat ?? 0,
        pickupLng: store.pickupCoords?.lng ?? 0,
        pickupDate: store.pickupDate,
        pickupSlot: store.pickupSlot,
        driverNote: store.driverNote || undefined,
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.clientSecret,
        merchantDisplayName: merchant?.name ?? "PickupWash",
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== "Canceled") {
          Alert.alert("Payment failed", presentError.message);
        }
        return;
      }

      store.reset();
      router.replace(`/booking/${result.bookingId}`);
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Failed to create booking");
    }
  };

  const canProceed = () => {
    switch (store.currentStep) {
      case 0:
        return !!store.packageId;
      case 1:
        return !!store.pickupDate && !!store.pickupSlot;
      case 2:
        return !!store.pickupAddress;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Book Service",
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <Text className="text-primary-500">Back</Text>
            </Pressable>
          ),
        }}
      />

      <StepIndicator steps={STEPS} currentStep={store.currentStep} />

      <ScrollView className="flex-1 px-4">
        {/* Step 0: Package Selection */}
        {store.currentStep === 0 && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Select a package</Text>
            <View className="gap-3">
              {packages?.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={store.packageId === pkg.id}
                  onSelect={() => store.setPackage(pkg.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step 1: Date & Time */}
        {store.currentStep === 1 && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Choose date & time</Text>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-4"
            >
              <Text className={selectedDate ? "text-gray-900" : "text-gray-400"}>
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate ?? new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {slots && (
              <View className="mt-6">
                <Text className="mb-3 font-medium text-gray-700">
                  Available time slots
                </Text>
                <SlotPicker
                  slots={slots}
                  selectedSlot={store.pickupSlot}
                  onSelectSlot={handleSlotSelect}
                />
              </View>
            )}
          </View>
        )}

        {/* Step 2: Address */}
        {store.currentStep === 2 && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Pickup address</Text>

            <TextInput
              className="rounded-xl border border-gray-300 bg-white px-4 py-4"
              placeholder="Enter your full address"
              value={store.pickupAddress ?? ""}
              onChangeText={(text) =>
                store.setAddress(text, { lat: 14.5547, lng: 121.0244 })
              }
              multiline
              numberOfLines={3}
            />

            <View className="mt-4">
              <Text className="mb-2 font-medium text-gray-700">
                Note for driver (optional)
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4"
                placeholder="E.g., Gate code, parking instructions..."
                value={store.driverNote}
                onChangeText={store.setDriverNote}
                multiline
              />
            </View>
          </View>
        )}

        {/* Step 3: Review & Pay */}
        {store.currentStep === 3 && selectedPackage && (
          <View className="py-4">
            <Text className="mb-4 text-xl font-semibold">Review & Pay</Text>

            <View className="rounded-xl bg-gray-50 p-4">
              <Text className="font-semibold text-gray-900">{merchant?.name}</Text>
              <Text className="text-gray-500">{selectedPackage.name}</Text>

              <View className="mt-4 border-t border-gray-200 pt-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Package</Text>
                  <Text>₱{selectedPackage.price}</Text>
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-gray-500">Pickup fee</Text>
                  <Text>₱{selectedPackage.pickup_fee}</Text>
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-gray-500">Service fee</Text>
                  <Text>₱{PLATFORM_FEE}</Text>
                </View>
                <View className="mt-4 flex-row justify-between border-t border-gray-200 pt-4">
                  <Text className="font-semibold">Total</Text>
                  <Text className="text-lg font-bold text-primary-500">
                    ₱{totalAmount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="border-t border-gray-200 px-4 py-4">
        {store.currentStep < 3 ? (
          <Button onPress={handleNext} disabled={!canProceed()}>
            Continue
          </Button>
        ) : (
          <Button onPress={handlePay} loading={createBooking.isPending}>
            Pay ₱{totalAmount}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Add Stripe provider to app layout**

Update `mobile/app/_layout.tsx` to wrap with StripeProvider (add import and wrapper):

```typescript
import { StripeProvider } from "@stripe/stripe-react-native";

// Inside the return, wrap with StripeProvider:
<StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
  {/* existing content */}
</StripeProvider>
```

- [ ] **Step 4: Commit**

```bash
git add mobile/app/booking/ mobile/app/_layout.tsx
git commit -m "feat(mobile): add booking flow screen with Stripe payment"
```

---

### Task 14: Bookings List and Detail Screens

**Files:**
- Modify: `mobile/app/(tabs)/bookings.tsx`
- Create: `mobile/app/booking/[id]/index.tsx`

**Interfaces:**
- Consumes: `useMyBookings`, `useBooking`, booking components
- Produces: Bookings list and detail screens

- [ ] **Step 1: Update Bookings tab**

Replace file `mobile/app/(tabs)/bookings.tsx`:

```typescript
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyBookings } from "@/features/booking/hooks";
import { BookingCard } from "@/features/booking/components";
import { EmptyState } from "@/shared/components";

export default function BookingsScreen() {
  const { data: bookings, isLoading, error, refetch } = useMyBookings();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="Something went wrong"
          description="Failed to load bookings"
          actionLabel="Retry"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            title="No bookings yet"
            description="Book your first car wash to get started"
          />
        }
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Create Booking Detail screen**

Create file `mobile/app/booking/[id]/index.tsx`:

```typescript
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useBooking } from "@/features/booking/hooks";
import { StatusTracker } from "@/features/booking/components";
import { Button, Badge, Avatar, Card } from "@/shared/components";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useBooking(id);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("cancel-booking", {
        body: { bookingId: id, cancelledBy: "customer" },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
    },
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? You will receive a full refund.",
      [
        { text: "No, keep it", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "Booking" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: "Not Found" }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(booking.pickup_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const canCancel = booking.status === "confirmed";

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: "Booking Details" }} />

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6">
          <View className="flex-row items-center gap-4">
            <Avatar
              src={booking.merchant.logo_url}
              fallback={booking.merchant.name}
              size="lg"
            />
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {booking.merchant.name}
              </Text>
              <Text className="text-gray-500">{booking.package.name}</Text>
            </View>
            <Badge status={booking.status} />
          </View>
        </View>

        {/* Status Tracker */}
        {booking.status !== "cancelled" && booking.status !== "pending" && (
          <Card className="mx-4 mt-4">
            <Text className="mb-2 font-semibold text-gray-900">Status</Text>
            <StatusTracker status={booking.status} />
          </Card>
        )}

        {/* Details */}
        <Card className="mx-4 mt-4">
          <Text className="mb-4 font-semibold text-gray-900">Details</Text>

          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View>
                <Text className="text-gray-500">Date</Text>
                <Text className="font-medium text-gray-900">{date}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View>
                <Text className="text-gray-500">Time</Text>
                <Text className="font-medium text-gray-900">
                  {booking.pickup_slot}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View className="flex-1">
                <Text className="text-gray-500">Pickup Address</Text>
                <Text className="font-medium text-gray-900">
                  {booking.pickup_address}
                </Text>
              </View>
            </View>

            {booking.driver_note && (
              <View className="flex-row items-center gap-3">
                <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                <View className="flex-1">
                  <Text className="text-gray-500">Note</Text>
                  <Text className="font-medium text-gray-900">
                    {booking.driver_note}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Payment Summary */}
        <Card className="mx-4 mt-4 mb-6">
          <Text className="mb-4 font-semibold text-gray-900">Payment</Text>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Package</Text>
              <Text>₱{booking.package_price}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Pickup fee</Text>
              <Text>₱{booking.pickup_fee}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Service fee</Text>
              <Text>₱{booking.platform_fee}</Text>
            </View>
            <View className="mt-2 flex-row justify-between border-t border-gray-200 pt-2">
              <Text className="font-semibold">Total paid</Text>
              <Text className="font-bold text-primary-500">
                ₱{booking.total_amount}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Cancel Button */}
      {canCancel && (
        <View className="border-t border-gray-200 bg-white px-4 py-4">
          <Button
            variant="destructive"
            onPress={handleCancel}
            loading={cancelMutation.isPending}
          >
            Cancel Booking
          </Button>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add mobile/app/\(tabs\)/bookings.tsx mobile/app/booking/\[id\]/
git commit -m "feat(mobile): add bookings list and detail screens"
```

---

### Task 15: Profile Feature

**Files:**
- Create: `mobile/src/features/profile/hooks/useProfile.ts`
- Create: `mobile/src/features/profile/hooks/useVehicles.ts`
- Create: `mobile/src/features/profile/hooks/index.ts`
- Create: `mobile/src/features/profile/components/VehicleCard.tsx`
- Create: `mobile/src/features/profile/components/index.ts`
- Create: `mobile/app/profile/vehicles.tsx`
- Modify: `mobile/app/(tabs)/profile.tsx`

**Interfaces:**
- Produces: Profile management with vehicles CRUD

- [ ] **Step 1: Create useProfile hook**

Create file `mobile/src/features/profile/hooks/useProfile.ts`:

```typescript
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
```

- [ ] **Step 2: Create useVehicles hook**

Create file `mobile/src/features/profile/hooks/useVehicles.ts`:

```typescript
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
```

- [ ] **Step 3: Create hooks barrel export**

Create file `mobile/src/features/profile/hooks/index.ts`:

```typescript
export { useProfile, useUpdateProfile } from "./useProfile";
export { useVehicles, useAddVehicle, useDeleteVehicle } from "./useVehicles";
```

- [ ] **Step 4: Create VehicleCard component**

Create file `mobile/src/features/profile/components/VehicleCard.tsx`:

```typescript
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Vehicle } from "@/shared/types/database";
import { Card } from "@/shared/components";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete: () => void;
}

export function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      `Remove ${vehicle.make} ${vehicle.model}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Ionicons name="car" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="font-semibold text-gray-900">
              {vehicle.make} {vehicle.model}
            </Text>
            <Text className="text-sm text-gray-500">
              {vehicle.color}
              {vehicle.plate_number && ` • ${vehicle.plate_number}`}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {vehicle.is_default && (
            <View className="rounded-full bg-primary-100 px-2 py-1">
              <Text className="text-xs text-primary-600">Default</Text>
            </View>
          )}
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
```

- [ ] **Step 5: Create components barrel export**

Create file `mobile/src/features/profile/components/index.ts`:

```typescript
export { VehicleCard } from "./VehicleCard";
```

- [ ] **Step 6: Create Vehicles screen**

Create file `mobile/app/profile/vehicles.tsx`:

```typescript
import { useState } from "react";
import { View, Text, FlatList, TextInput, Alert } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicles, useAddVehicle, useDeleteVehicle } from "@/features/profile/hooks";
import { VehicleCard } from "@/features/profile/components";
import { Button, Card, EmptyState } from "@/shared/components";

export default function VehiclesScreen() {
  const { data: vehicles, isLoading } = useVehicles();
  const addVehicle = useAddVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [showForm, setShowForm] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const handleAdd = async () => {
    if (!make || !model || !color) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await addVehicle.mutateAsync({
        make,
        model,
        color,
        plate_number: plateNumber || null,
        is_default: vehicles?.length === 0,
      });
      setShowForm(false);
      setMake("");
      setModel("");
      setColor("");
      setPlateNumber("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Stack.Screen options={{ title: "My Vehicles" }} />

      {showForm ? (
        <View className="flex-1 px-4 py-4">
          <Card>
            <Text className="mb-4 text-lg font-semibold">Add Vehicle</Text>

            <View className="gap-4">
              <View>
                <Text className="mb-1 text-sm text-gray-600">Make *</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="Toyota"
                  value={make}
                  onChangeText={setMake}
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-gray-600">Model *</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="Vios"
                  value={model}
                  onChangeText={setModel}
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-gray-600">Color *</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="White"
                  value={color}
                  onChangeText={setColor}
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-gray-600">
                  Plate Number (optional)
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="ABC 1234"
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <View className="flex-1">
                <Button variant="secondary" onPress={() => setShowForm(false)}>
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button onPress={handleAdd} loading={addVehicle.isPending}>
                  Add
                </Button>
              </View>
            </View>
          </Card>
        </View>
      ) : (
        <>
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VehicleCard
                vehicle={item}
                onDelete={() => deleteVehicle.mutate(item.id)}
              />
            )}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            ListEmptyComponent={
              <EmptyState
                title="No vehicles yet"
                description="Add your first vehicle to get started"
              />
            }
          />

          <View className="border-t border-gray-200 bg-white px-4 py-4">
            <Button onPress={() => setShowForm(true)}>Add Vehicle</Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
```

- [ ] **Step 7: Update Profile tab**

Replace file `mobile/app/(tabs)/profile.tsx`:

```typescript
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";
import { useProfile } from "@/features/profile/hooks";
import { Avatar, Button } from "@/shared/components";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function SettingsRow({ icon, label, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-white px-4 py-4"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={22} color="#6B7280" />
        <Text className="text-gray-900">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { data: profile } = useProfile();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const email = user?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
        <View className="items-center bg-white pb-6 pt-8">
          <Avatar fallback={displayName} size="lg" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            {displayName}
          </Text>
          <Text className="text-gray-500">{email}</Text>
        </View>

        {/* Settings */}
        <View className="mt-6">
          <Text className="mb-2 px-4 text-sm font-medium uppercase text-gray-500">
            Account
          </Text>
          <SettingsRow
            icon="car-outline"
            label="My Vehicles"
            onPress={() => router.push("/profile/vehicles")}
          />
          <View className="h-px bg-gray-200" />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
        </View>

        <View className="mt-6">
          <Text className="mb-2 px-4 text-sm font-medium uppercase text-gray-500">
            Support
          </Text>
          <SettingsRow
            icon="help-circle-outline"
            label="Help & FAQ"
            onPress={() => {}}
          />
          <View className="h-px bg-gray-200" />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
          />
        </View>

        <View className="mt-8 px-4 pb-8">
          <Button variant="destructive" onPress={logout}>
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add mobile/src/features/profile/ mobile/app/profile/ mobile/app/\(tabs\)/profile.tsx
git commit -m "feat(mobile): add profile and vehicles management"
```

---

### Task 16: Push Notifications Setup

**Files:**
- Create: `mobile/src/shared/hooks/usePushNotifications.ts`
- Modify: `mobile/app/_layout.tsx`

**Interfaces:**
- Produces: Push notification registration and handling

- [ ] **Step 1: Create usePushNotifications hook**

Create file `mobile/src/shared/hooks/usePushNotifications.ts`:

```typescript
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { router } from "expo-router";
import { supabase } from "@/shared/lib/supabase";
import { useAuthStore } from "@/features/auth/store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const { user } = useAuthStore();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        // Save token to database
        supabase
          .from("customers")
          .update({ expo_push_token: token })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Failed to save push token:", error);
          });
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.bookingId) {
          router.push(`/booking/${data.bookingId}`);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token.data;
}
```

- [ ] **Step 2: Install expo-device**

```bash
cd mobile && npx expo install expo-device
```

- [ ] **Step 3: Update root layout to use push notifications**

Add to `mobile/app/_layout.tsx`:

```typescript
import { usePushNotifications } from "@/shared/hooks/usePushNotifications";

// Inside RootLayout component, add:
usePushNotifications();
```

- [ ] **Step 4: Update shared hooks index**

Update file `mobile/src/shared/hooks/index.ts`:

```typescript
export { useLocation } from "./useLocation";
export { usePushNotifications } from "./usePushNotifications";
```

- [ ] **Step 5: Commit**

```bash
git add mobile/src/shared/hooks/ mobile/app/_layout.tsx
git commit -m "feat(mobile): add push notifications setup"
```

---

## Summary

This plan implements the complete PickupWash mobile app:

| Task | Component |
|------|-----------|
| 1 | Project initialization with Expo + NativeWind |
| 2 | Shared library (Supabase, Query Client, Types) |
| 3 | Shared UI components |
| 4 | Auth store and hooks |
| 5 | Navigation structure |
| 6 | Auth screens (Login, Register, Verify Phone) |
| 7 | Merchant query hooks |
| 8 | Merchant display components |
| 9 | Location hook and Search screen |
| 10 | Merchant Detail screen |
| 11 | Booking store and hooks |
| 12 | Booking UI components |
| 13 | Booking flow with Stripe payment |
| 14 | Bookings list and detail screens |
| 15 | Profile and vehicles management |
| 16 | Push notifications |

**Next Steps after completion:**
1. Run `npx expo start` to test in simulator/device
2. Connect to live Supabase project
3. Configure Stripe publishable key
4. Build for iOS/Android with EAS Build
5. Proceed to Sub-project 3: Merchant Admin
