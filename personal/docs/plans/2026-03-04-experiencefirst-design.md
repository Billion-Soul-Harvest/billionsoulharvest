# ExperienceFirst Travel Platform - Design Document

**Date**: 2026-03-04
**Status**: Approved
**MVP Focus**: Trip Workspace + Itinerary Builder

---

## 1. Overview

A travel agency management platform with three portals (Admin, Traveler, Supplier) built as a single React application with role-based routing.

### Key Decisions
- **Greenfield project** in a new monorepo
- **Turborepo + pnpm** for monorepo management
- **Trip Workspace + Itinerary Builder** as MVP priority
- **Email/Password + Magic Links** for authentication
- **Supabase** for backend (Postgres + Auth + Storage)

---

## 2. Architecture

### Monorepo Structure

```
experiencefirst/
├── apps/
│   └── web/                          # Vite React SPA
│       ├── src/
│       │   ├── app/                  # App shell, providers, router
│       │   ├── features/             # Feature modules
│       │   │   ├── auth/             # Login, register, magic links
│       │   │   ├── trips/            # Trip workspace, itinerary builder
│       │   │   ├── leads/            # Leads pipeline (Phase 2)
│       │   │   ├── suppliers/        # Supplier directory
│       │   │   ├── operations/       # Booking ops, vouchers
│       │   │   └── traveler/         # Traveler portal pages
│       │   ├── hooks/                # App-specific hooks
│       │   └── pages/                # Route pages (thin wrappers)
│       ├── index.html
│       └── vite.config.ts
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   ├── components/               # button, card, input, etc (shadcn-based)
│   │   ├── styles/                   # Tailwind config, global CSS
│   │   └── package.json
│   │
│   ├── domain/                       # Business logic & types
│   │   ├── types/                    # Trip, Quote, Supplier, etc
│   │   ├── schemas/                  # Zod validation schemas
│   │   ├── utils/                    # formatCurrency, dateUtils, etc
│   │   └── package.json
│   │
│   └── supabase/                     # Database client & helpers
│       ├── client.ts                 # Supabase client init
│       ├── auth.ts                   # Auth helpers, session management
│       ├── hooks/                    # useTrips, useSuppliers, etc
│       └── package.json
│
├── supabase/                         # Supabase local dev
│   ├── migrations/                   # SQL migrations
│   ├── seed.sql                      # Dev seed data
│   └── config.toml
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace
├── pnpm-workspace.yaml               # pnpm workspaces
└── .env.example
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Build | pnpm + Turborepo |
| Frontend | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| State/Data | TanStack Query + Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS + shadcn/ui |
| Drag/Drop | @dnd-kit/sortable |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |

### Routing Strategy

```typescript
/login                          # Staff login
/admin/*                        # Admin portal (protected)
  /admin/dashboard
  /admin/trips
  /admin/trips/:tripId          # Trip workspace
  /admin/leads
  /admin/suppliers

/t/:token                       # Traveler portal (magic link auth)
  /t/:token/proposal
  /t/:token/vouchers

/supplier/*                     # Supplier portal (Phase 2)
```

---

## 3. Database Schema

### Core Tables

```sql
-- Users & Roles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'advisor'
    CHECK (role IN ('admin_owner', 'advisor', 'ops', 'supplier')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients (the travelers you're selling trips to)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  notes TEXT,
  tags TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trips (core entity)
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
  tier TEXT DEFAULT 'standard',
  assigned_advisor UUID REFERENCES profiles(id),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Travelers (people going on the trip)
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

-- Itinerary Days
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE,
  title TEXT,
  description TEXT,
  sort_order INT NOT NULL
);

-- Itinerary Items (blocks within a day)
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

-- Suppliers
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

-- Quotes (versioned pricing)
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Traveler Access Tokens (magic links)
CREATE TABLE traveler_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log
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
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE traveler_tokens ENABLE ROW LEVEL SECURITY;

-- Trips: Advisors see their own + assigned, admins see all
CREATE POLICY "trips_select" ON trips FOR SELECT USING (
  auth.uid() = assigned_advisor OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
);

CREATE POLICY "trips_insert" ON trips FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "trips_update" ON trips FOR UPDATE USING (
  auth.uid() = assigned_advisor OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_owner', 'ops'))
);

-- Suppliers: All authenticated users can read, admin can write
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "suppliers_modify" ON suppliers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin_owner')
);
```

---

## 4. Component Architecture

### Trip Workspace Layout

```
TripWorkspacePage
├── TripHeader
│   ├── TripTitle + Status Badge
│   ├── TripMeta (dates, travelers, tier, lead)
│   └── Actions (Share Proposal, Edit, More)
│
├── TripTabs
│   ├── [Itinerary] ← MVP focus
│   ├── [Quote]
│   ├── [Bookings]
│   ├── [Vouchers]
│   └── [Files]
│
└── TripContent (grid: 8 + 4 columns)
    ├── MainContent
    │   └── ItineraryBuilder
    │       ├── DaySection[]
    │       │   ├── DayHeader
    │       │   └── ItineraryItemCard[] (draggable)
    │       └── AddDayButton
    │
    └── Sidebar
        ├── QuickActionsCard
        ├── QuoteSummaryCard
        └── AddComponentsCard
```

### ItineraryItemCard (from mockups)

```typescript
interface ItineraryItemCardProps {
  item: {
    id: string;
    type: 'lodging' | 'transfer' | 'experience' | 'flight' | 'meal' | 'note';
    title: string;
    description?: string;
    status: 'draft' | 'requested' | 'confirmed' | 'paid' | 'vouchered';
    start_time?: string;
    duration_minutes?: number;
    image_url?: string;
    supplier?: { name: string };
  };
  onEdit: () => void;
  onDelete: () => void;
}
```

### Data Fetching (TanStack Query)

```typescript
// packages/supabase/hooks/useTrip.ts
export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          client:clients(*),
          travelers(*),
          days:itinerary_days(
            *,
            items:itinerary_items(*, supplier:suppliers(*))
          ),
          quotes(*)
        `)
        .eq('id', tripId)
        .order('sort_order', { referencedTable: 'itinerary_days' })
        .single();

      if (error) throw error;
      return data;
    }
  });
}

// Mutation with optimistic updates
export function useUpdateItineraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<ItineraryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('itinerary_items')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    }
  });
}
```

---

## 5. UI Design Tokens

Based on the mockups provided:

```typescript
// packages/ui/styles/tokens.ts
export const colors = {
  primary: '#3b82f6',        // Blue 500 (main brand)

  // Item type colors
  lodging: '#10b981',        // Emerald 500
  transfer: '#3b82f6',       // Blue 500
  experience: '#f97316',     // Orange 500
  flight: '#8b5cf6',         // Violet 500
  meal: '#ec4899',           // Pink 500

  // Status colors
  draft: '#fbbf24',          // Amber 400
  requested: '#f97316',      // Orange 500
  confirmed: '#10b981',      // Emerald 500
  paid: '#06b6d4',           // Cyan 500
  vouchered: '#8b5cf6',      // Violet 500
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    display: ['Playfair Display', 'serif'], // For traveler portal
  }
};
```

---

## 6. MVP Implementation Phases

### Phase 1: Foundation (Week 1)
1. Monorepo setup (Turborepo + pnpm)
2. Supabase project setup + migrations
3. Auth flow (login, register, session)
4. App shell with routing
5. Basic UI components (Button, Card, Input, Badge)

### Phase 2: Trip Workspace (Week 2-3)
1. Trips list page
2. Trip workspace layout
3. Itinerary builder (view mode)
4. Itinerary builder (edit mode with drag/drop)
5. Add/edit itinerary item modals
6. Quote summary sidebar

### Phase 3: Supplier Directory (Week 3)
1. Suppliers list page
2. Add/edit supplier modal
3. Link suppliers to itinerary items

### Phase 4: Traveler Portal (Week 4)
1. Magic link generation
2. Proposal view page (`/t/:token`)
3. Accept proposal flow
4. Download vouchers

---

## 7. Verification Plan

### Local Development
```bash
# Start Supabase locally
supabase start

# Start dev server
pnpm dev

# Open http://localhost:5173
```

### Testing Checklist
- [ ] Can create a new trip
- [ ] Can add days to itinerary
- [ ] Can add items (lodging, transfer, experience) to days
- [ ] Can drag/drop to reorder items
- [ ] Can edit item details
- [ ] Can change item status
- [ ] Quote summary updates automatically
- [ ] Can share proposal link
- [ ] Traveler can view proposal via magic link

---

## 8. Reference Files

Design mockups provided:
- Trip Workspace: `stitch (1)/code.html`
- Supplier Directory: `stitch (4)/code.html`
- Ops/Vouchers: `screen 2.png`
- Traveler Proposal: `screen.png`
