# Phase 3: Sales Tracker Data Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing fields from the Sales Tracker Excel analysis - occupation on leads, fund value/riders on policies, and insurance-specific pipeline stages.

**Architecture:** Add new columns to existing tables via migration, update TypeScript types to match, and extend existing form components with new fields. No new tables or major structural changes.

**Tech Stack:** Supabase (PostgreSQL), TypeScript, React Hook Form, Zod, shadcn/ui

---

## File Structure

| File | Responsibility |
|------|----------------|
| `supabase/migrations/010_add_client_fields.sql` | Add occupation to leads, fund_value/fund_value_date/riders to policies |
| `src/types/database.ts` | TypeScript type definitions for all database tables |
| `src/features/leads/components/LeadForm.tsx` | Lead creation/editing form with occupation field |
| `src/features/policies/components/PolicyForm.tsx` | Policy creation/editing form with fund value and riders |
| `src/features/policies/components/RidersEditor.tsx` | New component for editing policy riders |

---

### Task 1: Create Database Migration

**Files:**
- Create: `supabase/migrations/010_add_client_fields.sql`

- [ ] **Step 1: Create the migration file**

Create the file with schema changes for leads and policies tables:

```sql
-- Phase 3: Sales Tracker Data Gap - Add missing fields
-- Adds occupation to leads, fund_value/fund_value_date/riders to policies

-- Add occupation field to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Add fund value tracking to policies table
ALTER TABLE policies ADD COLUMN IF NOT EXISTS fund_value NUMERIC(15,2) DEFAULT 0;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS fund_value_date DATE;

-- Add riders JSONB field to policies table
-- Structure: { "ccb": { "enabled": true, "amount": 280000 }, "tpd": { "enabled": true, "amount": 200000 }, ... }
ALTER TABLE policies ADD COLUMN IF NOT EXISTS riders JSONB DEFAULT '{}';

-- Create index for fund_value queries
CREATE INDEX IF NOT EXISTS idx_policies_fund_value ON policies(fund_value) WHERE fund_value > 0;

-- Update existing policies with sample rider data
UPDATE policies
SET riders = '{"ccb": {"enabled": true, "amount": 100000}, "tpd": {"enabled": true, "amount": 50000}}'
WHERE policy_type = 'life_insurance' AND riders = '{}';

-- Update some leads with sample occupations
UPDATE leads SET occupation = 'Engineer' WHERE first_name = 'Margaret';
UPDATE leads SET occupation = 'Government Employee' WHERE first_name = 'James';
UPDATE leads SET occupation = 'Healthcare Professional' WHERE first_name = 'Linda';
UPDATE leads SET occupation = 'Business Owner' WHERE first_name = 'Robert';
```

- [ ] **Step 2: Verify migration file exists**

Run: `ls -la supabase/migrations/010_add_client_fields.sql`
Expected: File exists with correct permissions

- [ ] **Step 3: Commit the migration**

```bash
git add supabase/migrations/010_add_client_fields.sql
git commit -m "feat(db): add occupation to leads, fund_value and riders to policies

Phase 3 data gap implementation - adds missing fields from Sales Tracker analysis"
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `src/types/database.ts:99-163` (leads table types)
- Modify: `src/types/database.ts:315-379` (policies table types)

- [ ] **Step 1: Add Rider type definition**

Add after line 516 (after the Beneficiary interface):

```typescript
export interface PolicyRider {
  enabled: boolean
  amount?: number
  daily_rate?: number
}

export interface PolicyRiders {
  ccb?: PolicyRider  // Critical Care / Living Care Benefit
  lcb?: PolicyRider  // Living Care Benefit (alternative name)
  tpd?: PolicyRider  // Total Permanent Disability
  core_add?: PolicyRider  // Accidental Death & Dismemberment
  wptpd?: PolicyRider  // Waiver of Premium on TPD
  dhi?: PolicyRider  // Daily Hospital Income
  ser?: PolicyRider  // Surgical Expense Reimbursement
  icu?: PolicyRider  // Intensive Care Unit
  pa_add?: PolicyRider  // Personal Accident ADD
  pa_atpd?: PolicyRider  // Personal Accident - Accidental TPD
  ma?: PolicyRider  // Murder and Assault
  amr?: PolicyRider  // Accident Medical Reimbursement
  fs?: PolicyRider  // Future Safe
  bb?: PolicyRider  // Burial Benefit
}
```

- [ ] **Step 2: Add occupation to leads Row type**

In the leads Row type (around line 100-119), add `occupation` after `notes`:

```typescript
      leads: {
        Row: {
          id: string
          organization_id: string
          assigned_to: string | null
          stage_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          source: string | null
          financial_goals: string | null
          notes: string | null
          occupation: string | null
          lead_score: number
          score_factors: Json
          last_scored_at: string | null
          created_at: string
          updated_at: string
          estimated_value: number
          last_contact_at: string | null
        }
```

- [ ] **Step 3: Add occupation to leads Insert type**

In the leads Insert type (around line 121-141), add `occupation` after `notes`:

```typescript
        Insert: {
          id?: string
          organization_id: string
          assigned_to?: string | null
          stage_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          source?: string | null
          financial_goals?: string | null
          notes?: string | null
          occupation?: string | null
          lead_score?: number
          score_factors?: Json
          last_scored_at?: string | null
          created_at?: string
          updated_at?: string
          estimated_value?: number
          last_contact_at?: string | null
        }
```

- [ ] **Step 4: Add occupation to leads Update type**

In the leads Update type (around line 142-162), add `occupation` after `notes`:

```typescript
        Update: {
          id?: string
          organization_id?: string
          assigned_to?: string | null
          stage_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          source?: string | null
          financial_goals?: string | null
          notes?: string | null
          occupation?: string | null
          lead_score?: number
          score_factors?: Json
          last_scored_at?: string | null
          created_at?: string
          updated_at?: string
          estimated_value?: number
          last_contact_at?: string | null
        }
```

- [ ] **Step 5: Add fund_value, fund_value_date, riders to policies Row type**

In the policies Row type (around line 315-336), add new fields after `notes`:

```typescript
      policies: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          created_by: string
          policy_type: 'life_insurance' | 'annuity' | 'ltc' | 'health' | 'disability' | 'other'
          policy_name: string
          policy_number: string | null
          carrier: string
          status: 'active' | 'pending' | 'grace_period' | 'lapsed' | 'cancelled' | 'matured'
          effective_date: string
          expiration_date: string | null
          renewal_date: string | null
          premium_amount: number
          premium_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'single_premium'
          coverage_amount: number | null
          beneficiaries: Json
          notes: string | null
          fund_value: number
          fund_value_date: string | null
          riders: Json
          created_at: string
          updated_at: string
        }
```

- [ ] **Step 6: Add fund_value, fund_value_date, riders to policies Insert type**

In the policies Insert type (around line 337-357), add new fields after `notes`:

```typescript
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          created_by: string
          policy_type: 'life_insurance' | 'annuity' | 'ltc' | 'health' | 'disability' | 'other'
          policy_name: string
          policy_number?: string | null
          carrier: string
          status?: 'active' | 'pending' | 'grace_period' | 'lapsed' | 'cancelled' | 'matured'
          effective_date: string
          expiration_date?: string | null
          renewal_date?: string | null
          premium_amount: number
          premium_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'single_premium'
          coverage_amount?: number | null
          beneficiaries?: Json
          notes?: string | null
          fund_value?: number
          fund_value_date?: string | null
          riders?: Json
          created_at?: string
          updated_at?: string
        }
```

- [ ] **Step 7: Add fund_value, fund_value_date, riders to policies Update type**

In the policies Update type (around line 358-378), add new fields after `notes`:

```typescript
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          created_by?: string
          policy_type?: 'life_insurance' | 'annuity' | 'ltc' | 'health' | 'disability' | 'other'
          policy_name?: string
          policy_number?: string | null
          carrier?: string
          status?: 'active' | 'pending' | 'grace_period' | 'lapsed' | 'cancelled' | 'matured'
          effective_date?: string
          expiration_date?: string | null
          renewal_date?: string | null
          premium_amount?: number
          premium_frequency?: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'single_premium'
          coverage_amount?: number | null
          beneficiaries?: Json
          notes?: string | null
          fund_value?: number
          fund_value_date?: string | null
          riders?: Json
          created_at?: string
          updated_at?: string
        }
```

- [ ] **Step 8: Verify TypeScript compiles**

Run: `cd financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 9: Commit TypeScript changes**

```bash
git add src/types/database.ts
git commit -m "feat(types): add occupation to Lead, fund_value and riders to Policy types"
```

---

### Task 3: Update LeadForm with Occupation Field

**Files:**
- Modify: `src/features/leads/components/LeadForm.tsx`

- [ ] **Step 1: Add occupation to Zod schema**

Update the leadSchema (around line 21-33) to include occupation:

```typescript
const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  source: z.string().optional(),
  occupation: z.string().optional(),
  estimated_value: z.number().min(0).optional(),
  financial_goals: z.string().optional(),
  notes: z.string().optional(),
  stage_id: z.string().min(1, 'Stage is required'),
  assigned_to: z.string().optional(),
})
```

- [ ] **Step 2: Add occupation to defaultValues**

Update the useForm defaultValues (around line 69-87) to include occupation:

```typescript
    defaultValues: lead
      ? {
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email || '',
          phone: lead.phone || '',
          date_of_birth: lead.date_of_birth || '',
          source: lead.source || '',
          occupation: lead.occupation || '',
          estimated_value: lead.estimated_value || 0,
          financial_goals: lead.financial_goals || '',
          notes: lead.notes || '',
          stage_id: lead.stage_id,
          assigned_to: lead.assigned_to || undefined,
        }
      : {
          stage_id: defaultStage?.id,
          estimated_value: 0,
          occupation: '',
        },
```

- [ ] **Step 3: Add occupation to leadData in onSubmit**

Update the onSubmit function (around line 89-108) to include occupation:

```typescript
  const onSubmit = async (data: LeadFormData) => {
    const leadData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      source: data.source || null,
      occupation: data.occupation || null,
      estimated_value: data.estimated_value || 0,
      financial_goals: data.financial_goals || null,
      notes: data.notes || null,
      assigned_to: data.assigned_to || null,
    }

    if (lead) {
      await updateLead({ id: lead.id, ...leadData })
    } else {
      await createLead(leadData)
    }
    onSuccess()
  }
```

- [ ] **Step 4: Add occupation input field in the form**

Add after the source field (after line 179, before the estimated_value field):

```tsx
      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          placeholder="e.g., Engineer, Business Owner, Healthcare Professional"
          {...register('occupation')}
          list="occupation-suggestions"
        />
        <datalist id="occupation-suggestions">
          <option value="Engineer" />
          <option value="Government Employee" />
          <option value="Healthcare Professional" />
          <option value="Business Owner" />
          <option value="Teacher" />
          <option value="Lawyer" />
          <option value="Accountant" />
          <option value="Self-Employed" />
          <option value="Retired" />
        </datalist>
      </div>
```

- [ ] **Step 5: Verify the form renders correctly**

Run: `cd financial-advisor-crm && npm run dev`
Expected: App starts, navigate to Leads, open Add Lead form, occupation field is visible with autocomplete suggestions

- [ ] **Step 6: Commit LeadForm changes**

```bash
git add src/features/leads/components/LeadForm.tsx
git commit -m "feat(leads): add occupation field to LeadForm with autocomplete suggestions"
```

---

### Task 4: Create RidersEditor Component

**Files:**
- Create: `src/features/policies/components/RidersEditor.tsx`

- [ ] **Step 1: Create the RidersEditor component**

```tsx
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import type { PolicyRiders, PolicyRider } from '@/types/database'

interface RidersEditorProps {
  value: PolicyRiders
  onChange: (riders: PolicyRiders) => void
}

const RIDER_DEFINITIONS = [
  { key: 'ccb', label: 'CCB/LCB - Critical Care / Living Care Benefit', hasAmount: true },
  { key: 'tpd', label: 'TPD - Total Permanent Disability', hasAmount: true },
  { key: 'core_add', label: 'Core ADD - Accidental Death & Dismemberment', hasAmount: true },
  { key: 'wptpd', label: 'WPTPD - Waiver of Premium on TPD', hasAmount: false },
  { key: 'dhi', label: 'DHI - Daily Hospital Income', hasAmount: true, amountLabel: 'Daily Rate' },
  { key: 'ser', label: 'SER - Surgical Expense Reimbursement', hasAmount: true },
  { key: 'icu', label: 'ICU - Intensive Care Unit', hasAmount: true, amountLabel: 'Daily Rate' },
  { key: 'pa_add', label: 'PA ADD - Personal Accident ADD', hasAmount: true },
  { key: 'pa_atpd', label: 'PA ATPD - Personal Accident - Accidental TPD', hasAmount: true },
  { key: 'ma', label: 'M&A - Murder and Assault', hasAmount: true },
  { key: 'amr', label: 'AMR - Accident Medical Reimbursement', hasAmount: true },
  { key: 'fs', label: 'FS - Future Safe', hasAmount: true },
  { key: 'bb', label: 'BB - Burial Benefit', hasAmount: true },
] as const

export function RidersEditor({ value, onChange }: RidersEditorProps) {
  const handleToggle = (key: string, enabled: boolean) => {
    const currentRider = value[key as keyof PolicyRiders] || { enabled: false }
    onChange({
      ...value,
      [key]: { ...currentRider, enabled },
    })
  }

  const handleAmountChange = (key: string, amount: number) => {
    const currentRider = value[key as keyof PolicyRiders] || { enabled: true }
    const amountKey = RIDER_DEFINITIONS.find(r => r.key === key)?.amountLabel === 'Daily Rate' ? 'daily_rate' : 'amount'
    onChange({
      ...value,
      [key]: { ...currentRider, [amountKey]: amount },
    })
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Policy Riders</Label>
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1">
        {RIDER_DEFINITIONS.map((rider) => {
          const riderValue = value[rider.key as keyof PolicyRiders] as PolicyRider | undefined
          const isEnabled = riderValue?.enabled || false
          const amountValue = rider.amountLabel === 'Daily Rate' ? riderValue?.daily_rate : riderValue?.amount

          return (
            <div
              key={rider.key}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
            >
              <Checkbox
                id={`rider-${rider.key}`}
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(rider.key, checked === true)}
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`rider-${rider.key}`}
                  className="text-xs font-medium cursor-pointer block truncate"
                >
                  {rider.label}
                </label>
              </div>
              {rider.hasAmount && isEnabled && (
                <Input
                  type="number"
                  placeholder={rider.amountLabel || 'Amount'}
                  value={amountValue || ''}
                  onChange={(e) => handleAmountChange(rider.key, parseFloat(e.target.value) || 0)}
                  className="w-28 h-8 text-xs"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the component compiles**

Run: `cd financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit RidersEditor component**

```bash
git add src/features/policies/components/RidersEditor.tsx
git commit -m "feat(policies): add RidersEditor component for policy riders management"
```

---

### Task 5: Update PolicyForm with Fund Value and Riders

**Files:**
- Modify: `src/features/policies/components/PolicyForm.tsx`

- [ ] **Step 1: Import RidersEditor and update imports**

Update the imports at the top of the file:

```typescript
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useLeads } from '@/features/leads/hooks/useLeads'
import { usePolicies } from '../hooks/usePolicies'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { RidersEditor } from './RidersEditor'
import type { Policy, PolicyRiders } from '@/types/database'
```

- [ ] **Step 2: Update the Zod schema**

Update the policySchema to include new fields:

```typescript
const policySchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  policy_type: z.enum(['life_insurance', 'annuity', 'ltc', 'health', 'disability', 'other']),
  policy_name: z.string().min(1, 'Policy name is required'),
  policy_number: z.string().optional(),
  carrier: z.string().min(1, 'Carrier is required'),
  status: z.enum(['active', 'pending', 'grace_period', 'lapsed', 'cancelled', 'matured']),
  effective_date: z.string().min(1, 'Effective date is required'),
  renewal_date: z.string().optional(),
  premium_amount: z.number().min(0, 'Premium must be positive'),
  premium_frequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'single_premium']),
  coverage_amount: z.number().optional(),
  fund_value: z.number().min(0).optional(),
  fund_value_date: z.string().optional(),
  riders: z.record(z.any()).optional(),
  beneficiary_name: z.string().optional(),
  beneficiary_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})
```

- [ ] **Step 3: Update useForm with Controller**

Update the useForm call to add control and update defaultValues:

```typescript
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: policy
      ? {
          client_id: policy.client_id,
          policy_type: policy.policy_type,
          policy_name: policy.policy_name,
          policy_number: policy.policy_number || '',
          carrier: policy.carrier,
          status: policy.status,
          effective_date: policy.effective_date,
          renewal_date: policy.renewal_date || '',
          premium_amount: policy.premium_amount,
          premium_frequency: policy.premium_frequency,
          coverage_amount: policy.coverage_amount || undefined,
          fund_value: policy.fund_value || 0,
          fund_value_date: policy.fund_value_date || '',
          riders: (policy.riders as PolicyRiders) || {},
          notes: policy.notes || '',
        }
      : {
          status: 'active',
          premium_frequency: 'monthly',
          policy_type: 'life_insurance',
          fund_value: 0,
          riders: {},
        },
  })
```

- [ ] **Step 4: Update onSubmit to include new fields**

Update the onSubmit function:

```typescript
  const onSubmit = async (data: PolicyFormData) => {
    const beneficiaries = data.beneficiary_name
      ? [{ name: data.beneficiary_name, percentage: data.beneficiary_percentage || 100 }]
      : []

    const policyData = {
      organization_id: currentUser?.organization_id || '',
      client_id: data.client_id,
      created_by: currentUser?.id || '',
      policy_type: data.policy_type,
      policy_name: data.policy_name,
      policy_number: data.policy_number || null,
      carrier: data.carrier,
      status: data.status,
      effective_date: data.effective_date,
      renewal_date: data.renewal_date || null,
      premium_amount: data.premium_amount,
      premium_frequency: data.premium_frequency,
      coverage_amount: data.coverage_amount || null,
      fund_value: data.fund_value || 0,
      fund_value_date: data.fund_value_date || null,
      riders: data.riders || {},
      beneficiaries: beneficiaries,
      notes: data.notes || null,
    }

    if (policy) {
      updatePolicy({ id: policy.id, ...policyData })
    } else {
      createPolicy(policyData)
    }
    onSuccess()
  }
```

- [ ] **Step 5: Add Fund Value fields to the form JSX**

Add after the Coverage Amount field (after line 227, before Beneficiary fields):

```tsx
        {/* Fund Value */}
        <div className="space-y-2">
          <Label htmlFor="fund_value">Fund Value</Label>
          <Input
            id="fund_value"
            type="number"
            step="0.01"
            {...register('fund_value', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        {/* Fund Value Date */}
        <div className="space-y-2">
          <Label htmlFor="fund_value_date">Fund Value As Of</Label>
          <Input id="fund_value_date" type="date" {...register('fund_value_date')} />
        </div>
```

- [ ] **Step 6: Add Riders Editor to the form JSX**

Add after the Notes field (before the submit buttons, around line 267):

```tsx
        {/* Riders */}
        <div className="md:col-span-2">
          <Controller
            name="riders"
            control={control}
            render={({ field }) => (
              <RidersEditor
                value={(field.value as PolicyRiders) || {}}
                onChange={field.onChange}
              />
            )}
          />
        </div>
```

- [ ] **Step 7: Verify the form renders correctly**

Run: `cd financial-advisor-crm && npm run dev`
Expected: App starts, navigate to Policies, open Add Policy form, fund value and riders sections are visible

- [ ] **Step 8: Commit PolicyForm changes**

```bash
git add src/features/policies/components/PolicyForm.tsx
git commit -m "feat(policies): add fund value and riders fields to PolicyForm"
```

---

### Task 6: Update Pipeline Stages for Insurance Workflow

**Files:**
- Create: `supabase/migrations/011_insurance_pipeline_stages.sql`

- [ ] **Step 1: Create migration to update default pipeline stages**

```sql
-- Update pipeline stages for insurance-specific workflow
-- This adds stages commonly used in insurance sales tracking

-- First, check if we're dealing with the default org (for seeding purposes)
DO $$
DECLARE
  org_id UUID := '11111111-1111-1111-1111-111111111111';
  existing_count INTEGER;
BEGIN
  -- Count existing stages for the org
  SELECT COUNT(*) INTO existing_count FROM pipeline_stages WHERE organization_id = org_id;

  -- Only proceed if we have the default 6 stages
  IF existing_count = 6 THEN
    -- Delete existing stages for clean slate
    DELETE FROM pipeline_stages WHERE organization_id = org_id;

    -- Insert insurance-specific stages
    INSERT INTO pipeline_stages (organization_id, name, color, position, is_closed, is_won) VALUES
      (org_id, 'New Lead', '#3B82F6', 1, false, false),
      (org_id, 'Approached', '#8B5CF6', 2, false, false),
      (org_id, 'Presentation', '#6366F1', 3, false, false),
      (org_id, 'Proposal Sent', '#EAB308', 4, false, false),
      (org_id, 'Follow-up', '#06B6D4', 5, false, false),
      (org_id, 'Pre-App Submitted', '#F97316', 6, false, false),
      (org_id, 'Outstanding Requirements', '#F59E0B', 7, false, false),
      (org_id, 'For Closing', '#14B8A6', 8, false, false),
      (org_id, 'Issued - Won', '#22C55E', 9, true, true),
      (org_id, 'Closed - Lost', '#EF4444', 10, true, false);

    -- Reassign leads from deleted stages to 'New Lead'
    UPDATE leads
    SET stage_id = (SELECT id FROM pipeline_stages WHERE organization_id = org_id AND position = 1)
    WHERE organization_id = org_id
      AND stage_id NOT IN (SELECT id FROM pipeline_stages WHERE organization_id = org_id);
  END IF;
END $$;
```

- [ ] **Step 2: Verify migration file exists**

Run: `ls -la supabase/migrations/011_insurance_pipeline_stages.sql`
Expected: File exists with correct permissions

- [ ] **Step 3: Commit the pipeline stages migration**

```bash
git add supabase/migrations/011_insurance_pipeline_stages.sql
git commit -m "feat(db): add insurance-specific pipeline stages

Adds 10 stages matching insurance sales workflow:
New Lead, Approached, Presentation, Proposal Sent, Follow-up,
Pre-App Submitted, Outstanding Requirements, For Closing,
Issued - Won, Closed - Lost"
```

---

### Task 7: Apply Migrations and Verify

**Files:**
- No new files

- [ ] **Step 1: Reset Supabase database with new migrations**

Run: `cd financial-advisor-crm && npx supabase db reset`
Expected: Database reset successfully with all migrations applied

- [ ] **Step 2: Start the development server**

Run: `cd financial-advisor-crm && npm run dev`
Expected: App starts without errors

- [ ] **Step 3: Verify Lead Form has occupation field**

1. Navigate to Leads page
2. Click "Add Lead" button
3. Verify occupation field is present with autocomplete suggestions
4. Create a lead with occupation "Engineer"
5. Verify lead is saved with occupation

Expected: Occupation field works correctly

- [ ] **Step 4: Verify Policy Form has fund value and riders**

1. Navigate to Policies page
2. Click "New Entry" button
3. Verify fund value fields are present
4. Verify riders section is present with all 13 rider types
5. Enable a few riders with amounts
6. Create a policy with fund value and riders
7. Verify policy is saved correctly

Expected: Fund value and riders work correctly

- [ ] **Step 5: Verify Pipeline has insurance-specific stages**

1. Navigate to Pipeline page
2. Verify 10 stages are visible in the Kanban board
3. Verify stage names match: New Lead, Approached, Presentation, etc.
4. Drag a lead between stages
5. Verify stage change works correctly

Expected: Pipeline stages match insurance workflow

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 3 implementation - Sales Tracker data gap

- Added occupation field to leads with autocomplete suggestions
- Added fund_value and fund_value_date to policies
- Added riders JSONB field with 13 insurance rider types
- Created RidersEditor component for managing policy riders
- Updated pipeline stages to match insurance sales workflow"
```

---

## Verification Checklist

After all tasks are complete, verify the following:

1. [ ] Database has new columns: `leads.occupation`, `policies.fund_value`, `policies.fund_value_date`, `policies.riders`
2. [ ] TypeScript types compile without errors
3. [ ] LeadForm shows occupation field with autocomplete
4. [ ] PolicyForm shows fund value fields
5. [ ] PolicyForm shows riders editor with all 13 rider types
6. [ ] Pipeline board shows 10 insurance-specific stages
7. [ ] Leads can be created/updated with occupation
8. [ ] Policies can be created/updated with fund value and riders
9. [ ] Leads can be moved between pipeline stages
10. [ ] All sample data loads correctly after db reset
