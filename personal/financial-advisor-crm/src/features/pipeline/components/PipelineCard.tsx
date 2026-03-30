import { Link } from 'react-router-dom'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, GripVertical, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { LeadScoreBadge } from '@/features/leads/components/LeadScoreBadge'
import type { LeadWithStage } from '@/types/database'

interface PipelineCardProps {
  lead: LeadWithStage
  isDragging?: boolean
}

export function PipelineCard({ lead, isDragging = false }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const daysInStage = formatDistanceToNow(new Date(lead.updated_at), { addSuffix: false })

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'rounded-xl bg-surface-0 shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg',
          isDragging && 'opacity-50 shadow-xl scale-105'
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 mt-0.5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 cursor-grab transition-colors"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={`/leads/${lead.id}`}
                  className="font-semibold text-foreground hover:text-primary block truncate transition-colors"
                >
                  {lead.first_name} {lead.last_name}
                </Link>
                <LeadScoreBadge score={lead.lead_score} size="sm" />
              </div>

              <div className="mt-3 space-y-2">
                {lead.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center h-5 w-5 rounded-md bg-surface-2">
                      <Mail className="h-3 w-3" />
                    </div>
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center h-5 w-5 rounded-md bg-surface-2">
                      <Phone className="h-3 w-3" />
                    </div>
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{daysInStage} in stage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
