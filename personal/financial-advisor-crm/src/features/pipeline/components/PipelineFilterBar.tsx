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
