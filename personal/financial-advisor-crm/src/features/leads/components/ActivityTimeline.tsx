import { format, formatDistanceToNow } from 'date-fns'
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
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
        {activities.map((activity) => {
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
                        {'duration' in metadata && metadata.duration != null && (
                          <span className="text-xs bg-surface-2 px-2 py-0.5 rounded">
                            Duration: {`${metadata.duration}`}min
                          </span>
                        )}
                        {'outcome' in metadata && metadata.outcome != null && (
                          <span className="text-xs bg-surface-2 px-2 py-0.5 rounded">
                            Outcome: {`${metadata.outcome}`}
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
