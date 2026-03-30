import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  Phone,
  Mail,
  LayoutGrid,
  List,
  ChevronRight,
  Users,
  X,
  Edit2,
  Trash2,
  Download
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLeads } from '../hooks/useLeads'
import { usePipelineStages } from '@/features/pipeline/hooks/usePipeline'
import { LeadForm } from './LeadForm'
import { LeadScoreBadge } from './LeadScoreBadge'
import { AdvancedFilters, type LeadFilters } from './AdvancedFilters'
import { ExportLeadsDialog } from './ExportLeadsDialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { supabase } from '@/shared/lib/supabase'
import type { LeadWithStage } from '@/types/database'

type ViewMode = 'card' | 'table'

export function LeadsList() {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<LeadWithStage | null>(null)
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<LeadFilters>({})
  const [isExportOpen, setIsExportOpen] = useState(false)
  const { leads, isLoading, deleteLead } = useLeads()
  const { stages } = usePipelineStages()

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').order('full_name')
      if (error) throw error
      return data
    },
  })

  // Get unique sources from leads
  const sources = [...new Set(leads.map((l) => l.source).filter(Boolean))] as string[]

  // Filter out won/lost leads - show only active pipeline leads
  const activeLeads = leads.filter((lead) => !lead.stage.is_closed)

  const filteredLeads = activeLeads.filter((lead) => {
    // Search filter
    const searchLower = search.toLowerCase()
    const matchesSearch =
      lead.first_name.toLowerCase().includes(searchLower) ||
      lead.last_name.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone?.toLowerCase().includes(searchLower)

    // Stage filter
    const matchesStage = stageFilter === 'all' || lead.stage_id === stageFilter

    // Advanced filters
    let matchesAdvanced = true

    if (advancedFilters.dateFrom) {
      matchesAdvanced = matchesAdvanced && new Date(lead.created_at) >= new Date(advancedFilters.dateFrom)
    }
    if (advancedFilters.dateTo) {
      matchesAdvanced = matchesAdvanced && new Date(lead.created_at) <= new Date(advancedFilters.dateTo)
    }
    if (advancedFilters.assignedTo) {
      if (advancedFilters.assignedTo === 'unassigned') {
        matchesAdvanced = matchesAdvanced && !lead.assigned_to
      } else {
        matchesAdvanced = matchesAdvanced && lead.assigned_to === advancedFilters.assignedTo
      }
    }
    if (advancedFilters.source) {
      matchesAdvanced = matchesAdvanced && lead.source === advancedFilters.source
    }
    if (advancedFilters.scoreMin !== undefined) {
      matchesAdvanced = matchesAdvanced && lead.lead_score >= advancedFilters.scoreMin
    }
    if (advancedFilters.scoreMax !== undefined) {
      matchesAdvanced = matchesAdvanced && lead.lead_score <= advancedFilters.scoreMax
    }
    if (advancedFilters.hasEmail !== undefined) {
      matchesAdvanced = matchesAdvanced && (advancedFilters.hasEmail ? !!lead.email : !lead.email)
    }
    if (advancedFilters.hasPhone !== undefined) {
      matchesAdvanced = matchesAdvanced && (advancedFilters.hasPhone ? !!lead.phone : !lead.phone)
    }

    return matchesSearch && matchesStage && matchesAdvanced
  })

  // Get active stages (non-closed)
  const activeStages = stages.filter((s) => !s.is_closed)

  const handleEdit = (lead: LeadWithStage) => {
    setEditingLead(lead)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingLead(null)
  }

  const handleDelete = async () => {
    if (deletingLeadId) {
      await deleteLead(deletingLeadId)
      setDeletingLeadId(null)
    }
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
    <div className="space-y-6 p-2">
      {/* Stats and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 rounded-xl bg-primary-muted px-4 py-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-2xl font-bold text-primary">{activeLeads.length}</p>
            <p className="text-xs text-muted-foreground">Active Leads</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-xl bg-surface-2 p-1">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              viewMode === 'card'
                ? 'bg-surface-0 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              viewMode === 'table'
                ? 'bg-surface-0 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" />
            Table
          </button>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Filter:
        </span>
        <button
          onClick={() => setStageFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            stageFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface-2 text-muted-foreground hover:text-foreground'
          )}
        >
          All Stages
        </button>
        {activeStages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setStageFilter(stage.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              stageFilter === stage.id
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground'
            )}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: stageFilter === stage.id ? '#fff' : stage.color }}
            />
            {stage.name}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        users={users}
        stages={stages}
        sources={sources}
      />

      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-full"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <EmptyState search={search} stageFilter={stageFilter} />
      ) : viewMode === 'card' ? (
        <CardView leads={filteredLeads} onEdit={handleEdit} onDelete={setDeletingLeadId} />
      ) : (
        <TableView leads={filteredLeads} onEdit={handleEdit} onDelete={setDeletingLeadId} />
      )}

      {/* Add/Edit Lead Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Create Lead'}</DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={editingLead}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingLeadId} onOpenChange={() => setDeletingLeadId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this lead? This will also delete all associated tasks. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingLeadId(null)}>
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

      {/* Export Dialog */}
      <ExportLeadsDialog
        leads={filteredLeads}
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
      />
    </div>
  )
}

function EmptyState({ search, stageFilter }: { search: string; stageFilter: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center rounded-2xl bg-surface-0 shadow-md">
      <div className="h-16 w-16 rounded-full bg-primary-muted flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-lg font-semibold text-foreground">No leads found</p>
      <p className="text-sm text-muted-foreground mt-1">
        {search
          ? 'Try a different search term.'
          : stageFilter !== 'all'
          ? 'No leads in this stage.'
          : 'Create your first lead to get started.'}
      </p>
    </div>
  )
}

function CardView({
  leads,
  onEdit,
  onDelete,
}: {
  leads: LeadWithStage[]
  onEdit: (lead: LeadWithStage) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="rounded-2xl bg-surface-0 shadow-md p-5 transition-all duration-200 hover:shadow-lg group"
        >
          <div className="flex items-start justify-between">
            <Link to={`/leads/${lead.id}`} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted">
                <span className="text-sm font-bold text-primary">
                  {lead.first_name[0]}
                  {lead.last_name[0]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                  {lead.first_name} {lead.last_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: `${lead.stage.color}20`,
                      color: lead.stage.color,
                    }}
                  >
                    {lead.stage.name}
                  </span>
                  <LeadScoreBadge score={lead.lead_score} size="sm" />
                </div>
              </div>
            </Link>
            {/* Action buttons - visible on hover */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(lead)}
                className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => onDelete(lead.id)}
                className="p-2 rounded-lg hover:bg-destructive-muted transition-colors"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {lead.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-surface-2">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-surface-2">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>{lead.phone}</span>
              </div>
            )}
          </div>

          <p
            className="text-xs text-muted-foreground mt-4 pt-4"
            style={{ borderTop: '1px solid var(--color-surface-3)' }}
          >
            Created {format(new Date(lead.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      ))}
    </div>
  )
}

function TableView({
  leads,
  onEdit,
  onDelete,
}: {
  leads: LeadWithStage[]
  onEdit: (lead: LeadWithStage) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="rounded-2xl bg-surface-0 shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Lead
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Contact
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                Stage
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                Source
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                Score
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                Created
              </th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-surface-1 transition-colors duration-150 group"
              >
                <td className="px-6 py-4">
                  <Link to={`/leads/${lead.id}`} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {lead.first_name[0]}
                        {lead.last_name[0]}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground hover:text-primary transition-colors">
                      {lead.first_name} {lead.last_name}
                    </p>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[200px]">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span
                    className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: `${lead.stage.color}20`,
                      color: lead.stage.color,
                    }}
                  >
                    {lead.stage.name}
                  </span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <p className="text-sm text-muted-foreground">{lead.source || '—'}</p>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <LeadScoreBadge score={lead.lead_score} size="sm" />
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                      title="Edit lead"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="p-2 rounded-lg hover:bg-destructive-muted transition-colors"
                      title="Delete lead"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                    <Link
                      to={`/leads/${lead.id}`}
                      className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                      title="View details"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
