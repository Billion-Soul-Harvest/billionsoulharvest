import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import type { LeadActivityInsert, LeadActivityWithUser } from '@/types/database'

export function useLeadActivities(leadId: string) {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()

  const activitiesQuery = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async (): Promise<LeadActivityWithUser[]> => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*, user:users(*)')
        .eq('lead_id', leadId)
        .order('occurred_at', { ascending: false })

      if (error) throw error
      return data as unknown as LeadActivityWithUser[]
    },
    enabled: !!user && !!leadId,
  })

  const createActivityMutation = useMutation({
    mutationFn: async (
      activity: Omit<LeadActivityInsert, 'organization_id' | 'lead_id' | 'user_id'>
    ) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          ...activity,
          organization_id: user.organization_id,
          lead_id: leadId,
          user_id: user.id,
        })
        .select('*, user:users(*)')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const logCall = (data: {
    subject: string
    description?: string
    duration?: number
    outcome?: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'call',
      subject: data.subject,
      description: data.description,
      metadata: {
        duration: data.duration,
        outcome: data.outcome,
      },
    })
  }

  const logEmail = (data: {
    subject: string
    description?: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'email',
      subject: data.subject,
      description: data.description,
    })
  }

  const logMeeting = (data: {
    subject: string
    description?: string
    attendees?: string[]
    outcome?: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'meeting',
      subject: data.subject,
      description: data.description,
      metadata: {
        attendees: data.attendees,
        outcome: data.outcome,
      },
    })
  }

  const logNote = (data: {
    description: string
  }) => {
    return createActivityMutation.mutateAsync({
      activity_type: 'note',
      description: data.description,
    })
  }

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    logCall,
    logEmail,
    logMeeting,
    logNote,
    createActivity: createActivityMutation.mutateAsync,
    isCreating: createActivityMutation.isPending,
  }
}
