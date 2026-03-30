import { useState, useMemo } from 'react'
import { format, isPast, isToday, isTomorrow, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import {
  Plus,
  CheckSquare,
  UserPlus,
  CalendarDays,
  AlertTriangle,
  Gift,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  X,
  Search,
  Trash2,
  Edit2,
  Check
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { TaskForm } from './TaskForm'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import type { TaskWithLead } from '@/types/database'

type TaskFilter = 'all' | 'high_priority' | 'follow_ups' | 'renewals' | 'completed'
type ViewMode = 'today' | 'calendar'

const taskTypeStyles: Record<string, { bg: string; text: string; label: string }> = {
  follow_up: { bg: 'bg-primary-muted', text: 'text-primary', label: 'Follow-up' },
  renewal: { bg: 'bg-secondary-muted', text: 'text-secondary', label: 'Renewal' },
  consultation: { bg: 'bg-accent-muted', text: 'text-accent', label: 'Consultation' },
  document: { bg: 'bg-surface-3', text: 'text-muted-foreground', label: 'Document' },
  review: { bg: 'bg-primary-muted', text: 'text-primary', label: 'Review' },
  meeting: { bg: 'bg-secondary-muted', text: 'text-secondary', label: 'Meeting' },
  other: { bg: 'bg-surface-3', text: 'text-muted-foreground', label: 'Task' },
}

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-destructive-muted', text: 'text-destructive', label: 'Urgent' },
  medium: { bg: 'bg-accent-muted', text: 'text-accent', label: 'Medium' },
  low: { bg: 'bg-surface-3', text: 'text-muted-foreground', label: 'Low' },
}

export function TasksList() {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithLead | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([])
  const { tasks, isLoading, toggleTaskStatus, deleteTask } = useTasks('all')

  // Filter tasks based on current filter and search
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Status filter
    if (filter === 'completed') {
      result = result.filter(t => t.status === 'done')
    } else {
      result = result.filter(t => t.status === 'pending')
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.lead?.first_name.toLowerCase().includes(query) ||
          task.lead?.last_name.toLowerCase().includes(query)
      )
    }

    // Category filter
    switch (filter) {
      case 'high_priority':
        result = result.filter((t) => t.priority === 'high')
        break
      case 'follow_ups':
        result = result.filter((t) => t.task_type === 'follow_up')
        break
      case 'renewals':
        result = result.filter((t) => t.task_type === 'renewal')
        break
    }

    return result
  }, [tasks, filter, searchQuery])

  // Group tasks by section
  const groupedTasks = useMemo(() => {
    const pendingTasks = filteredTasks.filter(t => t.status === 'pending')

    const highPriorityToday = pendingTasks.filter(
      (t) => t.priority === 'high' && (isToday(new Date(t.due_date)) || isPast(new Date(t.due_date)))
    )
    const upcomingRenewals = pendingTasks.filter(
      (t) => t.task_type === 'renewal' && !isPast(new Date(t.due_date))
    )
    const overdue = pendingTasks.filter(
      (t) => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
    )
    const todayTasks = pendingTasks.filter((t) => isToday(new Date(t.due_date)))
    const upcomingTasks = pendingTasks.filter(
      (t) => !isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
    )
    const completedTasks = filteredTasks.filter(t => t.status === 'done')

    return { highPriorityToday, upcomingRenewals, overdue, todayTasks, upcomingTasks, completedTasks }
  }, [filteredTasks])

  // Calendar week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 })
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [selectedDate])

  // Calendar events for selected date
  const calendarEvents = useMemo(() => {
    return tasks.filter((t) => {
      const taskDate = new Date(t.due_date)
      return isSameDay(taskDate, selectedDate)
    })
  }, [tasks, selectedDate])

  // Get task count for a specific day (for calendar dots)
  const getTaskCountForDay = (day: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.due_date), day) && t.status === 'pending').length
  }

  // Active task count
  const activeCount = tasks.filter((t) => t.status === 'pending').length

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (deletingTaskId) {
      await deleteTask(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  // Handle edit
  const handleEditTask = (task: TaskWithLead) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  // Dismiss reminder
  const dismissReminder = (id: string) => {
    setDismissedReminders(prev => [...prev, id])
  }

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

  return (
    <div className="space-y-8 p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-[Manrope] text-3xl font-extrabold text-primary tracking-tight">
            Task & Reminder Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing {activeCount} active priorities for your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-xl bg-surface-2 p-1">
            <button
              onClick={() => setViewMode('today')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                viewMode === 'today'
                  ? 'bg-surface-0 text-primary shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                viewMode === 'calendar'
                  ? 'bg-surface-0 text-primary shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Calendar
            </button>
          </div>
          {/* New Consultation Button */}
          <Button
            onClick={() => {
              setEditingTask(null)
              setIsFormOpen(true)
            }}
            className="gap-2 bg-surface-0 text-primary hover:bg-surface-2 shadow-sm"
            style={{ border: '1px solid var(--color-primary)' }}
          >
            <CalendarDays className="h-4 w-4" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks or clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 rounded-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tasks Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Filter
            </span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Tasks' },
                { value: 'high_priority', label: 'High Priority' },
                { value: 'follow_ups', label: 'Follow-ups' },
                { value: 'renewals', label: 'Renewals' },
                { value: 'completed', label: 'Completed' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as TaskFilter)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                    filter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-surface-0 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-surface-0 transition-colors">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-0 transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="rounded-2xl bg-surface-0 p-6 shadow-sm">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="font-bold text-lg">
                  {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                </h3>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day) => {
                  const taskCount = getTaskCountForDay(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'flex flex-col items-center p-3 rounded-xl transition-all',
                        isSelected
                          ? 'bg-primary text-white'
                          : isCurrentDay
                          ? 'bg-secondary-muted'
                          : 'hover:bg-surface-2'
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase">
                        {format(day, 'EEE')}
                      </span>
                      <span className="text-lg font-bold mt-1">
                        {format(day, 'd')}
                      </span>
                      {taskCount > 0 && (
                        <div className={cn(
                          'flex gap-0.5 mt-1',
                        )}>
                          {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isSelected ? 'bg-white' : 'bg-primary'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected Day Tasks */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h4>
                {calendarEvents.length > 0 ? (
                  calendarEvents.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTaskStatus(task.id, task.status)}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => setDeletingTaskId(task.id)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    No tasks scheduled for this day
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Today View - Task Sections */}
          {viewMode === 'today' && (
            <>
              {/* Completed Tasks Section */}
              {filter === 'completed' && groupedTasks.completedTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                    Completed Tasks ({groupedTasks.completedTasks.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedTasks.completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTaskStatus(task.id, task.status)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => setDeletingTaskId(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* High Priority Today Section */}
              {filter !== 'completed' && groupedTasks.highPriorityToday.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    High Priority Today
                  </h2>
                  <div className="space-y-3">
                    {groupedTasks.highPriorityToday.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTaskStatus(task.id, task.status)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => setDeletingTaskId(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue Section */}
              {filter !== 'completed' && groupedTasks.overdue.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-destructive">
                    Overdue ({groupedTasks.overdue.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedTasks.overdue.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isOverdue
                        onToggle={() => toggleTaskStatus(task.id, task.status)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => setDeletingTaskId(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Renewals Section */}
              {filter !== 'completed' && groupedTasks.upcomingRenewals.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Upcoming Renewals
                  </h2>
                  <div className="space-y-3">
                    {groupedTasks.upcomingRenewals.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTaskStatus(task.id, task.status)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => setDeletingTaskId(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Upcoming Tasks */}
              {filter !== 'completed' && groupedTasks.upcomingTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Upcoming
                  </h2>
                  <div className="space-y-3">
                    {groupedTasks.upcomingTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTaskStatus(task.id, task.status)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => setDeletingTaskId(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center rounded-2xl bg-surface-2">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">No tasks found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery
                      ? 'Try adjusting your search'
                      : filter === 'completed'
                      ? 'No completed tasks yet'
                      : filter !== 'all'
                      ? 'Try selecting a different filter'
                      : "You're all caught up!"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar View */}
          <div className="rounded-2xl bg-primary text-white overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Calendar View
                </div>
                <div className="text-xl font-bold mt-1">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {calendarEvents.length > 0 ? (
                calendarEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEditTask(event)}
                    className="flex gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold opacity-70 w-12">
                      {format(new Date(event.due_date), 'HH:mm')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{event.title}</div>
                      <div className="text-xs opacity-70 truncate">
                        {event.description || 'No description'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm opacity-70">
                  No events scheduled for this day
                </div>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className="rounded-2xl bg-surface-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Reminders
              </h3>
              <button
                onClick={() => setDismissedReminders(groupedTasks.overdue.map(t => t.id))}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-4">
              {/* Overdue Premium Alert */}
              {groupedTasks.overdue.length > 0 && !dismissedReminders.includes('overdue-alert') && (
                <div className="rounded-xl bg-surface-0 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive-muted flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-destructive">
                        Overdue Tasks Alert
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {groupedTasks.overdue.length} task(s) require immediate attention.
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="text-xs bg-secondary hover:bg-secondary/90"
                          onClick={() => setFilter('all')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          View Tasks
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => dismissReminder('overdue-alert')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Anniversary */}
              {!dismissedReminders.includes('anniversary-alert') && (
                <div className="rounded-xl bg-surface-0 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
                      <Gift className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-accent">Client Anniversary</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Sarah & John Wu celebrate 10 years with the firm today.
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="text-xs bg-secondary hover:bg-secondary/90"
                          onClick={() => {
                            setEditingTask(null)
                            setIsFormOpen(true)
                          }}
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Create Task
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => dismissReminder('anniversary-alert')}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Dismissed */}
              {dismissedReminders.includes('overdue-alert') && dismissedReminders.includes('anniversary-alert') && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active reminders
                </p>
              )}
            </div>
          </div>

          {/* Assistant Delegation */}
          <div className="rounded-2xl bg-primary p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Task Summary</h3>
                <p className="text-xs opacity-70 mt-1">
                  {activeCount} pending, {tasks.filter(t => t.status === 'done').length} completed
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="opacity-70">High Priority:</span>
                  <span className="font-bold ml-1">{tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}</span>
                </div>
                <div>
                  <span className="opacity-70">Overdue:</span>
                  <span className="font-bold ml-1">{groupedTasks.overdue.length}</span>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white text-xs"
                onClick={() => setFilter('completed')}
              >
                View Completed
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => {
          setEditingTask(null)
          setIsFormOpen(true)
        }}
        className="fixed bottom-6 left-6 md:left-72 h-12 px-6 rounded-xl shadow-lg gap-2 bg-secondary hover:bg-[#058a52] text-white"
      >
        <Plus className="h-5 w-5" />
        New Entry
      </Button>

      {/* Add/Edit Task Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTaskId} onOpenChange={() => setDeletingTaskId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingTaskId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTask}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TaskCard({
  task,
  isOverdue = false,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: TaskWithLead
  isOverdue?: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const taskStyle = taskTypeStyles[task.task_type || 'other'] || taskTypeStyles.other
  const priorityStyle = priorityStyles[task.priority]
  const dueDate = new Date(task.due_date)
  const isCompleted = task.status === 'done'

  const getDueLabel = () => {
    if (isPast(dueDate) && !isToday(dueDate) && !isCompleted) {
      const days = Math.abs(differenceInDays(dueDate, new Date()))
      return `${days} day${days > 1 ? 's' : ''} overdue`
    }
    if (isToday(dueDate)) {
      return `Due ${format(dueDate, 'h:mm a')}`
    }
    if (isTomorrow(dueDate)) {
      return `Due Tomorrow ${format(dueDate, 'h:mm a')}`
    }
    return `Due ${format(dueDate, 'EEE, MMM d')}`
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-0 p-5 shadow-sm hover:shadow-md transition-all duration-200 group',
        isOverdue && 'ring-1 ring-destructive/20',
        isCompleted && 'opacity-75'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'mt-1 shrink-0 w-5 h-5 rounded-md transition-colors flex items-center justify-center',
            isCompleted
              ? 'bg-secondary text-white'
              : 'bg-surface-2 hover:bg-surface-3'
          )}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Priority Badge */}
            {task.priority === 'high' && !isCompleted && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                  priorityStyle.bg,
                  priorityStyle.text
                )}
              >
                {priorityStyle.label}
              </span>
            )}
            {/* Task Type Badge */}
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                taskStyle.bg,
                taskStyle.text
              )}
            >
              {taskStyle.label}
            </span>
            {/* Due Time */}
            <span className={cn(
              'text-xs',
              isOverdue && !isCompleted ? 'text-destructive font-semibold' : 'text-muted-foreground'
            )}>
              {getDueLabel()}
            </span>
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-bold text-primary',
            isCompleted && 'line-through opacity-50'
          )}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Client Link */}
          {task.lead && (
            <p className="text-xs text-primary mt-2">
              Client: {task.lead.first_name} {task.lead.last_name}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
            title="Edit task"
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-destructive-muted transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  )
}
