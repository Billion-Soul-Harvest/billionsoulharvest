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
