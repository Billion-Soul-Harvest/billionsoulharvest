import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useLeads } from '../hooks/useLeads'
import { usePipelineStages } from '@/features/pipeline/hooks/usePipeline'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { LeadWithStage } from '@/types/database'

const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  source: z.string().optional(),
  estimated_value: z.number().min(0).optional(),
  financial_goals: z.string().optional(),
  notes: z.string().optional(),
  stage_id: z.string().min(1, 'Stage is required'),
  assigned_to: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  lead?: LeadWithStage | null
  onSuccess: () => void
  onCancel?: () => void
}

export function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const { createLead, updateLead } = useLeads()
  const { stages } = usePipelineStages()

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name')
      if (error) throw error
      return data
    },
  })

  const defaultStage = stages.find((s) => s.position === 1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email || '',
          phone: lead.phone || '',
          date_of_birth: lead.date_of_birth || '',
          source: lead.source || '',
          estimated_value: lead.estimated_value || 0,
          financial_goals: lead.financial_goals || '',
          notes: lead.notes || '',
          stage_id: lead.stage_id,
          assigned_to: lead.assigned_to || undefined,
        }
      : {
          stage_id: defaultStage?.id,
          estimated_value: 0,
        },
  })

  const onSubmit = async (data: LeadFormData) => {
    const leadData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      source: data.source || null,
      estimated_value: data.estimated_value || 0,
      financial_goals: data.financial_goals || null,
      notes: data.notes || null,
      assigned_to: data.assigned_to || null,
    }

    if (lead) {
      await updateLead({ id: lead.id, ...leadData })
    } else {
      await createLead(leadData)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            placeholder="John"
            {...register('first_name')}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            placeholder="Smith"
            {...register('last_name')}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="(555) 123-4567"
            {...register('phone')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="Referral, Website, etc."
            {...register('source')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_value">Estimated Value ($)</Label>
        <Input
          id="estimated_value"
          type="number"
          placeholder="0"
          {...register('estimated_value', { valueAsNumber: true })}
        />
        {errors.estimated_value && (
          <p className="text-sm text-destructive">{errors.estimated_value.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stage_id">Pipeline Stage *</Label>
        <select
          id="stage_id"
          {...register('stage_id')}
          className="w-full rounded-lg bg-surface-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-0"
        >
          <option value="">Select a stage</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
        {errors.stage_id && (
          <p className="text-sm text-destructive">{errors.stage_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assigned To</Label>
        <Select
          value={watch('assigned_to') || 'unassigned'}
          onValueChange={(value) => setValue('assigned_to', value === 'unassigned' ? undefined : value)}
        >
          <SelectTrigger id="assigned_to">
            <SelectValue placeholder="Select advisor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="financial_goals">Financial Goals</Label>
        <Textarea
          id="financial_goals"
          placeholder="Retirement planning, investment goals, etc."
          rows={3}
          {...register('financial_goals')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes about this lead..."
          rows={3}
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  )
}
