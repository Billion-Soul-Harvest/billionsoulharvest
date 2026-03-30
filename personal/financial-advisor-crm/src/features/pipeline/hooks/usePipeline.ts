import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import type {
  PipelineStage,
  PipelineStageInsert,
  PipelineStageUpdate,
  LeadWithStage,
  User,
  Task,
} from '@/types/database'

export function usePipelineStages() {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()

  const stagesQuery = useQuery({
    queryKey: ['pipeline', 'stages'],
    queryFn: async (): Promise<PipelineStage[]> => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const createStageMutation = useMutation({
    mutationFn: async (stage: Omit<PipelineStageInsert, 'organization_id'>) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({
          ...stage,
          organization_id: user.organization_id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, ...updates }: PipelineStageUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const deleteStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipeline_stages').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  const reorderStagesMutation = useMutation({
    mutationFn: async (stages: { id: string; position: number }[]) => {
      for (const stage of stages) {
        await supabase
          .from('pipeline_stages')
          .update({ position: stage.position })
          .eq('id', stage.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })

  return {
    stages: stagesQuery.data || [],
    isLoading: stagesQuery.isLoading,
    createStage: createStageMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    deleteStage: deleteStageMutation.mutateAsync,
    reorderStages: reorderStagesMutation.mutateAsync,
  }
}

interface UsePipelineLeadsOptions {
  advisorId?: string
  dateRange?: string
}

export function usePipelineLeads(options: UsePipelineLeadsOptions = {}) {
  const { advisorId, dateRange } = options
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()

  const leadsQuery = useQuery({
    queryKey: ['pipeline', 'leads', advisorId, dateRange],
    queryFn: async (): Promise<LeadWithStage[]> => {
      let query = supabase
        .from('leads')
        .select('*, stage:pipeline_stages(*), assigned_user:users(*)')
        .order('created_at', { ascending: false })

      // Filter by advisor
      if (advisorId && advisorId !== 'all') {
        query = query.eq('assigned_to', advisorId)
      }

      // Filter by date range
      if (dateRange && dateRange !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (dateRange) {
          case 'last_30':
            startDate = new Date(now.setDate(now.getDate() - 30))
            break
          case 'this_quarter': {
            const quarter = Math.floor(new Date().getMonth() / 3)
            startDate = new Date(new Date().getFullYear(), quarter * 3, 1)
            break
          }
          case 'this_year':
            startDate = new Date(new Date().getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(0)
        }

        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data as unknown as LeadWithStage[]
    },
    enabled: !!user,
  })

  const moveLeadMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ stage_id: stageId })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      if (user) {
        const { data: stage } = await supabase
          .from('pipeline_stages')
          .select('name')
          .eq('id', stageId)
          .single()

        await supabase.from('activity_logs').insert({
          organization_id: user.organization_id,
          lead_id: leadId,
          user_id: user.id,
          action_type: 'stage_changed',
          description: `Moved lead to ${stage?.name}`,
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    moveLead: moveLeadMutation.mutateAsync,
  }
}

export function usePipelineAdvisors() {
  const { data: user } = useCurrentUser()

  const advisorsQuery = useQuery({
    queryKey: ['pipeline', 'advisors'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return {
    advisors: advisorsQuery.data || [],
    isLoading: advisorsQuery.isLoading,
  }
}

export function useLeadTasks(leadIds: string[]) {
  const { data: user } = useCurrentUser()

  const tasksQuery = useQuery({
    queryKey: ['pipeline', 'lead-tasks', leadIds],
    queryFn: async (): Promise<Record<string, Task | undefined>> => {
      if (leadIds.length === 0) return {}

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('lead_id', leadIds)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })

      if (error) throw error

      // Group by lead_id and take the first (soonest) task per lead
      const tasksByLead: Record<string, Task | undefined> = {}
      for (const task of data) {
        if (task.lead_id && !tasksByLead[task.lead_id]) {
          tasksByLead[task.lead_id] = task as Task
        }
      }

      return tasksByLead
    },
    enabled: !!user && leadIds.length > 0,
  })

  return {
    tasksByLead: tasksQuery.data || {},
    isLoading: tasksQuery.isLoading,
  }
}
