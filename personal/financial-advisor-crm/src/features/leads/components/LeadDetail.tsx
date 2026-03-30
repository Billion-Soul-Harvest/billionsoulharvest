import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Target,
  Trash2,
  Plus,
  Edit2,
  User,
  FileText,
  CheckSquare,
  Clock
} from 'lucide-react'
import { useLead, useLeads } from '../hooks/useLeads'
import { useLeadActivities } from '../hooks/useLeadActivities'
import { usePipelineStages } from '@/features/pipeline/hooks/usePipeline'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { LeadForm } from './LeadForm'
import { ActivityTimeline } from './ActivityTimeline'
import { LogActivityDialog } from './LogActivityDialog'
import { LeadScoreBadge } from './LeadScoreBadge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'

export function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: lead, isLoading } = useLead(id!)
  const { updateLead, deleteLead } = useLeads()
  const { stages } = usePipelineStages()
  const { tasks, toggleTaskStatus } = useTasks('all')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [activityDialogTab, setActivityDialogTab] = useState<'call' | 'email' | 'meeting' | 'note'>('call')
  const { activities, isLoading: activitiesLoading } = useLeadActivities(id!)

  const leadTasks = tasks.filter((t) => t.lead_id === id)
  const pendingTasks = leadTasks.filter((t) => t.status === 'pending')
  const completedTasks = leadTasks.filter((t) => t.status === 'done')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="h-10 w-10 animate-spin rounded-full bg-primary shadow-lg"
          style={{
            clipPath:
              'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 15%, 85% 15%, 85% 85%, 50% 85%)',
          }}
        />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl bg-surface-2">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground">Lead not found</p>
        <Button variant="link" onClick={() => navigate('/leads')}>
          Back to Leads
        </Button>
      </div>
    )
  }

  const handleStageChange = async (stageId: string) => {
    await updateLead({ id: lead.id, stage_id: stageId })
  }

  const handleDelete = async () => {
    await deleteLead(lead.id)
    navigate('/leads')
  }

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-primary-muted flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {lead.first_name[0]}{lead.last_name[0]}
              </span>
            </div>
            <div>
              <h1 className="font-[Manrope] text-2xl font-bold text-primary">
                {lead.first_name} {lead.last_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Added {format(new Date(lead.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
            <LeadScoreBadge
              score={lead.lead_score}
              scoreFactors={lead.score_factors}
              size="lg"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
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
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="outline"
            onClick={() => setIsEditFormOpen(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="gap-2 text-destructive hover:bg-destructive-muted hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="rounded-2xl bg-surface-0 shadow-sm p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {lead.email && (
                <div className="rounded-xl bg-surface-2 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                  </div>
                  <a href={`mailto:${lead.email}`} className="text-primary font-medium hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="rounded-xl bg-surface-2 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Phone</span>
                  </div>
                  <a href={`tel:${lead.phone}`} className="text-primary font-medium hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.date_of_birth && (
                <div className="rounded-xl bg-surface-2 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Date of Birth</span>
                  </div>
                  <p className="font-medium">{format(new Date(lead.date_of_birth), 'MMMM d, yyyy')}</p>
                </div>
              )}
              {lead.source && (
                <div className="rounded-xl bg-surface-2 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Source</span>
                  </div>
                  <p className="font-medium">{lead.source}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Goals */}
          {lead.financial_goals && (
            <div className="rounded-2xl bg-surface-0 shadow-sm p-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Financial Goals
              </h2>
              <p className="text-foreground whitespace-pre-wrap">{lead.financial_goals}</p>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="rounded-2xl bg-surface-0 shadow-sm p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <FileText className="h-4 w-4" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Notes</h2>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Tasks */}
          <div className="rounded-2xl bg-surface-0 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Tasks ({leadTasks.length})
              </h2>
              <Button size="sm" onClick={() => setIsTaskFormOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {leadTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No tasks for this lead</p>
                <Button
                  variant="link"
                  onClick={() => setIsTaskFormOpen(true)}
                  className="mt-2"
                >
                  Create the first task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Pending Tasks */}
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer group"
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                  >
                    <div className="w-5 h-5 rounded-md bg-surface-0 group-hover:bg-surface-2 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Due {format(new Date(task.due_date), 'MMM d, h:mm a')}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
                            task.priority === 'high'
                              ? 'bg-destructive-muted text-destructive'
                              : task.priority === 'medium'
                              ? 'bg-accent-muted text-accent'
                              : 'bg-surface-3 text-muted-foreground'
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <>
                    <div className="pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Completed ({completedTasks.length})
                      </p>
                    </div>
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-surface-2/50 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                      >
                        <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center">
                          <CheckSquare className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-through">{task.title}</p>
                          <span className="text-xs text-muted-foreground">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pipeline Stage */}
          <div className="rounded-2xl bg-surface-0 shadow-sm p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Pipeline Stage
            </h2>
            <div className="space-y-2">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                    lead.stage_id === stage.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-2 hover:bg-surface-3'
                  )}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: lead.stage_id === stage.id ? '#fff' : stage.color,
                    }}
                  />
                  <span className="font-medium text-sm">{stage.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl bg-primary p-6 text-white">
            <h3 className="font-bold mb-4">Lead Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm opacity-70">Pending Tasks</span>
                <span className="font-bold">{pendingTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-70">Completed Tasks</span>
                <span className="font-bold">{completedTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-70">Days in Pipeline</span>
                <span className="font-bold">
                  {differenceInDays(new Date(), new Date(lead.created_at))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={lead}
            onSuccess={() => setIsEditFormOpen(false)}
            onCancel={() => setIsEditFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Task for {lead.first_name}</DialogTitle>
          </DialogHeader>
          <TaskForm leadId={lead.id} onSuccess={() => setIsTaskFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete {lead.first_name} {lead.last_name}? This will also delete all associated tasks. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Activity Dialog */}
      <LogActivityDialog
        leadId={lead.id}
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        defaultTab={activityDialogTab}
      />
    </div>
  )
}
