# ExperienceFirst Travel Platform - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a travel agency platform MVP with Trip Workspace and Itinerary Builder as the core feature.

**Architecture:** Turborepo monorepo with single React app (apps/web) and shared packages (ui, domain, supabase). Supabase handles auth, database, and storage. Feature-based folder structure with TanStack Query for data fetching.

**Tech Stack:** pnpm, Turborepo, React 18, Vite, TypeScript, React Router v6, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS, shadcn/ui, @dnd-kit/sortable, Supabase

---

## Phase 1: Monorepo Foundation

### Task 1: Initialize Monorepo with Turborepo

**Files:**
- Create: `experiencefirst/package.json`
- Create: `experiencefirst/pnpm-workspace.yaml`
- Create: `experiencefirst/turbo.json`
- Create: `experiencefirst/.gitignore`
- Create: `experiencefirst/.env.example`

**Step 1: Create project directory and initialize**

```bash
mkdir -p /Users/bertwinromero/Documents/personal/experiencefirst
cd /Users/bertwinromero/Documents/personal/experiencefirst
pnpm init
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Step 4: Update root package.json**

```json
{
  "name": "experiencefirst",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

**Step 5: Create .gitignore**

```
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
.turbo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode
.idea
*.swp

# OS
.DS_Store
Thumbs.db

# Supabase
supabase/.branches
supabase/.temp
```

**Step 6: Create .env.example**

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 7: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: initialize turborepo monorepo"
```

---

### Task 2: Create packages/domain (Types & Schemas)

**Files:**
- Create: `packages/domain/package.json`
- Create: `packages/domain/tsconfig.json`
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/src/types/index.ts`
- Create: `packages/domain/src/types/trip.ts`
- Create: `packages/domain/src/types/supplier.ts`
- Create: `packages/domain/src/types/itinerary.ts`
- Create: `packages/domain/src/schemas/index.ts`
- Create: `packages/domain/src/schemas/trip.ts`

**Step 1: Create package.json**

```json
{
  "name": "@experiencefirst/domain",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create types/trip.ts**

```typescript
export type TripStatus =
  | 'draft'
  | 'proposal_sent'
  | 'negotiation'
  | 'booked'
  | 'traveling'
  | 'completed'
  | 'canceled';

export type TripTier = 'standard' | 'deluxe' | 'luxury';

export interface Client {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
}

export interface Traveler {
  id: string;
  trip_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  passport_name: string | null;
  passport_expiry: string | null;
  dietary_restrictions: string | null;
  is_lead_guest: boolean;
}

export interface Trip {
  id: string;
  title: string;
  status: TripStatus;
  client_id: string | null;
  client?: Client;
  start_date: string | null;
  end_date: string | null;
  traveler_count: number;
  tier: TripTier;
  assigned_advisor: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  travelers?: Traveler[];
  days?: ItineraryDay[];
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  trip_id: string;
  version: number;
  status: 'draft' | 'sent' | 'accepted' | 'expired';
  services_total: number | null;
  agency_fee_percent: number;
  agency_fee_amount: number | null;
  total_price: number | null;
  currency: string;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
}
```

**Step 4: Create types/itinerary.ts**

```typescript
import type { Supplier } from './supplier';

export type ItineraryItemType =
  | 'lodging'
  | 'transfer'
  | 'experience'
  | 'flight'
  | 'meal'
  | 'note';

export type ItineraryItemStatus =
  | 'draft'
  | 'requested'
  | 'confirmed'
  | 'paid'
  | 'vouchered'
  | 'canceled';

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  description: string | null;
  sort_order: number;
  items?: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  day_id: string;
  type: ItineraryItemType;
  title: string;
  description: string | null;
  supplier_id: string | null;
  supplier?: Supplier;
  start_time: string | null;
  duration_minutes: number | null;
  cost_price: number | null;
  sell_price: number | null;
  status: ItineraryItemStatus;
  confirmation_number: string | null;
  location_name: string | null;
  location_address: string | null;
  image_url: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}
```

**Step 5: Create types/supplier.ts**

```typescript
export type SupplierType =
  | 'accommodation'
  | 'transport'
  | 'guide'
  | 'experience'
  | 'restaurant';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  rating: number | null;
  internal_notes: string | null;
  payment_terms: string | null;
  cancellation_policy: string | null;
  is_active: boolean;
  created_at: string;
}
```

**Step 6: Create types/index.ts**

```typescript
export * from './trip';
export * from './itinerary';
export * from './supplier';
```

**Step 7: Create schemas/trip.ts**

```typescript
import { z } from 'zod';

export const tripStatusSchema = z.enum([
  'draft',
  'proposal_sent',
  'negotiation',
  'booked',
  'traveling',
  'completed',
  'canceled',
]);

export const tripTierSchema = z.enum(['standard', 'deluxe', 'luxury']);

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  client_id: z.string().uuid().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  traveler_count: z.number().int().min(1).default(2),
  tier: tripTierSchema.default('standard'),
  internal_notes: z.string().optional().nullable(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  status: tripStatusSchema.optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
```

**Step 8: Create schemas/index.ts**

```typescript
export * from './trip';
```

**Step 9: Create src/index.ts**

```typescript
export * from './types';
export * from './schemas';
```

**Step 10: Commit**

```bash
git add packages/domain
git commit -m "feat(domain): add types and schemas for trips, itineraries, suppliers"
```

---

### Task 3: Create packages/ui (Shared Components)

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/tailwind.config.ts`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/styles/globals.css`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/components/button.tsx`
- Create: `packages/ui/src/components/card.tsx`
- Create: `packages/ui/src/components/badge.tsx`
- Create: `packages/ui/src/components/input.tsx`

**Step 1: Create package.json**

```json
{
  "name": "@experiencefirst/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "react": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#3b82f6',
        background: '#f8fafc',
        foreground: '#0f172a',
        // Item type colors
        lodging: '#10b981',
        transfer: '#3b82f6',
        experience: '#f97316',
        flight: '#8b5cf6',
        meal: '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 4: Create src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

**Step 5: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 6: Create src/components/button.tsx**

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Step 7: Create src/components/card.tsx**

```typescript
import * as React from 'react';
import { cn } from '../lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-bold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
```

**Step 8: Create src/components/badge.tsx**

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border border-border text-foreground',
        // Status variants
        draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        requested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        paid: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        vouchered: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        // Item type variants
        lodging: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        transfer: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        experience: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        flight: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
        meal: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

**Step 9: Create src/components/input.tsx**

```typescript
import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

**Step 10: Create src/index.ts**

```typescript
// Utils
export { cn } from './lib/utils';

// Components
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Card, CardHeader, CardTitle, CardContent } from './components/card';
export { Badge, badgeVariants, type BadgeProps } from './components/badge';
export { Input, type InputProps } from './components/input';
```

**Step 11: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add base UI components (button, card, badge, input)"
```

---

### Task 4: Create packages/supabase (Client & Hooks)

**Files:**
- Create: `packages/supabase/package.json`
- Create: `packages/supabase/tsconfig.json`
- Create: `packages/supabase/src/index.ts`
- Create: `packages/supabase/src/client.ts`
- Create: `packages/supabase/src/auth.ts`
- Create: `packages/supabase/src/types.ts`

**Step 1: Create package.json**

```json
{
  "name": "@experiencefirst/supabase",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.43.0",
    "@tanstack/react-query": "^5.40.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create src/types.ts**

```typescript
import type { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// We'll generate this from Supabase CLI, for now stub it
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin_owner' | 'advisor' | 'ops' | 'supplier';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      trips: {
        Row: {
          id: string;
          title: string;
          status: string;
          client_id: string | null;
          start_date: string | null;
          end_date: string | null;
          traveler_count: number;
          tier: string;
          assigned_advisor: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trips']['Insert']>;
      };
      // Add more as needed
    };
  };
}
```

**Step 4: Create src/client.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

**Step 5: Create src/auth.ts**

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, session, loading, signIn, signUp, signOut };
}
```

**Step 6: Create src/index.ts**

```typescript
export { supabase } from './client';
export { AuthContext, useAuth, useAuthState } from './auth';
export type { Database, Tables, InsertTables, UpdateTables } from './types';
```

**Step 7: Commit**

```bash
git add packages/supabase
git commit -m "feat(supabase): add client, auth hooks, and types"
```

---

### Task 5: Create apps/web (Vite React App)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.node.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/src/app/App.tsx`
- Create: `apps/web/src/app/providers.tsx`
- Create: `apps/web/src/app/router.tsx`

**Step 1: Create package.json**

```json
{
  "name": "@experiencefirst/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@experiencefirst/domain": "workspace:*",
    "@experiencefirst/supabase": "workspace:*",
    "@experiencefirst/ui": "workspace:*",
    "@tanstack/react-query": "^5.40.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExperienceFirst</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 6: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 7: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';
import baseConfig from '@experiencefirst/ui/tailwind.config';

const config: Config = {
  presets: [baseConfig],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
```

**Step 8: Create src/index.css**

```css
@import '@experiencefirst/ui/src/styles/globals.css';
```

**Step 9: Create src/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 10: Create src/app/providers.tsx**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, useAuthState } from '@experiencefirst/supabase';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
```

**Step 11: Create src/app/router.tsx**

```typescript
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Placeholder pages - we'll create these next
function LoginPage() {
  return <div className="p-8"><h1>Login</h1></div>;
}

function DashboardPage() {
  return <div className="p-8"><h1>Dashboard</h1></div>;
}

function TripsPage() {
  return <div className="p-8"><h1>Trips</h1></div>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'trips',
        element: <TripsPage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
```

**Step 12: Create src/app/App.tsx**

```typescript
import { Providers } from './providers';
import { Router } from './router';

export function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}
```

**Step 13: Commit**

```bash
git add apps/web
git commit -m "feat(web): scaffold vite react app with providers and routing"
```

---

### Task 6: Install Dependencies and Verify Build

**Step 1: Install all dependencies**

```bash
cd /Users/bertwinromero/Documents/personal/experiencefirst
pnpm install
```

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 3: Run dev server**

```bash
pnpm dev
```

Expected: Vite starts, app loads at http://localhost:5173

**Step 4: Commit any lock file changes**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lockfile"
```

---

## Phase 2: Supabase Setup

### Task 7: Initialize Supabase Local Development

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/00000000000000_init.sql`
- Create: `supabase/seed.sql`

**Step 1: Create supabase directory**

```bash
cd /Users/bertwinromero/Documents/personal/experiencefirst
mkdir -p supabase/migrations
```

**Step 2: Create config.toml**

```toml
[api]
enabled = true
port = 54321
schemas = ["public"]
extra_search_path = ["public"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:5173"
additional_redirect_urls = ["http://localhost:5173"]

[auth.email]
enable_signup = true
double_confirm_changes = false
enable_confirmations = false

[storage]
enabled = true
```

**Step 3: Create initial migration**

```sql
-- supabase/migrations/00000000000000_init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'advisor'
    CHECK (role IN ('admin_owner', 'advisor', 'ops', 'supplier')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('accommodation', 'transport', 'guide', 'experience', 'restaurant')),
  location TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp TEXT,
  rating DECIMAL(2,1),
  internal_notes TEXT,
  payment_terms TEXT,
  cancellation_policy TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'proposal_sent', 'negotiation',
                      'booked', 'traveling', 'completed', 'canceled')),
  client_id UUID REFERENCES clients(id),
  start_date DATE,
  end_date DATE,
  traveler_count INT DEFAULT 2,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'deluxe', 'luxury')),
  assigned_advisor UUID REFERENCES profiles(id),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Travelers table
CREATE TABLE travelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  passport_name TEXT,
  passport_expiry DATE,
  dietary_restrictions TEXT,
  is_lead_guest BOOLEAN DEFAULT false
);

-- Itinerary Days table
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE,
  title TEXT,
  description TEXT,
  sort_order INT NOT NULL,
  UNIQUE(trip_id, day_number)
);

-- Itinerary Items table
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('lodging', 'transfer', 'experience', 'flight', 'meal', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  start_time TIME,
  duration_minutes INT,
  cost_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'requested', 'confirmed', 'paid', 'vouchered', 'canceled')),
  confirmation_number TEXT,
  location_name TEXT,
  location_address TEXT,
  image_url TEXT,
  notes TEXT,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'expired')),
  services_total DECIMAL(10,2),
  agency_fee_percent DECIMAL(4,2) DEFAULT 15.00,
  agency_fee_amount DECIMAL(10,2),
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, version)
);

-- Traveler Tokens table (for magic links)
CREATE TABLE traveler_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trips_client ON trips(client_id);
CREATE INDEX idx_trips_advisor ON trips(assigned_advisor);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_itinerary_days_trip ON itinerary_days(trip_id);
CREATE INDEX idx_itinerary_items_day ON itinerary_items(day_id);
CREATE INDEX idx_itinerary_items_supplier ON itinerary_items(supplier_id);
CREATE INDEX idx_suppliers_type ON suppliers(type);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE traveler_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Suppliers: All authenticated can read, admin can modify
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "suppliers_insert" ON suppliers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'advisor')));
CREATE POLICY "suppliers_update" ON suppliers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'advisor')));

-- Trips: Advisors see assigned, admin/ops see all
CREATE POLICY "trips_select" ON trips FOR SELECT TO authenticated
  USING (
    assigned_advisor = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
  );
CREATE POLICY "trips_insert" ON trips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trips_update" ON trips FOR UPDATE TO authenticated
  USING (
    assigned_advisor = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
  );

-- Clients, Travelers, Days, Items, Quotes: Access via trip
CREATE POLICY "clients_select" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients_insert" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clients_update" ON clients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "travelers_all" ON travelers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = travelers.trip_id AND (
    trips.assigned_advisor = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
  )));

CREATE POLICY "days_all" ON itinerary_days FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = itinerary_days.trip_id AND (
    trips.assigned_advisor = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
  )));

CREATE POLICY "items_all" ON itinerary_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM itinerary_days d
    JOIN trips t ON t.id = d.trip_id
    WHERE d.id = itinerary_items.day_id AND (
      t.assigned_advisor = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
    )
  ));

CREATE POLICY "quotes_all" ON quotes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = quotes.trip_id AND (
    trips.assigned_advisor = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
  )));

-- Traveler tokens: authenticated users can manage
CREATE POLICY "tokens_all" ON traveler_tokens FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = traveler_tokens.trip_id AND (
    trips.assigned_advisor = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
  )));

-- Audit log: insert only, read by admin
CREATE POLICY "audit_insert" ON audit_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_select" ON audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin_owner'));

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'advisor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 4: Create seed.sql**

```sql
-- supabase/seed.sql

-- Insert test suppliers
INSERT INTO suppliers (name, type, location, contact_name, contact_email, whatsapp, rating, internal_notes) VALUES
('Palazzo Avino', 'accommodation', 'Ravello, Italy', 'Giuseppe Romano', 'reservations@palazzoavino.com', '+39 089 818181', 4.9, 'Luxury 5-star with incredible sea views. Peak season: Jun-Sep.'),
('Amalfi Luxury Transfers', 'transport', 'Naples, Italy', 'Marco Esposito', 'bookings@amalfitransfers.com', '+39 081 555123', 4.7, 'Mercedes fleet. Airport pickups, private tours.'),
('Kyoto Cultural Guides', 'guide', 'Kyoto, Japan', 'Hiroshi Tanaka', 'info@kyotoguides.jp', '+81 75 123 4567', 5.0, 'Expert in temple history. Speaks English, French.'),
('Azure Coast Yachting', 'transport', 'Cannes, France', 'Sophie Blanc', 'charter@azureyachts.fr', '+33 4 93 12 34 56', 4.7, 'Seasonal availability. Book 3 months ahead.'),
('Villa dei Sogni', 'accommodation', 'Amalfi Coast, Italy', 'Luca Romano', 'villa@sogni.it', '+39 089 999888', 4.9, 'Private villa with chef. 4 bedrooms. Pool.');
```

**Step 5: Commit**

```bash
git add supabase
git commit -m "feat(supabase): add database schema, RLS policies, and seed data"
```

---

## Phase 3: Trip Workspace Feature

### Task 8: Create Trip List Page

**Files:**
- Create: `apps/web/src/features/trips/hooks/useTrips.ts`
- Create: `apps/web/src/features/trips/components/TripCard.tsx`
- Create: `apps/web/src/features/trips/pages/TripsPage.tsx`
- Modify: `apps/web/src/app/router.tsx`

**Step 1: Create useTrips hook**

```typescript
// apps/web/src/features/trips/hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@experiencefirst/supabase';
import type { Trip } from '@experiencefirst/domain';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          client:clients(id, full_name, email)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as (Trip & { client: { id: string; full_name: string; email: string | null } | null })[];
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trip: { title: string; client_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('trips')
        .insert({
          title: trip.title,
          client_id: trip.client_id || null,
          assigned_advisor: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
```

**Step 2: Create TripCard component**

```typescript
// apps/web/src/features/trips/components/TripCard.tsx
import { Link } from 'react-router-dom';
import { Card, Badge } from '@experiencefirst/ui';
import type { Trip, TripStatus } from '@experiencefirst/domain';

interface TripCardProps {
  trip: Trip & { client?: { full_name: string } | null };
}

const statusLabels: Record<TripStatus, string> = {
  draft: 'Draft',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  booked: 'Booked',
  traveling: 'Traveling',
  completed: 'Completed',
  canceled: 'Canceled',
};

const statusVariants: Record<TripStatus, 'draft' | 'requested' | 'confirmed' | 'paid' | 'secondary'> = {
  draft: 'draft',
  proposal_sent: 'requested',
  negotiation: 'requested',
  booked: 'confirmed',
  traveling: 'paid',
  completed: 'secondary',
  canceled: 'secondary',
};

export function TripCard({ trip }: TripCardProps) {
  const formattedDates = trip.start_date && trip.end_date
    ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
    : 'Dates TBD';

  return (
    <Link to={`/admin/trips/${trip.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{trip.title}</h3>
            {trip.client && (
              <p className="text-sm text-muted-foreground">{trip.client.full_name}</p>
            )}
          </div>
          <Badge variant={statusVariants[trip.status as TripStatus]}>
            {statusLabels[trip.status as TripStatus]}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="material-icons-outlined text-base">calendar_today</span>
            {formattedDates}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-icons-outlined text-base">group</span>
            {trip.traveler_count} travelers
          </span>
        </div>
      </Card>
    </Link>
  );
}
```

**Step 3: Create TripsPage**

```typescript
// apps/web/src/features/trips/pages/TripsPage.tsx
import { useState } from 'react';
import { Button, Input, Card } from '@experiencefirst/ui';
import { useTrips, useCreateTrip } from '../hooks/useTrips';
import { TripCard } from '../components/TripCard';

export function TripsPage() {
  const { data: trips, isLoading, error } = useTrips();
  const createTrip = useCreateTrip();
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');

  const handleCreateTrip = async () => {
    if (!newTripTitle.trim()) return;
    await createTrip.mutateAsync({ title: newTripTitle });
    setNewTripTitle('');
    setShowNewTripForm(false);
  };

  if (isLoading) {
    return <div className="p-8">Loading trips...</div>;
  }

  if (error) {
    return <div className="p-8 text-destructive">Error loading trips</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Trips</h1>
        <Button onClick={() => setShowNewTripForm(true)}>
          <span className="material-icons-outlined text-xl">add</span>
          New Trip
        </Button>
      </div>

      {showNewTripForm && (
        <Card className="p-6 mb-8">
          <h2 className="font-bold mb-4">Create New Trip</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Trip title (e.g., 'Amalfi Coast Escape')"
              value={newTripTitle}
              onChange={(e) => setNewTripTitle(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreateTrip} disabled={createTrip.isPending}>
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowNewTripForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {trips?.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
        {trips?.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            No trips yet. Create your first trip to get started.
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Update router**

```typescript
// apps/web/src/app/router.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { TripsPage } from '@/features/trips/pages/TripsPage';

function LoginPage() {
  return <div className="p-8"><h1>Login</h1></div>;
}

function DashboardPage() {
  return <div className="p-8"><h1>Dashboard</h1></div>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <Navigate to="/admin/trips" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'trips',
        element: <TripsPage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin/trips" replace />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
```

**Step 5: Commit**

```bash
git add apps/web/src/features/trips apps/web/src/app/router.tsx
git commit -m "feat(trips): add trips list page with create functionality"
```

---

### Task 9: Create Trip Workspace Layout

**Files:**
- Create: `apps/web/src/features/trips/hooks/useTrip.ts`
- Create: `apps/web/src/features/trips/components/TripHeader.tsx`
- Create: `apps/web/src/features/trips/components/TripTabs.tsx`
- Create: `apps/web/src/features/trips/pages/TripWorkspacePage.tsx`
- Modify: `apps/web/src/app/router.tsx`

**Step 1: Create useTrip hook**

```typescript
// apps/web/src/features/trips/hooks/useTrip.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@experiencefirst/supabase';
import type { Trip, ItineraryDay, ItineraryItem, Quote } from '@experiencefirst/domain';

export interface TripWithRelations extends Trip {
  client: { id: string; full_name: string; email: string | null } | null;
  travelers: Array<{ id: string; full_name: string; is_lead_guest: boolean }>;
  days: Array<ItineraryDay & { items: ItineraryItem[] }>;
  quotes: Quote[];
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          client:clients(id, full_name, email),
          travelers(id, full_name, is_lead_guest),
          days:itinerary_days(
            *,
            items:itinerary_items(*, supplier:suppliers(id, name, type))
          ),
          quotes(*)
        `)
        .eq('id', tripId)
        .order('sort_order', { referencedTable: 'itinerary_days', ascending: true })
        .single();

      if (error) throw error;

      // Sort items within each day
      const tripData = data as TripWithRelations;
      tripData.days = tripData.days.map(day => ({
        ...day,
        items: day.items.sort((a, b) => a.sort_order - b.sort_order),
      }));

      return tripData;
    },
    enabled: !!tripId,
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, updates }: { tripId: string; updates: Partial<Trip> }) => {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
```

**Step 2: Create TripHeader component**

```typescript
// apps/web/src/features/trips/components/TripHeader.tsx
import { Button, Badge } from '@experiencefirst/ui';
import type { TripWithRelations } from '../hooks/useTrip';

interface TripHeaderProps {
  trip: TripWithRelations;
}

const tierLabels = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  luxury: 'Luxury',
};

export function TripHeader({ trip }: TripHeaderProps) {
  const leadGuest = trip.travelers.find(t => t.is_lead_guest);
  const formattedDates = trip.start_date && trip.end_date
    ? `${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Dates TBD';

  const dayCount = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-2">
              <span>Trip ID: #{trip.id.slice(0, 8).toUpperCase()}</span>
              <span>•</span>
              <Badge variant="default" className="uppercase text-xs tracking-wider">
                {trip.status.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="font-display text-4xl mb-4">{trip.title}</h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-slate-400">calendar_today</span>
                <span>{formattedDates}{dayCount ? ` (${dayCount} Days)` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-slate-400">group</span>
                <span>{trip.traveler_count} Adults • {tierLabels[trip.tier as keyof typeof tierLabels]} Tier</span>
              </div>
              {leadGuest && (
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-slate-400">person</span>
                  <span>Lead: {leadGuest.full_name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button>
              <span className="material-icons-outlined text-xl">send</span>
              Share Proposal
            </Button>
            <Button variant="outline" size="icon">
              <span className="material-icons-outlined">more_horiz</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Step 3: Create TripTabs component**

```typescript
// apps/web/src/features/trips/components/TripTabs.tsx
import { cn } from '@experiencefirst/ui';

type TabId = 'itinerary' | 'quote' | 'bookings' | 'vouchers' | 'files';

interface TripTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'itinerary', label: 'Itinerary', icon: 'map' },
  { id: 'quote', label: 'Quote', icon: 'request_quote' },
  { id: 'bookings', label: 'Bookings', icon: 'confirmation_number' },
  { id: 'vouchers', label: 'Vouchers', icon: 'description' },
  { id: 'files', label: 'Files', icon: 'folder' },
];

export function TripTabs({ activeTab, onTabChange }: TripTabsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex gap-8 -mb-[1px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'pb-4 border-b-2 font-medium flex items-center gap-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <span className="material-icons-outlined text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Create TripWorkspacePage**

```typescript
// apps/web/src/features/trips/pages/TripWorkspacePage.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../hooks/useTrip';
import { TripHeader } from '../components/TripHeader';
import { TripTabs } from '../components/TripTabs';

type TabId = 'itinerary' | 'quote' | 'bookings' | 'vouchers' | 'files';

export function TripWorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: trip, isLoading, error } = useTrip(tripId!);
  const [activeTab, setActiveTab] = useState<TabId>('itinerary');

  if (isLoading) {
    return <div className="p-8">Loading trip...</div>;
  }

  if (error || !trip) {
    return (
      <div className="p-8">
        <p className="text-destructive mb-4">Error loading trip</p>
        <Link to="/admin/trips" className="text-primary hover:underline">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/admin/trips" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-icons-outlined text-xl">flight_takeoff</span>
              </div>
              <span className="font-bold text-xl tracking-tight">ExperienceFirst</span>
            </Link>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link to="/admin/dashboard" className="text-slate-500 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/trips" className="text-slate-900 dark:text-white border-b-2 border-primary py-5">
                Trips
              </Link>
              <Link to="/admin/suppliers" className="text-slate-500 hover:text-primary transition-colors">
                Suppliers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <TripHeader trip={trip} />
      <TripTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              <p>Itinerary Builder goes here</p>
              <pre className="mt-4 p-4 bg-slate-100 rounded text-xs overflow-auto">
                {JSON.stringify(trip.days, null, 2)}
              </pre>
            </div>
            <aside className="col-span-4">
              <p>Sidebar goes here</p>
            </aside>
          </div>
        )}
        {activeTab === 'quote' && <p>Quote tab</p>}
        {activeTab === 'bookings' && <p>Bookings tab</p>}
        {activeTab === 'vouchers' && <p>Vouchers tab</p>}
        {activeTab === 'files' && <p>Files tab</p>}
      </main>
    </div>
  );
}
```

**Step 5: Update router**

```typescript
// apps/web/src/app/router.tsx - add trip workspace route
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { TripsPage } from '@/features/trips/pages/TripsPage';
import { TripWorkspacePage } from '@/features/trips/pages/TripWorkspacePage';

function LoginPage() {
  return <div className="p-8"><h1>Login</h1></div>;
}

function DashboardPage() {
  return <div className="p-8"><h1>Dashboard</h1></div>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <Navigate to="/admin/trips" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'trips',
        element: <TripsPage />,
      },
      {
        path: 'trips/:tripId',
        element: <TripWorkspacePage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin/trips" replace />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
```

**Step 6: Commit**

```bash
git add apps/web/src/features/trips apps/web/src/app/router.tsx
git commit -m "feat(trips): add trip workspace layout with header and tabs"
```

---

### Task 10: Build Itinerary Builder Component

**Files:**
- Create: `apps/web/src/features/trips/components/itinerary/ItineraryBuilder.tsx`
- Create: `apps/web/src/features/trips/components/itinerary/DaySection.tsx`
- Create: `apps/web/src/features/trips/components/itinerary/ItineraryItemCard.tsx`
- Create: `apps/web/src/features/trips/hooks/useItinerary.ts`
- Modify: `apps/web/src/features/trips/pages/TripWorkspacePage.tsx`

**Step 1: Create useItinerary hooks**

```typescript
// apps/web/src/features/trips/hooks/useItinerary.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@experiencefirst/supabase';
import type { ItineraryDay, ItineraryItem } from '@experiencefirst/domain';

export function useAddDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, dayNumber, date, title }: {
      tripId: string;
      dayNumber: number;
      date?: string;
      title?: string;
    }) => {
      const { data, error } = await supabase
        .from('itinerary_days')
        .insert({
          trip_id: tripId,
          day_number: dayNumber,
          date,
          title,
          sort_order: dayNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dayId, tripId, item }: {
      dayId: string;
      tripId: string;
      item: Omit<ItineraryItem, 'id' | 'day_id' | 'created_at'>;
    }) => {
      const { data, error } = await supabase
        .from('itinerary_items')
        .insert({
          day_id: dayId,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, tripId, updates }: {
      itemId: string;
      tripId: string;
      updates: Partial<ItineraryItem>;
    }) => {
      const { data, error } = await supabase
        .from('itinerary_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, tripId }: { itemId: string; tripId: string }) => {
      const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}
```

**Step 2: Create ItineraryItemCard component**

```typescript
// apps/web/src/features/trips/components/itinerary/ItineraryItemCard.tsx
import { Badge } from '@experiencefirst/ui';
import type { ItineraryItem, ItineraryItemType, ItineraryItemStatus } from '@experiencefirst/domain';

interface ItineraryItemCardProps {
  item: ItineraryItem & { supplier?: { name: string; type: string } | null };
  onEdit: () => void;
  onDelete: () => void;
}

const typeIcons: Record<ItineraryItemType, string> = {
  lodging: 'hotel',
  transfer: 'directions_car',
  experience: 'explore',
  flight: 'flight',
  meal: 'restaurant',
  note: 'sticky_note_2',
};

const typeColors: Record<ItineraryItemType, string> = {
  lodging: 'text-emerald-500',
  transfer: 'text-blue-500',
  experience: 'text-orange-500',
  flight: 'text-violet-500',
  meal: 'text-pink-500',
  note: 'text-slate-500',
};

export function ItineraryItemCard({ item, onEdit, onDelete }: ItineraryItemCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null;
    return time.slice(0, 5); // HH:MM
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow cursor-move group">
      <div className="flex">
        {item.image_url && (
          <div className="w-48 h-32 relative flex-shrink-0">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>
        )}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`material-icons-outlined text-sm ${typeColors[item.type]}`}>
                  {typeIcons[item.type]}
                </span>
                <span className={`text-xs font-bold uppercase ${typeColors[item.type]}`}>
                  {item.type}
                </span>
              </div>
              <h4 className="font-bold text-lg">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              )}
            </div>
            <Badge variant={item.status as ItineraryItemStatus}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {item.start_time && (
                <span className="flex items-center gap-1">
                  <span className="material-icons-outlined text-base">schedule</span>
                  {formatTime(item.start_time)}
                </span>
              )}
              {item.duration_minutes && (
                <span className="flex items-center gap-1">
                  <span className="material-icons-outlined text-base">timer</span>
                  {formatDuration(item.duration_minutes)}
                </span>
              )}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-icons-outlined text-xl">edit</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-icons-outlined text-xl">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create DaySection component**

```typescript
// apps/web/src/features/trips/components/itinerary/DaySection.tsx
import type { ItineraryDay, ItineraryItem } from '@experiencefirst/domain';
import { ItineraryItemCard } from './ItineraryItemCard';

interface DaySectionProps {
  day: ItineraryDay & { items: ItineraryItem[] };
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (dayId: string) => void;
}

export function DaySection({ day, onEditItem, onDeleteItem, onAddItem }: DaySectionProps) {
  const formattedDate = day.date
    ? new Date(day.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <section className="relative pl-12">
      {/* Day number circle */}
      <div className="absolute left-0 top-0 w-10 h-10 bg-white dark:bg-slate-900 border-2 border-primary rounded-full flex items-center justify-center z-10">
        <span className="text-sm font-bold text-primary">
          {String(day.day_number).padStart(2, '0')}
        </span>
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">{day.title || `Day ${day.day_number}`}</h3>
          {formattedDate && (
            <p className="text-slate-500 dark:text-slate-400">{formattedDate}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {day.items.length} EVENTS
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {day.items.map((item) => (
          <ItineraryItemCard
            key={item.id}
            item={item}
            onEdit={() => onEditItem(item)}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}

        {/* Add block button */}
        <button
          onClick={() => onAddItem(day.id)}
          className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-6 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all group"
        >
          <span className="material-icons-outlined">add_circle_outline</span>
          <span className="font-medium">Add Block to Day {day.day_number}</span>
        </button>
      </div>
    </section>
  );
}
```

**Step 4: Create ItineraryBuilder component**

```typescript
// apps/web/src/features/trips/components/itinerary/ItineraryBuilder.tsx
import { Button } from '@experiencefirst/ui';
import type { ItineraryDay, ItineraryItem } from '@experiencefirst/domain';
import { DaySection } from './DaySection';
import { useAddDay } from '../../hooks/useItinerary';

interface ItineraryBuilderProps {
  tripId: string;
  days: Array<ItineraryDay & { items: ItineraryItem[] }>;
  startDate: string | null;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (dayId: string) => void;
}

export function ItineraryBuilder({
  tripId,
  days,
  startDate,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: ItineraryBuilderProps) {
  const addDay = useAddDay();

  const handleAddDay = async () => {
    const nextDayNumber = days.length + 1;
    let date: string | undefined;

    if (startDate) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + days.length);
      date = start.toISOString().split('T')[0];
    }

    await addDay.mutateAsync({
      tripId,
      dayNumber: nextDayNumber,
      date,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">Itinerary Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <span className="material-icons-outlined">filter_list</span>
          </Button>
          <Button variant="outline" onClick={handleAddDay} disabled={addDay.isPending}>
            <span className="material-icons-outlined text-xl">add</span>
            Add Day
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-12 relative">
        {/* Timeline line */}
        <div
          className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"
          style={{ height: days.length > 0 ? 'calc(100% - 60px)' : '0' }}
        />

        {days.map((day) => (
          <DaySection
            key={day.id}
            day={day}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onAddItem={onAddItem}
          />
        ))}

        {days.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="mb-4">No days in this itinerary yet.</p>
            <Button onClick={handleAddDay}>
              <span className="material-icons-outlined text-xl">add</span>
              Add First Day
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 5: Update TripWorkspacePage to use ItineraryBuilder**

```typescript
// apps/web/src/features/trips/pages/TripWorkspacePage.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../hooks/useTrip';
import { useDeleteItem } from '../hooks/useItinerary';
import { TripHeader } from '../components/TripHeader';
import { TripTabs } from '../components/TripTabs';
import { ItineraryBuilder } from '../components/itinerary/ItineraryBuilder';
import type { ItineraryItem } from '@experiencefirst/domain';

type TabId = 'itinerary' | 'quote' | 'bookings' | 'vouchers' | 'files';

export function TripWorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: trip, isLoading, error } = useTrip(tripId!);
  const deleteItem = useDeleteItem();
  const [activeTab, setActiveTab] = useState<TabId>('itinerary');

  const handleEditItem = (item: ItineraryItem) => {
    console.log('Edit item:', item);
    // TODO: Open edit modal
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem.mutateAsync({ itemId, tripId: tripId! });
    }
  };

  const handleAddItem = (dayId: string) => {
    console.log('Add item to day:', dayId);
    // TODO: Open add item modal
  };

  if (isLoading) {
    return <div className="p-8">Loading trip...</div>;
  }

  if (error || !trip) {
    return (
      <div className="p-8">
        <p className="text-destructive mb-4">Error loading trip</p>
        <Link to="/admin/trips" className="text-primary hover:underline">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/admin/trips" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-icons-outlined text-xl">flight_takeoff</span>
              </div>
              <span className="font-bold text-xl tracking-tight">ExperienceFirst</span>
            </Link>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link to="/admin/dashboard" className="text-slate-500 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/trips" className="text-slate-900 dark:text-white border-b-2 border-primary py-5">
                Trips
              </Link>
              <Link to="/admin/suppliers" className="text-slate-500 hover:text-primary transition-colors">
                Suppliers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <TripHeader trip={trip} />
      <TripTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              <ItineraryBuilder
                tripId={trip.id}
                days={trip.days}
                startDate={trip.start_date}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
              />
            </div>
            <aside className="col-span-4">
              {/* Sidebar - to be built */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <p className="text-sm text-slate-500">Coming soon...</p>
              </div>
            </aside>
          </div>
        )}
        {activeTab === 'quote' && <p>Quote tab</p>}
        {activeTab === 'bookings' && <p>Bookings tab</p>}
        {activeTab === 'vouchers' && <p>Vouchers tab</p>}
        {activeTab === 'files' && <p>Files tab</p>}
      </main>
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add apps/web/src/features/trips
git commit -m "feat(itinerary): add itinerary builder with day sections and item cards"
```

---

## Remaining Tasks (Summary)

The following tasks should be created similarly:

### Task 11: Add Item Modal
- Create `AddItemModal.tsx` with form for all item types
- Use React Hook Form + Zod validation
- Integrate with `useAddItem` hook

### Task 12: Edit Item Slide-Over
- Create `EditItemPanel.tsx` slide-over panel
- Pre-populate form with item data
- Handle status changes

### Task 13: Sidebar Components
- Create `QuickActionsCard.tsx`
- Create `QuoteSummaryCard.tsx`
- Create `AddComponentsCard.tsx`

### Task 14: Supplier Directory
- Create `SuppliersPage.tsx`
- Create `SupplierCard.tsx`
- Create `AddSupplierModal.tsx`
- Create `useSuppliers` hooks

### Task 15: Authentication Flow
- Create `LoginPage.tsx`
- Create `RegisterPage.tsx`
- Create `ProtectedRoute.tsx`
- Integrate with Supabase Auth

### Task 16: Traveler Portal (Magic Links)
- Create `/t/:token` route
- Create `TravelerProposalPage.tsx`
- Implement token validation

---

## Verification Plan

### Local Development Setup
```bash
cd /Users/bertwinromero/Documents/personal/experiencefirst

# Start Supabase
supabase start

# Apply migrations
supabase db reset

# Start dev server
pnpm dev
```

### Manual Testing Checklist
- [ ] Can sign up / log in
- [ ] Trips list page loads
- [ ] Can create new trip
- [ ] Trip workspace loads with header and tabs
- [ ] Can add days to itinerary
- [ ] Can add items (lodging, transfer, experience) to days
- [ ] Can edit item details
- [ ] Can delete items
- [ ] Can change item status
- [ ] Supplier directory loads
- [ ] Can add suppliers
- [ ] Quote summary calculates correctly
