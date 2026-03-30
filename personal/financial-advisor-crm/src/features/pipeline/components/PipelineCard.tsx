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
