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
