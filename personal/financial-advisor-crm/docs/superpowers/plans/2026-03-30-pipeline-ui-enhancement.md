# Pipeline UI Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Pipeline UI to match the "Institutional Atelier" design from the PRD mockup with richer cards, filter bar, volume totals, and improved visual hierarchy.

**Architecture:** Add `estimated_value` field to leads, create a PipelineFilterBar component for advisor/date filtering, enhance PipelineColumn to show volume totals, redesign PipelineCard with value display and action indicators, and add a floating action button. Follow the "No-Line Rule" using surface hierarchy for elevation.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, @dnd-kit, Lucide React, date-fns, shadcn/ui components

---

## File Structure

| File | Responsibility |
|------|----------------|
| `supabase/migrations/009_add_lead_estimated_value.sql` | Add estimated_value field to leads |
| `src/types/database.ts` | Update Lead type with estimated_value |
| `src/features/pipeline/components/PipelineFilterBar.tsx` | Advisor/date filters, team avatars, Generate Report button |
| `src/features/pipeline/components/PipelineColumn.tsx` | Enhanced header with volume totals, closed column styling |
| `src/features/pipeline/components/PipelineCard.tsx` | Rich card with value, action indicators, score badge |
| `src/features/pipeline/components/PipelineCardMenu.tsx` | Three-dot menu for card actions |
| `src/features/pipeline/components/PipelineBoard.tsx` | Integrate filter bar, add FAB button |
| `src/features/pipeline/hooks/usePipeline.ts` | Add filtering logic and volume calculations |
| `src/features/leads/components/LeadScoreBadge.tsx` | Update to match PRD "HIGH SCORE"/"MED SCORE" pill style |

---

### Task 1: Database Migration - Add estimated_value to leads

**Files:**
- Create: `supabase/migrations/009_add_lead_estimated_value.sql`
- Modify: `src/types/database.ts:100-156`

- [ ] **Step 1: Create migration file**

```sql
-- Add estimated_value field to leads table for pipeline value tracking
ALTER TABLE leads ADD COLUMN estimated_value NUMERIC DEFAULT 0;

-- Add last_contact_at field for tracking contact history
ALTER TABLE leads ADD COLUMN last_contact_at TIMESTAMPTZ;

-- Create index for filtering by estimated_value
CREATE INDEX idx_leads_estimated_value ON leads(estimated_value);

-- Update last_contact_at from most recent activity
UPDATE leads l
SET last_contact_at = (
  SELECT MAX(occurred_at)
  FROM lead_activities la
  WHERE la.lead_id = l.id
  AND la.activity_type IN ('call', 'email', 'meeting')
);
```

- [ ] **Step 2: Update TypeScript types in database.ts**

In `src/types/database.ts`, find the `leads` table Row type (around line 100-118) and add these fields after `updated_at`:

```typescript
          estimated_value: number
          last_contact_at: string | null
```

Also add to the Insert type (around line 119-137):

```typescript
          estimated_value?: number
          last_contact_at?: string | null
```

Also add to the Update type (around line 138-156):

```typescript
          estimated_value?: number
          last_contact_at?: string | null
```

- [ ] **Step 3: Apply migration (if local Supabase running)**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && supabase db push`

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/009_add_lead_estimated_value.sql src/types/database.ts
git commit -m "feat(pipeline): add estimated_value and last_contact_at to leads table"
```

---

### Task 2: Update LeadScoreBadge to PRD Style

**Files:**
- Modify: `src/features/leads/components/LeadScoreBadge.tsx`

The PRD shows score badges as pill-shaped labels reading "HIGH SCORE" or "MED SCORE" with green or gray backgrounds, not circular number badges. Update the component to support both styles.

- [ ] **Step 1: Update LeadScoreBadge component**

Replace the entire content of `src/features/leads/components/LeadScoreBadge.tsx`:

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
  variant?: 'numeric' | 'label'
}

function getScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 70) return { bg: 'bg-green-100', text: 'text-green-700', label: 'High Score' }
  if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Med Score' }
  return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Low Score' }
}

function getScoreRing(score: number): string {
  if (score >= 70) return 'ring-green-500'
  if (score >= 40) return 'ring-amber-500'
  return 'ring-slate-400'
}

export function LeadScoreBadge({
  score,
  scoreFactors,
  size = 'md',
  showTooltip = true,
  variant = 'numeric',
}: LeadScoreBadgeProps) {
  const { bg, text, label } = getScoreColor(score)
  const ringColor = getScoreRing(score)

  const numericSizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  }

  const labelSizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }

  const badge = variant === 'label' ? (
    <span
      className={cn(
        'inline-flex items-center rounded font-bold uppercase tracking-wider',
        bg,
        text,
        labelSizeClasses[size]
      )}
    >
      {label}
    </span>
  ) : (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold ring-2',
        bg,
        text,
        ringColor,
        numericSizeClasses[size]
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/leads/components/LeadScoreBadge.tsx
git commit -m "feat(pipeline): add label variant to LeadScoreBadge for PRD-style display"
```

---

### Task 3: Create PipelineCardMenu Component

**Files:**
- Create: `src/features/pipeline/components/PipelineCardMenu.tsx`

- [ ] **Step 1: Create PipelineCardMenu component**

```tsx
import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'

interface PipelineCardMenuProps {
  leadId: string
  onScheduleTask?: () => void
  onAssign?: () => void
  onDelete?: () => void
}

export function PipelineCardMenu({
  leadId,
  onScheduleTask,
  onAssign,
  onDelete,
}: PipelineCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to={`/leads/${leadId}`} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/leads/${leadId}/edit`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Lead
          </Link>
        </DropdownMenuItem>
        {onScheduleTask && (
          <DropdownMenuItem onClick={onScheduleTask} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Task
          </DropdownMenuItem>
        )}
        {onAssign && (
          <DropdownMenuItem onClick={onAssign} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Reassign
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Lead
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/pipeline/components/PipelineCardMenu.tsx
git commit -m "feat(pipeline): add PipelineCardMenu component for card actions"
```

---

### Task 4: Enhance PipelineCard with PRD Design

**Files:**
- Modify: `src/features/pipeline/components/PipelineCard.tsx`

- [ ] **Step 1: Replace PipelineCard with enhanced version**

```tsx
import { Link } from 'react-router-dom'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { LeadScoreBadge } from '@/features/leads/components/LeadScoreBadge'
import { PipelineCardMenu } from './PipelineCardMenu'
import type { LeadWithStage } from '@/types/database'
import type { Task } from '@/types/database'

interface PipelineCardProps {
  lead: LeadWithStage
  isDragging?: boolean
  nextTask?: Task
  isClosedStage?: boolean
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`
  }
  return `$${value.toLocaleString()}`
}

export function PipelineCard({
  lead,
  isDragging = false,
  nextTask,
  isClosedStage = false,
}: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const isWon = lead.stage?.is_won
  const isLost = lead.stage?.is_closed && !lead.stage?.is_won

  // Closed stage cards have a different, simpler design
  if (isClosedStage) {
    return (
      <div ref={setNodeRef} style={style}>
        <div
          className={cn(
            'rounded-xl bg-surface-0 shadow-md p-4 cursor-grab active:cursor-grabbing transition-all',
            isWon && 'border-l-4 border-l-secondary',
            isLost && 'border-l-4 border-l-destructive',
            isDragging && 'opacity-50 shadow-xl scale-105'
          )}
          {...listeners}
          {...attributes}
        >
          <div className="flex justify-between items-start mb-2">
            <Link
              to={`/leads/${lead.id}`}
              className="font-[Manrope] font-bold text-primary hover:text-primary/80 transition-colors"
            >
              {lead.first_name} {lead.last_name}
            </Link>
            {isWon ? (
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mb-1">
            {lead.estimated_value ? formatCurrency(lead.estimated_value) : 'No value'} •{' '}
            {lead.source || 'Unknown source'}
          </p>
          <p
            className={cn(
              'text-[10px] font-bold uppercase tracking-tight',
              isWon ? 'text-secondary' : 'text-destructive'
            )}
          >
            {isWon ? 'Won' : 'Lost'} -{' '}
            {format(new Date(lead.updated_at), 'MMM d')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'rounded-xl bg-surface-0 shadow-md cursor-grab active:cursor-grabbing transition-all hover:shadow-lg group',
          isDragging && 'opacity-50 shadow-xl scale-105'
        )}
      >
        <div className="p-4">
          {/* Header: Score badge and menu */}
          <div className="flex justify-between items-start mb-3">
            <LeadScoreBadge
              score={lead.lead_score}
              scoreFactors={lead.score_factors}
              variant="label"
              size="sm"
            />
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <PipelineCardMenu leadId={lead.id} />
            </div>
          </div>

          {/* Name */}
          <Link
            to={`/leads/${lead.id}`}
            className="font-[Manrope] font-bold text-primary hover:text-primary/80 block mb-3 transition-colors"
            {...listeners}
            {...attributes}
          >
            {lead.first_name} {lead.last_name}
          </Link>

          {/* Value and Last Contact rows */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>Value</span>
              <span className="text-primary font-bold">
                {lead.estimated_value
                  ? formatCurrency(lead.estimated_value)
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>Last Contact</span>
              <span>
                {lead.last_contact_at
                  ? format(new Date(lead.last_contact_at), 'MMM d, yyyy')
                  : 'Never'}
              </span>
            </div>
          </div>

          {/* Action indicator (next task or contact info) */}
          {nextTask && (
            <div className="mt-4 pt-3 bg-surface-1 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl flex items-center gap-2">
              {nextTask.task_type === 'follow_up' && (
                <>
                  <Calendar className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-[10px] font-bold text-destructive uppercase">
                    Follow up:{' '}
                    {formatDistanceToNow(new Date(nextTask.due_date), {
                      addSuffix: false,
                    })}
                  </span>
                </>
              )}
              {nextTask.task_type === 'meeting' && (
                <>
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {nextTask.title}
                  </span>
                </>
              )}
              {!['follow_up', 'meeting'].includes(nextTask.task_type) && (
                <>
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {nextTask.title}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Contact info fallback when no task */}
          {!nextTask && (lead.email || lead.phone) && (
            <div className="mt-4 pt-3 bg-surface-1 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl flex items-center gap-3">
              {lead.email && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="text-[10px] truncate max-w-[100px]">
                    {lead.email}
                  </span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span className="text-[10px]">{lead.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/pipeline/components/PipelineCard.tsx
git commit -m "feat(pipeline): enhance PipelineCard with PRD design - value, actions, closed styling"
```

---

### Task 5: Create PipelineFilterBar Component

**Files:**
- Create: `src/features/pipeline/components/PipelineFilterBar.tsx`

- [ ] **Step 1: Create PipelineFilterBar component**

```tsx
import { FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import type { User } from '@/types/database'

interface PipelineFilterBarProps {
  advisors: User[]
  selectedAdvisor: string
  onAdvisorChange: (advisorId: string) => void
  selectedDateRange: string
  onDateRangeChange: (range: string) => void
  onGenerateReport?: () => void
}

export function PipelineFilterBar({
  advisors,
  selectedAdvisor,
  onAdvisorChange,
  selectedDateRange,
  onDateRangeChange,
  onGenerateReport,
}: PipelineFilterBarProps) {
  // Show up to 2 advisor avatars + count
  const displayAdvisors = advisors.slice(0, 2)
  const remainingCount = advisors.length - 2

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      {/* Filters */}
      <div className="flex items-center gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Advisor
          </label>
          <Select value={selectedAdvisor} onValueChange={onAdvisorChange}>
            <SelectTrigger className="w-40 bg-surface-0 shadow-sm">
              <SelectValue placeholder="All Advisors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Advisors</SelectItem>
              {advisors.map((advisor) => (
                <SelectItem key={advisor.id} value={advisor.id}>
                  {advisor.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Date Range
          </label>
          <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-36 bg-surface-0 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="last_30">Last 30 Days</SelectItem>
              <SelectItem value="this_year">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team avatars and Generate Report */}
      <div className="flex items-center gap-3">
        {advisors.length > 0 && (
          <div className="flex -space-x-2">
            {displayAdvisors.map((advisor) => (
              <Avatar
                key={advisor.id}
                className="h-8 w-8 border-2 border-surface-1"
              >
                {advisor.avatar_url && (
                  <AvatarImage src={advisor.avatar_url} alt={advisor.full_name} />
                )}
                <AvatarFallback className="text-[10px] font-bold">
                  {advisor.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {remainingCount > 0 && (
              <div className="h-8 w-8 rounded-full border-2 border-surface-1 bg-surface-3 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                +{remainingCount}
              </div>
            )}
          </div>
        )}

        {onGenerateReport && (
          <Button
            onClick={onGenerateReport}
            className="bg-secondary-muted text-secondary hover:bg-secondary hover:text-white transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/pipeline/components/PipelineFilterBar.tsx
git commit -m "feat(pipeline): add PipelineFilterBar with advisor/date filters and team avatars"
```

---

### Task 6: Enhance PipelineColumn with Volume Totals

**Files:**
- Modify: `src/features/pipeline/components/PipelineColumn.tsx`

- [ ] **Step 1: Replace PipelineColumn with enhanced version**

```tsx
import { useDroppable } from '@dnd-kit/core'
import { PipelineCard } from './PipelineCard'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import type { PipelineStage, LeadWithStage, Task } from '@/types/database'

interface PipelineColumnProps {
  stage: PipelineStage
  leads: LeadWithStage[]
  leadTasks?: Record<string, Task | undefined>
}

function formatVolume(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M Vol`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k Vol`
  }
  return `$${value.toLocaleString()} Vol`
}

export function PipelineColumn({ stage, leads, leadTasks = {} }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  // Calculate total volume for this stage
  const totalVolume = leads.reduce(
    (sum, lead) => sum + (lead.estimated_value || 0),
    0
  )

  const isClosedStage = stage.is_closed

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-80 min-w-80 rounded-2xl transition-all duration-200',
        isClosedStage
          ? 'bg-surface-2/50'
          : isOver
            ? 'bg-primary-muted shadow-lg scale-[1.02]'
            : 'bg-surface-2'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-surface-3 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-[Manrope] font-bold text-primary text-sm tracking-tight">
            {stage.name}
          </h3>
          <span className="bg-surface-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground shadow-sm">
            {leads.length.toString().padStart(2, '0')}
          </span>
        </div>
        <p
          className={cn(
            'text-[10px] font-bold tracking-tight',
            stage.is_won ? 'text-secondary' : 'text-muted-foreground'
          )}
        >
          {stage.is_won
            ? formatVolume(totalVolume).replace(' Vol', ' Won')
            : formatVolume(totalVolume)}
        </p>
      </div>

      {/* Cards */}
      <ScrollArea
        className={cn('flex-1 p-3', isClosedStage && 'opacity-70 grayscale-[0.3]')}
      >
        <div className="space-y-4">
          {leads.map((lead) => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              nextTask={leadTasks[lead.id]}
              isClosedStage={isClosedStage}
            />
          ))}
          {leads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground rounded-xl bg-surface-0/50">
              <p className="font-medium">No leads</p>
              <p className="text-xs mt-1">Drag leads here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/pipeline/components/PipelineColumn.tsx
git commit -m "feat(pipeline): enhance PipelineColumn with volume totals and closed stage styling"
```

---

### Task 7: Update usePipeline Hook with Filtering

**Files:**
- Modify: `src/features/pipeline/hooks/usePipeline.ts`

- [ ] **Step 1: Add advisor filtering to usePipelineLeads**

Replace the entire content of `src/features/pipeline/hooks/usePipeline.ts`:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import type {
  PipelineStage,
  PipelineStageInsert,
  PipelineStageUpdate,
  LeadWithStage,
  User,
  Task,
} from '@/types/database'

export function usePipelineStages() {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()

  const stagesQuery = useQuery({
    queryKey: ['pipeline', 'stages'],
    queryFn: async (): Promise<PipelineStage[]> => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const createStageMutation = useMutation({
    mutationFn: async (stage: Omit<PipelineStageInsert, 'organization_id'>) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({
          ...stage,
          organization_id: user.organization_id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, ...updates }: PipelineStageUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const deleteStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipeline_stages').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const reorderStagesMutation = useMutation({
    mutationFn: async (stages: { id: string; position: number }[]) => {
      for (const stage of stages) {
        await supabase
          .from('pipeline_stages')
          .update({ position: stage.position })
          .eq('id', stage.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  return {
    stages: stagesQuery.data || [],
    isLoading: stagesQuery.isLoading,
    createStage: createStageMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    deleteStage: deleteStageMutation.mutateAsync,
    reorderStages: reorderStagesMutation.mutateAsync,
  }
}

interface UsePipelineLeadsOptions {
  advisorId?: string
  dateRange?: string
}

export function usePipelineLeads(options: UsePipelineLeadsOptions = {}) {
  const { advisorId, dateRange } = options
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()

  const leadsQuery = useQuery({
    queryKey: ['pipeline', 'leads', advisorId, dateRange],
    queryFn: async (): Promise<LeadWithStage[]> => {
      let query = supabase
        .from('leads')
        .select('*, stage:pipeline_stages(*), assigned_user:users(*)')
        .order('created_at', { ascending: false })

      // Filter by advisor
      if (advisorId && advisorId !== 'all') {
        query = query.eq('assigned_to', advisorId)
      }

      // Filter by date range
      if (dateRange && dateRange !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (dateRange) {
          case 'last_30':
            startDate = new Date(now.setDate(now.getDate() - 30))
            break
          case 'this_quarter': {
            const quarter = Math.floor(new Date().getMonth() / 3)
            startDate = new Date(new Date().getFullYear(), quarter * 3, 1)
            break
          }
          case 'this_year':
            startDate = new Date(new Date().getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(0)
        }

        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data as unknown as LeadWithStage[]
    },
    enabled: !!user,
  })

  const moveLeadMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ stage_id: stageId })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      if (user) {
        const { data: stage } = await supabase
          .from('pipeline_stages')
          .select('name')
          .eq('id', stageId)
          .single()

        await supabase.from('activity_logs').insert({
          organization_id: user.organization_id,
          lead_id: leadId,
          user_id: user.id,
          action_type: 'stage_changed',
          description: `Moved lead to ${stage?.name}`,
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    moveLead: moveLeadMutation.mutateAsync,
  }
}

export function usePipelineAdvisors() {
  const { data: user } = useCurrentUser()

  const advisorsQuery = useQuery({
    queryKey: ['pipeline', 'advisors'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return {
    advisors: advisorsQuery.data || [],
    isLoading: advisorsQuery.isLoading,
  }
}

export function useLeadTasks(leadIds: string[]) {
  const { data: user } = useCurrentUser()

  const tasksQuery = useQuery({
    queryKey: ['pipeline', 'lead-tasks', leadIds],
    queryFn: async (): Promise<Record<string, Task | undefined>> => {
      if (leadIds.length === 0) return {}

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('lead_id', leadIds)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })

      if (error) throw error

      // Group by lead_id and take the first (soonest) task per lead
      const tasksByLead: Record<string, Task | undefined> = {}
      for (const task of data) {
        if (task.lead_id && !tasksByLead[task.lead_id]) {
          tasksByLead[task.lead_id] = task as Task
        }
      }

      return tasksByLead
    },
    enabled: !!user && leadIds.length > 0,
  })

  return {
    tasksByLead: tasksQuery.data || {},
    isLoading: tasksQuery.isLoading,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/pipeline/hooks/usePipeline.ts
git commit -m "feat(pipeline): add filtering, advisors query, and lead tasks to usePipeline"
```

---

### Task 8: Integrate All Components in PipelineBoard

**Files:**
- Modify: `src/features/pipeline/components/PipelineBoard.tsx`

- [ ] **Step 1: Replace PipelineBoard with full integration**

```tsx
import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  usePipelineStages,
  usePipelineLeads,
  usePipelineAdvisors,
  useLeadTasks,
} from '../hooks/usePipeline'
import { PipelineColumn } from './PipelineColumn'
import { PipelineCard } from './PipelineCard'
import { PipelineFilterBar } from './PipelineFilterBar'
import { LeadForm } from '@/features/leads/components/LeadForm'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Plus } from 'lucide-react'
import type { LeadWithStage } from '@/types/database'

export function PipelineBoard() {
  const { stages, isLoading: stagesLoading } = usePipelineStages()
  const { advisors } = usePipelineAdvisors()

  // Filter state
  const [selectedAdvisor, setSelectedAdvisor] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all')

  const { leads, isLoading: leadsLoading, moveLead } = usePipelineLeads({
    advisorId: selectedAdvisor,
    dateRange: selectedDateRange,
  })

  // Get tasks for all leads
  const leadIds = leads.map((l) => l.id)
  const { tasksByLead } = useLeadTasks(leadIds)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const activeLead = leads.find((lead) => lead.id === activeId)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const targetStage = stages.find((s) => s.id === overId)
    if (targetStage) {
      const lead = leads.find((l) => l.id === leadId)
      if (lead && lead.stage_id !== targetStage.id) {
        await moveLead({ leadId, stageId: targetStage.id })
      }
    }
  }

  const handleGenerateReport = () => {
    // TODO: Implement report generation
    console.log('Generate report clicked')
  }

  if (stagesLoading || leadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Group leads by stage
  const leadsByStage = stages.reduce(
    (acc, stage) => {
      acc[stage.id] = leads.filter((lead) => lead.stage_id === stage.id)
      return acc
    },
    {} as Record<string, LeadWithStage[]>
  )

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PipelineFilterBar
        advisors={advisors}
        selectedAdvisor={selectedAdvisor}
        onAdvisorChange={setSelectedAdvisor}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        onGenerateReport={handleGenerateReport}
      />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              leadTasks={tasksByLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <PipelineCard
              lead={activeLead}
              isDragging
              nextTask={tasksByLead[activeLead.id]}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Action Button */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-50"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Lead</DialogTitle>
          </DialogHeader>
          <LeadForm onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/pipeline/components/PipelineBoard.tsx
git commit -m "feat(pipeline): integrate filter bar, enhanced cards, and FAB in PipelineBoard"
```

---

### Task 9: Update LeadForm to Include estimated_value

**Files:**
- Modify: `src/features/leads/components/LeadForm.tsx`

- [ ] **Step 1: Read current LeadForm to understand structure**

Read the current file to identify where to add the estimated_value field.

- [ ] **Step 2: Add estimated_value field to LeadForm**

Add to the form schema after the `source` field:

```typescript
  estimated_value: z.number().min(0).optional(),
```

Add to defaultValues:

```typescript
  estimated_value: lead?.estimated_value || 0,
```

Add the input field after the Source dropdown (around the existing field groupings):

```tsx
<div className="space-y-2">
  <Label htmlFor="estimated_value">Estimated Value ($)</Label>
  <Input
    id="estimated_value"
    type="number"
    placeholder="0"
    {...register('estimated_value', { valueAsNumber: true })}
  />
  {errors.estimated_value && (
    <p className="text-sm text-destructive">{errors.estimated_value.message}</p>
  )}
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/leads/components/LeadForm.tsx
git commit -m "feat(leads): add estimated_value field to LeadForm"
```

---

### Task 10: Final Verification and Testing

**Files:**
- All modified files from previous tasks

- [ ] **Step 1: Verify TypeScript compilation**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 2: Verify build (if Node.js 20+ available)**

Run: `cd /Users/bertwinromero/Documents/personal/financial-advisor-crm && npm run build`
Expected: Build completes successfully

- [ ] **Step 3: Visual verification checklist**

If running dev server (`npm run dev`), verify:
- [ ] Pipeline columns show stage name, colored dot, count badge, and volume total
- [ ] Cards show "HIGH SCORE" / "MED SCORE" / "LOW SCORE" label badges
- [ ] Cards display Value and Last Contact rows
- [ ] Cards show next task action indicator when available
- [ ] Closed stage cards have won/lost styling with icons
- [ ] Filter bar shows Advisor and Date Range dropdowns
- [ ] Team avatars display correctly
- [ ] Generate Report button is visible
- [ ] FAB button appears in bottom-right corner
- [ ] Drag and drop still works correctly
- [ ] Three-dot menu appears on card hover

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "feat(pipeline): complete Pipeline UI enhancement matching PRD design"
```

---

## Summary of Changes

| Component | Enhancement |
|-----------|-------------|
| LeadScoreBadge | Added `variant="label"` for PRD-style "HIGH SCORE" pills |
| PipelineCardMenu | New component for three-dot dropdown menu |
| PipelineCard | Rich design with value, last contact, action indicators, closed styling |
| PipelineFilterBar | New component with advisor/date filters, avatars, Generate Report |
| PipelineColumn | Volume totals, count badges, closed stage styling |
| PipelineBoard | Integrated filter bar, FAB button, lead tasks |
| usePipeline | Added filtering, advisors query, lead tasks query |
| LeadForm | Added estimated_value input field |
| Database | Added estimated_value and last_contact_at to leads |
