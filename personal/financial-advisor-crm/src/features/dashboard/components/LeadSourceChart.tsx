import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
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

interface SourceData {
  source: string
  count: number
  percentage: number
  color: string
}

export function LeadSourceChart({ leads }: LeadSourceChartProps) {
  const sourceData = useMemo(() => {
    const sourceCounts: Record<string, number> = {}

    leads.forEach((lead) => {
      const source = (lead.source || 'other').toLowerCase()
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })

    const total = leads.length
    const data: SourceData[] = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: sourceColors[source] || sourceColors.other,
      }))
      .sort((a, b) => b.count - a.count)

    return data
  }, [leads])

  const totalLeads = leads.length

  // Calculate SVG circle segments
  const segments = useMemo(() => {
    const circumference = 2 * Math.PI * 40 // radius = 40
    let offset = 0

    return sourceData.map((item) => {
      const segmentLength = (item.percentage / 100) * circumference
      const dashArray = `${segmentLength} ${circumference - segmentLength}`
      const dashOffset = -offset
      offset += segmentLength

      return {
        ...item,
        dashArray,
        dashOffset,
      }
    })
  }, [sourceData])

  const topSources = sourceData.slice(0, 5)

  const capitalize = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (totalLeads === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No leads to display</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* Donut Chart */}
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-surface-2"
              />
              {/* Segments */}
              {segments.map((segment, index) => (
                <circle
                  key={segment.source}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="12"
                  strokeDasharray={segment.dashArray}
                  strokeDashoffset={segment.dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  style={{ opacity: 1 - index * 0.05 }}
                />
              ))}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Manrope] text-2xl font-bold text-foreground">
                {totalLeads}
              </span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {topSources.map((item) => (
              <div key={item.source} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-sm text-foreground">
                  {capitalize(item.source)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.count}
                </span>
                <span className="w-12 text-right text-sm text-muted-foreground">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
