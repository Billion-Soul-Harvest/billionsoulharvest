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
