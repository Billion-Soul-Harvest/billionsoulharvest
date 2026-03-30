# Phase 2: Leads Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the leads module with scoring, activity timeline, advisor assignment, advanced filtering, export, and communication logging.

**Architecture:** Feature-based additions to existing leads module. New database tables for lead_activities, new columns on leads for scoring. New UI components integrated into existing LeadDetail and LeadsList views.

**Tech Stack:** React 19, TypeScript, Supabase, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui, date-fns, Lucide React

---

## File Structure

### New Files
- `supabase/migrations/008_leads_enhancement.sql` - Schema changes for scoring and activities
- `src/features/leads/hooks/useLeadActivities.ts` - Hook for activity CRUD
- `src/features/leads/hooks/useLeadScoring.ts` - Hook for score calculation
- `src/features/leads/components/ActivityTimeline.tsx` - Timeline display component
- `src/features/leads/components/LogActivityDialog.tsx` - Dialog for logging calls/emails/notes
- `src/features/leads/components/AdvancedFilters.tsx` - Advanced filter panel
- `src/features/leads/components/LeadScoreBadge.tsx` - Score badge component
- `src/features/leads/components/ExportLeadsDialog.tsx` - CSV export dialog
- `src/features/dashboard/components/LeadSourceChart.tsx` - Lead source pie chart

### Modified Files
- `src/types/database.ts` - Add LeadActivity type, update Lead type with score fields
- `src/features/leads/hooks/useLeads.ts` - Add scoring calculation, advisor filter
- `src/features/leads/components/LeadsList.tsx` - Add score badge, advanced filters, export button
- `src/features/leads/components/LeadDetail.tsx` - Add activity timeline, quick action buttons, advisor assignment
- `src/features/leads/components/LeadForm.tsx` - Add assigned_to field
- `src/features/pipeline/components/PipelineCard.tsx` - Add score badge
- `src/features/dashboard/components/Dashboard.tsx` - Add lead source chart

---

## Task 1: Database Migration for Lead Activities and Scoring

**Files:**
- Create: `supabase/migrations/008_leads_enhancement.sql`

- [ ] **Step 1: Create migration file with lead_activities table and leads enhancements**

```sql
-- Lead Activities table for comprehensive activity tracking
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'stage_change', 'task_completed')),
  subject TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add scoring columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_factors JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMPTZ;

-- Indexes for lead_activities
CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_organization ON lead_activities(organization_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_occurred ON lead_activities(occurred_at DESC);

-- Index for lead scoring
CREATE INDEX idx_leads_score ON leads(lead_score DESC);

-- Enable RLS on lead_activities
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_activities
CREATE POLICY "org_isolation_select" ON lead_activities
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "org_members_can_insert_activities" ON lead_activities
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "org_members_can_update_activities" ON lead_activities
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "org_members_can_delete_activities" ON lead_activities
  FOR DELETE USING (organization_id = get_user_organization_id());

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  demographic_score INTEGER := 0;
  engagement_score INTEGER := 0;
  source_score INTEGER := 0;
  days_in_pipeline INTEGER;
  completed_tasks INTEGER;
  stage_position INTEGER;
BEGIN
  -- Demographic factors (40% weight, max 40 points)
  IF lead_row.email IS NOT NULL AND lead_row.email != '' THEN
    demographic_score := demographic_score + 10;
  END IF;
  IF lead_row.phone IS NOT NULL AND lead_row.phone != '' THEN
    demographic_score := demographic_score + 10;
  END IF;
  IF lead_row.date_of_birth IS NOT NULL THEN
    demographic_score := demographic_score + 5;
  END IF;
  IF lead_row.financial_goals IS NOT NULL AND lead_row.financial_goals != '' THEN
    demographic_score := demographic_score + 15;
  END IF;

  -- Engagement factors (40% weight, max 40 points)
  -- Get completed tasks count
  SELECT COUNT(*) INTO completed_tasks
  FROM tasks
  WHERE lead_id = lead_row.id AND status = 'done';

  engagement_score := engagement_score + LEAST(completed_tasks * 5, 15);

  -- Days in pipeline penalty (after 14 days, -2 per week, max -10)
  days_in_pipeline := EXTRACT(DAY FROM (now() - lead_row.created_at));
  IF days_in_pipeline > 14 THEN
    engagement_score := engagement_score - LEAST(((days_in_pipeline - 14) / 7) * 2, 10);
  END IF;

  -- Stage progression bonus
  SELECT position INTO stage_position
  FROM pipeline_stages
  WHERE id = lead_row.stage_id;

  IF stage_position IS NOT NULL THEN
    engagement_score := engagement_score + LEAST((stage_position - 1) * 10, 25);
  END IF;

  -- Source factors (20% weight, max 20 points)
  CASE LOWER(COALESCE(lead_row.source, ''))
    WHEN 'referral' THEN source_score := 20;
    WHEN 'website' THEN source_score := 10;
    WHEN 'cold call' THEN source_score := 5;
    WHEN 'social media' THEN source_score := 8;
    WHEN 'event' THEN source_score := 12;
    ELSE source_score := 3;
  END CASE;

  score := GREATEST(demographic_score + engagement_score + source_score, 0);
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to auto-update lead score on lead changes
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lead_score := calculate_lead_score(NEW);
  NEW.last_scored_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score();

-- Update existing leads with scores
UPDATE leads SET lead_score = calculate_lead_score(leads), last_scored_at = now();
```

- [ ] **Step 2: Apply migration to local Supabase**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: Verify schema changes**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx supabase db diff`
Expected: No pending changes (schema is up to date)

- [ ] **Step 4: Commit migration**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add supabase/migrations/008_leads_enhancement.sql
git commit -m "feat(db): add lead_activities table and lead scoring columns

- Add lead_activities table with RLS policies
- Add lead_score, score_factors, last_scored_at to leads
- Add calculate_lead_score function
- Add auto-update trigger for lead scores

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add LeadActivity type and update Lead type**

Add after the existing table definitions (around line 260):

```typescript
      lead_activities: {
        Row: {
          id: string
          organization_id: string
          lead_id: string
          user_id: string | null
          activity_type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed'
          subject: string | null
          description: string | null
          metadata: Json
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          lead_id: string
          user_id?: string | null
          activity_type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed'
          subject?: string | null
          description?: string | null
          metadata?: Json
          occurred_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          lead_id?: string
          user_id?: string | null
          activity_type?: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed'
          subject?: string | null
          description?: string | null
          metadata?: Json
          occurred_at?: string
          created_at?: string
        }
        Relationships: []
      }
```

- [ ] **Step 2: Update leads table Row type with scoring fields**

Update the leads Row type to include:

```typescript
          lead_score: number
          score_factors: Json
          last_scored_at: string | null
```

- [ ] **Step 3: Add convenience types for LeadActivity**

Add after the existing convenience types (around line 418):

```typescript
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row']
export type LeadActivityInsert = Database['public']['Tables']['lead_activities']['Insert']
export type LeadActivityUpdate = Database['public']['Tables']['lead_activities']['Update']

export interface LeadActivityWithUser extends LeadActivity {
  user?: User
}
```

- [ ] **Step 4: Update LeadWithStage interface to include score**

Update the existing LeadWithStage interface:

```typescript
export interface LeadWithStage extends Lead {
  stage: PipelineStage
  assigned_user?: User
  lead_score: number
}
```

- [ ] **Step 5: Verify types compile**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit type updates**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/types/database.ts
git commit -m "feat(types): add LeadActivity type and lead scoring fields

- Add lead_activities table types
- Add lead_score, score_factors, last_scored_at to Lead
- Add LeadActivityWithUser extended type

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Lead Score Badge Component

**Files:**
- Create: `src/features/leads/components/LeadScoreBadge.tsx`

- [ ] **Step 1: Create LeadScoreBadge component**

```tsx
import { cn } from '@/shared/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import type { Json } from '@/types/database'

interface LeadScoreBadgeProps {
  score: number
  scoreFactors?: Json
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

function getScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 70) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Hot' }
  if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warm' }
  return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Cold' }
}

function getScoreRing(score: number): string {
  if (score >= 70) return 'ring-green-500'
  if (score >= 40) return 'ring-yellow-500'
  return 'ring-slate-400'
}

export function LeadScoreBadge({
  score,
  scoreFactors,
  size = 'md',
  showTooltip = true,
}: LeadScoreBadgeProps) {
  const { bg, text, label } = getScoreColor(score)
  const ringColor = getScoreRing(score)

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  }

  const badge = (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold ring-2',
        bg,
        text,
        ringColor,
        sizeClasses[size]
      )}
    >
      {score}
    </div>
  )

  if (!showTooltip) {
    return badge
  }

  const factors = scoreFactors as Record<string, number> | undefined

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold">Lead Score</span>
            <span className={cn('font-bold', text)}>{score}/100 ({label})</span>
          </div>
          {factors && Object.keys(factors).length > 0 && (
            <div className="text-xs space-y-1 border-t pt-2">
              {factors.demographic !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile completeness</span>
                  <span>+{factors.demographic}</span>
                </div>
              )}
              {factors.engagement !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement</span>
                  <span>{factors.engagement >= 0 ? '+' : ''}{factors.engagement}</span>
                </div>
              )}
              {factors.source !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source quality</span>
                  <span>+{factors.source}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit component**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/LeadScoreBadge.tsx
git commit -m "feat(leads): add LeadScoreBadge component

- Display score with color coding (hot/warm/cold)
- Show tooltip with score breakdown
- Support multiple sizes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Lead Activities Hook

**Files:**
- Create: `src/features/leads/hooks/useLeadActivities.ts`

- [ ] **Step 1: Create useLeadActivities hook**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import type { LeadActivityInsert, LeadActivityWithUser } from '@/types/database'

export function useLeadActivities(leadId: string) {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()

  const activitiesQuery = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async (): Promise<LeadActivityWithUser[]> => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*, user:users(*)')
        .eq('lead_id', leadId)
        .order('occurred_at', { ascending: false })

      if (error) throw error
      return data as unknown as LeadActivityWithUser[]
    },
    enabled: !!user && !!leadId,
  })

  const createActivityMutation = useMutation({
    mutationFn: async (
      activity: Omit<LeadActivityInsert, 'organization_id' | 'lead_id' | 'user_id'>
    ) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          ...activity,
          organization_id: user.organization_id,
          lead_id: leadId,
          user_id: user.id,
        })
        .select('*, user:users(*)')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const logCall = (data: {
    subject: string
    description?: string
    duration?: number
    outcome?: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'call',
      subject: data.subject,
      description: data.description,
      metadata: {
        duration: data.duration,
        outcome: data.outcome,
      },
    })
  }

  const logEmail = (data: {
    subject: string
    description?: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'email',
      subject: data.subject,
      description: data.description,
    })
  }

  const logMeeting = (data: {
    subject: string
    description?: string
    attendees?: string[]
    outcome?: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'meeting',
      subject: data.subject,
      description: data.description,
      metadata: {
        attendees: data.attendees,
        outcome: data.outcome,
      },
    })
  }

  const logNote = (data: {
    description: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'note',
      description: data.description,
    })
  }

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    logCall,
    logEmail,
    logMeeting,
    logNote,
    createActivity: createActivityMutation.mutateAsync,
    isCreating: createActivityMutation.isPending,
  }
}
```

- [ ] **Step 2: Verify hook compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit hook**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/hooks/useLeadActivities.ts
git commit -m "feat(leads): add useLeadActivities hook

- Query activities for a lead
- Helper methods for logging calls, emails, meetings, notes
- Auto-invalidate related queries

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Activity Timeline Component

**Files:**
- Create: `src/features/leads/components/ActivityTimeline.tsx`

- [ ] **Step 1: Create ActivityTimeline component**

```tsx
import { format, formatDistanceToNow } from 'date-fns'
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
  User,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import type { LeadActivityWithUser } from '@/types/database'

interface ActivityTimelineProps {
  activities: LeadActivityWithUser[]
  isLoading?: boolean
}

const activityConfig: Record<
  string,
  { icon: typeof Phone; bg: string; text: string; label: string }
> = {
  call: { icon: Phone, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Call' },
  email: { icon: Mail, bg: 'bg-purple-100', text: 'text-purple-600', label: 'Email' },
  meeting: { icon: Calendar, bg: 'bg-green-100', text: 'text-green-600', label: 'Meeting' },
  note: { icon: FileText, bg: 'bg-amber-100', text: 'text-amber-600', label: 'Note' },
  stage_change: { icon: ArrowRight, bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Stage Change' },
  task_completed: { icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Task Completed' },
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-surface-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-surface-2 rounded" />
              <div className="h-3 w-48 bg-surface-2 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No activity recorded yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Log a call, email, or note to start tracking
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-surface-3" />

      <div className="space-y-6">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.activity_type] || activityConfig.note
          const Icon = config.icon
          const metadata = activity.metadata as Record<string, unknown> | undefined

          return (
            <div key={activity.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  config.bg
                )}
              >
                <Icon className={cn('h-5 w-5', config.text)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-semibold uppercase', config.text)}>
                        {config.label}
                      </span>
                      {activity.subject && (
                        <span className="font-medium text-foreground">
                          {activity.subject}
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    )}
                    {/* Metadata display */}
                    {metadata && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {metadata.duration && (
                          <span className="text-xs bg-surface-2 px-2 py-0.5 rounded">
                            Duration: {metadata.duration}min
                          </span>
                        )}
                        {metadata.outcome && (
                          <span className="text-xs bg-surface-2 px-2 py-0.5 rounded">
                            Outcome: {metadata.outcome as string}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.occurred_at), { addSuffix: true })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(activity.occurred_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>

                {/* User attribution */}
                {activity.user && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px]">
                        {activity.user.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.full_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit component**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/ActivityTimeline.tsx
git commit -m "feat(leads): add ActivityTimeline component

- Display chronological activity history
- Icon and color coding by activity type
- Show metadata (duration, outcome)
- User attribution

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Log Activity Dialog Component

**Files:**
- Create: `src/features/leads/components/LogActivityDialog.tsx`

- [ ] **Step 1: Create LogActivityDialog component**

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, Calendar, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { cn } from '@/shared/lib/utils'
import { useLeadActivities } from '../hooks/useLeadActivities'

interface LogActivityDialogProps {
  leadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'call' | 'email' | 'meeting' | 'note'
}

const callSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  duration: z.coerce.number().min(1).optional(),
  outcome: z.string().optional(),
})

const emailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
})

const meetingSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  outcome: z.string().optional(),
})

const noteSchema = z.object({
  description: z.string().min(1, 'Note content is required'),
})

type CallFormData = z.infer<typeof callSchema>
type EmailFormData = z.infer<typeof emailSchema>
type MeetingFormData = z.infer<typeof meetingSchema>
type NoteFormData = z.infer<typeof noteSchema>

export function LogActivityDialog({
  leadId,
  open,
  onOpenChange,
  defaultTab = 'call',
}: LogActivityDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const { logCall, logEmail, logMeeting, logNote, isCreating } = useLeadActivities(leadId)

  const callForm = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: { subject: '', description: '', outcome: '' },
  })

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { subject: '', description: '' },
  })

  const meetingForm = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: { subject: '', description: '', outcome: '' },
  })

  const noteForm = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { description: '' },
  })

  const handleClose = () => {
    callForm.reset()
    emailForm.reset()
    meetingForm.reset()
    noteForm.reset()
    onOpenChange(false)
  }

  const onSubmitCall = async (data: CallFormData) => {
    await logCall(data)
    handleClose()
  }

  const onSubmitEmail = async (data: EmailFormData) => {
    await logEmail(data)
    handleClose()
  }

  const onSubmitMeeting = async (data: MeetingFormData) => {
    await logMeeting(data)
    handleClose()
  }

  const onSubmitNote = async (data: NoteFormData) => {
    await logNote(data)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="call" className="gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="meeting" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Meeting</span>
            </TabsTrigger>
            <TabsTrigger value="note" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
          </TabsList>

          {/* Call Form */}
          <TabsContent value="call">
            <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="call-subject">Subject</Label>
                <Input
                  id="call-subject"
                  placeholder="Brief description of the call"
                  {...callForm.register('subject')}
                />
                {callForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {callForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="call-duration">Duration (minutes)</Label>
                  <Input
                    id="call-duration"
                    type="number"
                    placeholder="15"
                    {...callForm.register('duration')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-outcome">Outcome</Label>
                  <Select
                    value={callForm.watch('outcome') || ''}
                    onValueChange={(v) => callForm.setValue('outcome', v)}
                  >
                    <SelectTrigger id="call-outcome">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="voicemail">Left Voicemail</SelectItem>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                      <SelectItem value="scheduled">Scheduled Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="call-notes">Notes</Label>
                <Textarea
                  id="call-notes"
                  placeholder="Additional notes from the call..."
                  {...callForm.register('description')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Logging...' : 'Log Call'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Email Form */}
          <TabsContent value="email">
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject line"
                  {...emailForm.register('subject')}
                />
                {emailForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-summary">Summary</Label>
                <Textarea
                  id="email-summary"
                  placeholder="Brief summary of the email content..."
                  {...emailForm.register('description')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Logging...' : 'Log Email'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Meeting Form */}
          <TabsContent value="meeting">
            <form onSubmit={meetingForm.handleSubmit(onSubmitMeeting)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-subject">Meeting Title</Label>
                <Input
                  id="meeting-subject"
                  placeholder="What was the meeting about?"
                  {...meetingForm.register('subject')}
                />
                {meetingForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {meetingForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-outcome">Outcome</Label>
                <Select
                  value={meetingForm.watch('outcome') || ''}
                  onValueChange={(v) => meetingForm.setValue('outcome', v)}
                >
                  <SelectTrigger id="meeting-outcome">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="productive">Productive</SelectItem>
                    <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                    <SelectItem value="proposal_requested">Proposal Requested</SelectItem>
                    <SelectItem value="closed_won">Closed - Won</SelectItem>
                    <SelectItem value="closed_lost">Closed - Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-notes">Notes</Label>
                <Textarea
                  id="meeting-notes"
                  placeholder="Meeting notes and action items..."
                  {...meetingForm.register('description')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Logging...' : 'Log Meeting'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Note Form */}
          <TabsContent value="note">
            <form onSubmit={noteForm.handleSubmit(onSubmitNote)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-content">Note</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your note here..."
                  className="min-h-[150px]"
                  {...noteForm.register('description')}
                />
                {noteForm.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {noteForm.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit component**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/LogActivityDialog.tsx
git commit -m "feat(leads): add LogActivityDialog component

- Tabbed interface for call, email, meeting, note logging
- Form validation with Zod
- Outcome selection for calls and meetings
- Duration tracking for calls

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Advanced Filters Component

**Files:**
- Create: `src/features/leads/components/AdvancedFilters.tsx`

- [ ] **Step 1: Create AdvancedFilters component**

```tsx
import { useState } from 'react'
import { format } from 'date-fns'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { cn } from '@/shared/lib/utils'
import type { User, PipelineStage } from '@/types/database'

export interface LeadFilters {
  dateFrom?: string
  dateTo?: string
  assignedTo?: string
  scoreMin?: number
  scoreMax?: number
  source?: string
  hasEmail?: boolean
  hasPhone?: boolean
}

interface AdvancedFiltersProps {
  filters: LeadFilters
  onFiltersChange: (filters: LeadFilters) => void
  users: User[]
  stages: PipelineStage[]
  sources: string[]
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  users,
  stages,
  sources,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && v !== null
  ).length

  const updateFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilter = (key: keyof LeadFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="pt-4">
          <div className="rounded-xl bg-surface-2 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Created From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Created To</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                />
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Assigned To</Label>
                <Select
                  value={filters.assignedTo || 'all'}
                  onValueChange={(v) => updateFilter('assignedTo', v === 'all' ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All advisors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All advisors</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Lead Source</Label>
                <Select
                  value={filters.source || 'all'}
                  onValueChange={(v) => updateFilter('source', v === 'all' ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Min Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={filters.scoreMin ?? ''}
                  onChange={(e) =>
                    updateFilter('scoreMin', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Max Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="100"
                  value={filters.scoreMax ?? ''}
                  onChange={(e) =>
                    updateFilter('scoreMax', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              {/* Contact Info Filters */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Has Email</Label>
                <Select
                  value={
                    filters.hasEmail === undefined
                      ? 'any'
                      : filters.hasEmail
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(v) =>
                    updateFilter(
                      'hasEmail',
                      v === 'any' ? undefined : v === 'yes'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Has email</SelectItem>
                    <SelectItem value="no">Missing email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Has Phone</Label>
                <Select
                  value={
                    filters.hasPhone === undefined
                      ? 'any'
                      : filters.hasPhone
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(v) =>
                    updateFilter(
                      'hasPhone',
                      v === 'any' ? undefined : v === 'yes'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Has phone</SelectItem>
                    <SelectItem value="no">Missing phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dateFrom && (
            <FilterChip
              label={`From: ${format(new Date(filters.dateFrom), 'MMM d, yyyy')}`}
              onClear={() => clearFilter('dateFrom')}
            />
          )}
          {filters.dateTo && (
            <FilterChip
              label={`To: ${format(new Date(filters.dateTo), 'MMM d, yyyy')}`}
              onClear={() => clearFilter('dateTo')}
            />
          )}
          {filters.assignedTo && (
            <FilterChip
              label={`Advisor: ${
                filters.assignedTo === 'unassigned'
                  ? 'Unassigned'
                  : users.find((u) => u.id === filters.assignedTo)?.full_name || 'Unknown'
              }`}
              onClear={() => clearFilter('assignedTo')}
            />
          )}
          {filters.source && (
            <FilterChip
              label={`Source: ${filters.source}`}
              onClear={() => clearFilter('source')}
            />
          )}
          {filters.scoreMin !== undefined && (
            <FilterChip
              label={`Score >= ${filters.scoreMin}`}
              onClear={() => clearFilter('scoreMin')}
            />
          )}
          {filters.scoreMax !== undefined && (
            <FilterChip
              label={`Score <= ${filters.scoreMax}`}
              onClear={() => clearFilter('scoreMax')}
            />
          )}
          {filters.hasEmail !== undefined && (
            <FilterChip
              label={filters.hasEmail ? 'Has email' : 'Missing email'}
              onClear={() => clearFilter('hasEmail')}
            />
          )}
          {filters.hasPhone !== undefined && (
            <FilterChip
              label={filters.hasPhone ? 'Has phone' : 'Missing phone'}
              onClear={() => clearFilter('hasPhone')}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-muted text-primary text-xs font-medium">
      {label}
      <button
        onClick={onClear}
        className="hover:bg-primary/20 rounded-full p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
```

- [ ] **Step 2: Add Collapsible component from shadcn/ui**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx shadcn@latest add collapsible`
Expected: Collapsible component added

- [ ] **Step 3: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit component**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/AdvancedFilters.tsx src/shared/components/ui/collapsible.tsx
git commit -m "feat(leads): add AdvancedFilters component

- Collapsible filter panel
- Date range, advisor, source, score filters
- Contact info presence filters
- Active filter chips with clear buttons

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Export Leads Dialog Component

**Files:**
- Create: `src/features/leads/components/ExportLeadsDialog.tsx`

- [ ] **Step 1: Create ExportLeadsDialog component**

```tsx
import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import type { LeadWithStage } from '@/types/database'

interface ExportLeadsDialogProps {
  leads: LeadWithStage[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ExportColumn {
  key: string
  label: string
  getter: (lead: LeadWithStage) => string
  default: boolean
}

const exportColumns: ExportColumn[] = [
  { key: 'name', label: 'Full Name', getter: (l) => `${l.first_name} ${l.last_name}`, default: true },
  { key: 'first_name', label: 'First Name', getter: (l) => l.first_name, default: false },
  { key: 'last_name', label: 'Last Name', getter: (l) => l.last_name, default: false },
  { key: 'email', label: 'Email', getter: (l) => l.email || '', default: true },
  { key: 'phone', label: 'Phone', getter: (l) => l.phone || '', default: true },
  { key: 'date_of_birth', label: 'Date of Birth', getter: (l) => l.date_of_birth || '', default: false },
  { key: 'source', label: 'Lead Source', getter: (l) => l.source || '', default: true },
  { key: 'stage', label: 'Pipeline Stage', getter: (l) => l.stage?.name || '', default: true },
  { key: 'lead_score', label: 'Lead Score', getter: (l) => String(l.lead_score || 0), default: true },
  { key: 'assigned_to', label: 'Assigned To', getter: (l) => l.assigned_user?.full_name || 'Unassigned', default: true },
  { key: 'financial_goals', label: 'Financial Goals', getter: (l) => l.financial_goals || '', default: false },
  { key: 'notes', label: 'Notes', getter: (l) => l.notes || '', default: false },
  { key: 'created_at', label: 'Created Date', getter: (l) => format(new Date(l.created_at), 'yyyy-MM-dd'), default: true },
  { key: 'updated_at', label: 'Last Updated', getter: (l) => format(new Date(l.updated_at), 'yyyy-MM-dd'), default: false },
]

export function ExportLeadsDialog({ leads, open, onOpenChange }: ExportLeadsDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(exportColumns.filter((c) => c.default).map((c) => c.key))
  )
  const [isExporting, setIsExporting] = useState(false)

  const toggleColumn = (key: string) => {
    const newSelected = new Set(selectedColumns)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedColumns(newSelected)
  }

  const selectAll = () => {
    setSelectedColumns(new Set(exportColumns.map((c) => c.key)))
  }

  const selectNone = () => {
    setSelectedColumns(new Set())
  }

  const exportToCsv = () => {
    setIsExporting(true)

    try {
      const columns = exportColumns.filter((c) => selectedColumns.has(c.key))

      // Create CSV header
      const header = columns.map((c) => `"${c.label}"`).join(',')

      // Create CSV rows
      const rows = leads.map((lead) =>
        columns
          .map((c) => {
            const value = c.getter(lead)
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`
          })
          .join(',')
      )

      const csv = [header, ...rows].join('\n')

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      onOpenChange(false)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Leads
          </DialogTitle>
          <DialogDescription>
            Export {leads.length} lead{leads.length !== 1 ? 's' : ''} to CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Select columns to export:</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                All
              </Button>
              <Button variant="ghost" size="sm" onClick={selectNone}>
                None
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
            {exportColumns.map((column) => (
              <label
                key={column.key}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedColumns.has(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                />
                <span className="text-sm">{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={exportToCsv}
            disabled={selectedColumns.size === 0 || isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit component**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/ExportLeadsDialog.tsx
git commit -m "feat(leads): add ExportLeadsDialog component

- Column selection for export
- CSV generation with proper escaping
- Auto-download with date-stamped filename

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update LeadForm with Advisor Assignment

**Files:**
- Modify: `src/features/leads/components/LeadForm.tsx`

- [ ] **Step 1: Read current LeadForm implementation**

Read the file to understand current structure.

- [ ] **Step 2: Add users query and assigned_to field**

Add after the existing imports:

```tsx
import { useQuery } from '@tanstack/react-query'
```

Add inside the component, after existing hooks:

```tsx
const { data: users = [] } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name')
    if (error) throw error
    return data
  },
})
```

Update the form schema to include assigned_to:

```tsx
assigned_to: z.string().optional(),
```

Add the assigned_to field in the form JSX, after the stage_id select:

```tsx
<div className="space-y-2">
  <Label htmlFor="assigned_to">Assigned To</Label>
  <Select
    value={watch('assigned_to') || 'unassigned'}
    onValueChange={(value) => setValue('assigned_to', value === 'unassigned' ? undefined : value)}
  >
    <SelectTrigger id="assigned_to">
      <SelectValue placeholder="Select advisor" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="unassigned">Unassigned</SelectItem>
      {users.map((user) => (
        <SelectItem key={user.id} value={user.id}>
          {user.full_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 3: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit changes**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/LeadForm.tsx
git commit -m "feat(leads): add advisor assignment to LeadForm

- Add assigned_to dropdown field
- Query users for selection options
- Support unassigned state

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update LeadDetail with Activity Timeline and Quick Actions

**Files:**
- Modify: `src/features/leads/components/LeadDetail.tsx`

- [ ] **Step 1: Read current LeadDetail implementation**

Read the file to understand current structure.

- [ ] **Step 2: Add imports for new components**

Add to imports:

```tsx
import { useLeadActivities } from '../hooks/useLeadActivities'
import { ActivityTimeline } from './ActivityTimeline'
import { LogActivityDialog } from './LogActivityDialog'
import { LeadScoreBadge } from './LeadScoreBadge'
```

- [ ] **Step 3: Add state and hooks for activity features**

Add inside the component:

```tsx
const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
const [activityDialogTab, setActivityDialogTab] = useState<'call' | 'email' | 'meeting' | 'note'>('call')
const { activities, isLoading: activitiesLoading } = useLeadActivities(id!)
```

- [ ] **Step 4: Add lead score badge to header**

In the header section, after the lead name, add:

```tsx
<LeadScoreBadge
  score={lead.lead_score}
  scoreFactors={lead.score_factors}
  size="lg"
/>
```

- [ ] **Step 5: Add quick action buttons**

Add a new section in the sidebar or header:

```tsx
{/* Quick Actions */}
<div className="flex items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setActivityDialogTab('call')
      setIsActivityDialogOpen(true)
    }}
    className="gap-1"
  >
    <Phone className="h-4 w-4" />
    Log Call
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setActivityDialogTab('email')
      setIsActivityDialogOpen(true)
    }}
    className="gap-1"
  >
    <Mail className="h-4 w-4" />
    Log Email
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setActivityDialogTab('note')
      setIsActivityDialogOpen(true)
    }}
    className="gap-1"
  >
    <FileText className="h-4 w-4" />
    Add Note
  </Button>
</div>
```

- [ ] **Step 6: Add activity timeline section**

Add a new card section:

```tsx
{/* Activity Timeline */}
<div className="rounded-2xl bg-surface-0 shadow-sm p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      Activity History
    </h2>
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setActivityDialogTab('note')
        setIsActivityDialogOpen(true)
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Activity
    </Button>
  </div>
  <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
</div>
```

- [ ] **Step 7: Add LogActivityDialog**

At the end, before the closing div:

```tsx
{/* Log Activity Dialog */}
<LogActivityDialog
  leadId={lead.id}
  open={isActivityDialogOpen}
  onOpenChange={setIsActivityDialogOpen}
  defaultTab={activityDialogTab}
/>
```

- [ ] **Step 8: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 9: Commit changes**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/LeadDetail.tsx
git commit -m "feat(leads): add activity timeline and quick actions to LeadDetail

- Display lead score badge in header
- Add quick action buttons for logging calls, emails, notes
- Add activity history timeline section
- Integrate LogActivityDialog

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Update LeadsList with Score Badge, Advanced Filters, and Export

**Files:**
- Modify: `src/features/leads/components/LeadsList.tsx`

- [ ] **Step 1: Read current LeadsList implementation**

Read the file to understand current structure.

- [ ] **Step 2: Add imports for new components**

Add to imports:

```tsx
import { Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { LeadScoreBadge } from './LeadScoreBadge'
import { AdvancedFilters, type LeadFilters } from './AdvancedFilters'
import { ExportLeadsDialog } from './ExportLeadsDialog'
```

- [ ] **Step 3: Add state for advanced filters and export**

Add inside the component:

```tsx
const [advancedFilters, setAdvancedFilters] = useState<LeadFilters>({})
const [isExportOpen, setIsExportOpen] = useState(false)

const { data: users = [] } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const { data, error } = await supabase.from('users').select('*').order('full_name')
    if (error) throw error
    return data
  },
})

// Get unique sources from leads
const sources = [...new Set(leads.map((l) => l.source).filter(Boolean))] as string[]
```

- [ ] **Step 4: Update filtering logic to include advanced filters**

Update the filteredLeads computation:

```tsx
const filteredLeads = activeLeads.filter((lead) => {
  // Search filter
  const searchLower = search.toLowerCase()
  const matchesSearch =
    lead.first_name.toLowerCase().includes(searchLower) ||
    lead.last_name.toLowerCase().includes(searchLower) ||
    lead.email?.toLowerCase().includes(searchLower) ||
    lead.phone?.toLowerCase().includes(searchLower)

  // Stage filter
  const matchesStage = stageFilter === 'all' || lead.stage_id === stageFilter

  // Advanced filters
  let matchesAdvanced = true

  if (advancedFilters.dateFrom) {
    matchesAdvanced = matchesAdvanced && new Date(lead.created_at) >= new Date(advancedFilters.dateFrom)
  }
  if (advancedFilters.dateTo) {
    matchesAdvanced = matchesAdvanced && new Date(lead.created_at) <= new Date(advancedFilters.dateTo)
  }
  if (advancedFilters.assignedTo) {
    if (advancedFilters.assignedTo === 'unassigned') {
      matchesAdvanced = matchesAdvanced && !lead.assigned_to
    } else {
      matchesAdvanced = matchesAdvanced && lead.assigned_to === advancedFilters.assignedTo
    }
  }
  if (advancedFilters.source) {
    matchesAdvanced = matchesAdvanced && lead.source === advancedFilters.source
  }
  if (advancedFilters.scoreMin !== undefined) {
    matchesAdvanced = matchesAdvanced && lead.lead_score >= advancedFilters.scoreMin
  }
  if (advancedFilters.scoreMax !== undefined) {
    matchesAdvanced = matchesAdvanced && lead.lead_score <= advancedFilters.scoreMax
  }
  if (advancedFilters.hasEmail !== undefined) {
    matchesAdvanced = matchesAdvanced && (advancedFilters.hasEmail ? !!lead.email : !lead.email)
  }
  if (advancedFilters.hasPhone !== undefined) {
    matchesAdvanced = matchesAdvanced && (advancedFilters.hasPhone ? !!lead.phone : !lead.phone)
  }

  return matchesSearch && matchesStage && matchesAdvanced
})
```

- [ ] **Step 5: Add Advanced Filters component to UI**

Add after the stage filter pills:

```tsx
<AdvancedFilters
  filters={advancedFilters}
  onFiltersChange={setAdvancedFilters}
  users={users}
  stages={stages}
  sources={sources}
/>
```

- [ ] **Step 6: Add Export button next to Add Lead**

Update the button section:

```tsx
<div className="flex items-center gap-2">
  <Button variant="outline" onClick={() => setIsExportOpen(true)}>
    <Download className="h-4 w-4 mr-2" />
    Export
  </Button>
  <Button onClick={() => setIsFormOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Add Lead
  </Button>
</div>
```

- [ ] **Step 7: Add score badge to card and table views**

In CardView, after the stage badge:

```tsx
<LeadScoreBadge score={lead.lead_score} size="sm" />
```

In TableView, add a new column for score:

```tsx
<th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
  Score
</th>
```

And the corresponding cell:

```tsx
<td className="px-6 py-4 hidden lg:table-cell">
  <LeadScoreBadge score={lead.lead_score} size="sm" />
</td>
```

- [ ] **Step 8: Add ExportLeadsDialog**

At the end of the component:

```tsx
<ExportLeadsDialog
  leads={filteredLeads}
  open={isExportOpen}
  onOpenChange={setIsExportOpen}
/>
```

- [ ] **Step 9: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 10: Commit changes**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/leads/components/LeadsList.tsx
git commit -m "feat(leads): add score badge, advanced filters, and export to LeadsList

- Display lead score badge in card and table views
- Add collapsible advanced filters panel
- Add CSV export functionality
- Support filtering by date, advisor, source, score, contact info

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Update Pipeline Card with Score Badge

**Files:**
- Modify: `src/features/pipeline/components/PipelineCard.tsx`

- [ ] **Step 1: Read current PipelineCard implementation**

Read the file to understand current structure.

- [ ] **Step 2: Add LeadScoreBadge import and display**

Add import:

```tsx
import { LeadScoreBadge } from '@/features/leads/components/LeadScoreBadge'
```

Add the score badge in the card, near the lead name:

```tsx
<LeadScoreBadge score={lead.lead_score} size="sm" />
```

- [ ] **Step 3: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit changes**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/pipeline/components/PipelineCard.tsx
git commit -m "feat(pipeline): add lead score badge to pipeline cards

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Create Lead Source Chart Component

**Files:**
- Create: `src/features/dashboard/components/LeadSourceChart.tsx`

- [ ] **Step 1: Create LeadSourceChart component**

```tsx
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LeadWithStage } from '@/types/database'

interface LeadSourceChartProps {
  leads: LeadWithStage[]
}

const sourceColors: Record<string, string> = {
  referral: '#22c55e',
  website: '#3b82f6',
  'cold call': '#f97316',
  'social media': '#8b5cf6',
  event: '#eab308',
  other: '#6b7280',
}

export function LeadSourceChart({ leads }: LeadSourceChartProps) {
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {}
    leads.forEach((lead) => {
      const source = (lead.source || 'other').toLowerCase()
      counts[source] = (counts[source] || 0) + 1
    })

    const total = leads.length
    return Object.entries(counts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: sourceColors[source] || sourceColors.other,
      }))
      .sort((a, b) => b.count - a.count)
  }, [leads])

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Lead Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No leads to analyze
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate pie chart segments
  let currentAngle = 0
  const segments = sourceData.map((item) => {
    const angle = (item.percentage / 100) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...item, startAngle, angle }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Lead Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {segments.map((segment, i) => {
                const radius = 45
                const circumference = 2 * Math.PI * radius
                const strokeDasharray = (segment.angle / 360) * circumference
                const strokeDashoffset = -(segment.startAngle / 360) * circumference

                return (
                  <circle
                    key={segment.source}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="10"
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Total</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {sourceData.slice(0, 5).map((item) => (
              <div key={item.source} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm capitalize flex-1 truncate">{item.source}</span>
                <span className="text-sm font-semibold">{item.count}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit component**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/dashboard/components/LeadSourceChart.tsx
git commit -m "feat(dashboard): add LeadSourceChart component

- SVG pie chart for lead source distribution
- Color-coded legend with counts and percentages
- Responsive layout

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Update Dashboard with Lead Source Chart

**Files:**
- Modify: `src/features/dashboard/components/Dashboard.tsx`
- Modify: `src/features/dashboard/hooks/useDashboardData.ts`

- [ ] **Step 1: Read current useDashboardData hook**

Read the file to understand current structure.

- [ ] **Step 2: Add leads query to useDashboardData**

Add to the hook's queries:

```typescript
const leadsQuery = useQuery({
  queryKey: ['dashboard', 'leads'],
  queryFn: async (): Promise<LeadWithStage[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*, stage:pipeline_stages(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as LeadWithStage[]
  },
  enabled: !!user,
})
```

Return leads in the hook:

```typescript
return {
  tasks,
  stats,
  activities,
  leads: leadsQuery.data || [],
  isLoading: tasksQuery.isLoading || statsLoading || activitiesQuery.isLoading || leadsQuery.isLoading,
}
```

- [ ] **Step 3: Update Dashboard component**

Add import:

```tsx
import { LeadSourceChart } from './LeadSourceChart'
```

Update the Dashboard component to include the chart:

```tsx
export function Dashboard() {
  const { tasks, stats, activities, leads, isLoading } = useDashboardData()

  if (isLoading) {
    // ... existing loading state
  }

  return (
    <div className="space-y-8 p-2">
      <QuickStats stats={stats} />
      <div className="grid gap-8 lg:grid-cols-2">
        <TodaysTasks tasks={tasks} />
        <div className="space-y-8">
          <LeadSourceChart leads={leads} />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify component compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit changes**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add src/features/dashboard/components/Dashboard.tsx src/features/dashboard/hooks/useDashboardData.ts
git commit -m "feat(dashboard): integrate lead source chart

- Add leads query to dashboard data hook
- Display LeadSourceChart in dashboard layout

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Final Verification and Build

**Files:**
- All project files

- [ ] **Step 1: Run TypeScript check**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run ESLint**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npm run lint`
Expected: No linting errors (or only minor warnings)

- [ ] **Step 3: Build the project**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npm run build`
Expected: Build completes successfully

- [ ] **Step 4: Start dev server and verify**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npm run dev`
Expected: Application starts without errors

- [ ] **Step 5: Manual testing checklist**

Test the following:
- [ ] Dashboard shows lead source chart
- [ ] Leads list shows score badges
- [ ] Leads list advanced filters work
- [ ] Leads list export works
- [ ] Lead detail shows score badge
- [ ] Lead detail shows activity timeline
- [ ] Lead detail quick action buttons open dialogs
- [ ] Log call/email/meeting/note dialogs work
- [ ] Lead form has advisor assignment dropdown
- [ ] Pipeline cards show score badges

- [ ] **Step 6: Final commit**

```bash
cd /Users/bertwinromero/Documents/personal/financial-advisor-crm
git add -A
git status
git commit -m "feat: complete Phase 2 leads enhancement

Phase 2 features implemented:
- Lead scoring system (0-100 with factors breakdown)
- Activity timeline on lead detail
- Communication logging (calls, emails, meetings, notes)
- Advisor assignment UI
- Advanced filtering (date, advisor, source, score)
- CSV export functionality
- Lead source analytics chart

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Verification Summary

1. **Database Migration**: Schema changes applied, lead scoring function works
2. **Lead Scoring**: Scores display correctly, tooltips show factors
3. **Activity Timeline**: Activities appear chronologically, icons correct
4. **Communication Logging**: All activity types can be logged
5. **Advisor Assignment**: Dropdown works, filters by advisor work
6. **Advanced Filters**: All filters apply correctly, chips show/clear
7. **Export**: CSV downloads with selected columns
8. **Lead Source Chart**: Pie chart displays, legend accurate
9. **Build**: Project builds without errors
