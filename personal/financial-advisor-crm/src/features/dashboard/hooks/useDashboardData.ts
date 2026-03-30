import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, endOfDay } from 'date-fns'
import { supabase } from '@/shared/lib/supabase'
import type { TaskWithLead, ActivityLog, LeadWithStage } from '@/types/database'

export function useDashboardData() {
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)
  const dayEnd = endOfDay(today)

  // Today's tasks
  const tasksQuery = useQuery({
    queryKey: ['dashboard', 'tasks'],
    queryFn: async (): Promise<TaskWithLead[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, lead:leads(*)')
        .lte('due_date', dayEnd.toISOString())
        .eq('status', 'pending')
        .order('due_date', { ascending: true })

      if (error) throw error
      return data as unknown as TaskWithLead[]
    },
  })

  // Stats
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Leads this week
      const { count: leadsThisWeek } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())

      // Conversions (leads in won stages)
      const { data: wonStages } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('is_won', true)

      const wonStageIds = wonStages?.map((s) => s.id) || []

      const { count: conversions } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('stage_id', wonStageIds)
        .gte('updated_at', weekStart.toISOString())

      // Pending tasks
      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Completed tasks this week
      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done')
        .gte('created_at', weekStart.toISOString())

      return {
        leadsThisWeek: leadsThisWeek || 0,
        conversions: conversions || 0,
        pendingTasks: pendingTasks || 0,
        completedTasks: completedTasks || 0,
      }
    },
  })

  // Recent activity
  const activitiesQuery = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: async (): Promise<ActivityLog[]> => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
  })

  // All leads for source chart
  const leadsQuery = useQuery({
    queryKey: ['dashboard', 'leads'],
    queryFn: async (): Promise<LeadWithStage[]> => {
      const { data, error } = await supabase
        .from('leads')
        .select('*, stage:pipeline_stages(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as LeadWithStage[]
    },
  })

  return {
    tasks: tasksQuery.data || [],
    stats: statsQuery.data || {
      leadsThisWeek: 0,
      conversions: 0,
      pendingTasks: 0,
      completedTasks: 0,
    },
    activities: activitiesQuery.data || [],
    leads: leadsQuery.data || [],
    isLoading: tasksQuery.isLoading || statsQuery.isLoading || activitiesQuery.isLoading || leadsQuery.isLoading,
  }
}
