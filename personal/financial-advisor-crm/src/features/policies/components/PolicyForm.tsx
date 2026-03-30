import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useLeads } from '@/features/leads/hooks/useLeads'
import { usePolicies } from '../hooks/usePolicies'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { RidersEditor } from './RidersEditor'
import type { Policy, PolicyRiders } from '@/types/database'

const policySchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  policy_type: z.enum(['life_insurance', 'annuity', 'ltc', 'health', 'disability', 'other']),
  policy_name: z.string().min(1, 'Policy name is required'),
  policy_number: z.string().optional(),
  carrier: z.string().min(1, 'Carrier is required'),
  status: z.enum(['active', 'pending', 'grace_period', 'lapsed', 'cancelled', 'matured']),
  effective_date: z.string().min(1, 'Effective date is required'),
  renewal_date: z.string().optional(),
  premium_amount: z.number().min(0, 'Premium must be positive'),
  premium_frequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'single_premium']),
  coverage_amount: z.number().optional(),
  fund_value: z.number().min(0).optional(),
  fund_value_date: z.string().optional(),
  riders: z.record(z.any()).optional(),
  beneficiary_name: z.string().optional(),
  beneficiary_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

type PolicyFormData = z.infer<typeof policySchema>

interface PolicyFormProps {
  policy?: Policy
  onSuccess: () => void
  onCancel: () => void
}

export function PolicyForm({ policy, onSuccess, onCancel }: PolicyFormProps) {
  const { leads } = useLeads()
  const { createPolicy, updatePolicy } = usePolicies()
  const { data: currentUser } = useCurrentUser()

  // Only show clients (won leads)
  const clients = leads.filter((lead) => lead.stage.is_won)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: policy
      ? {
          client_id: policy.client_id,
          policy_type: policy.policy_type,
          policy_name: policy.policy_name,
          policy_number: policy.policy_number || '',
          carrier: policy.carrier,
          status: policy.status,
          effective_date: policy.effective_date,
          renewal_date: policy.renewal_date || '',
          premium_amount: policy.premium_amount,
          premium_frequency: policy.premium_frequency,
          coverage_amount: policy.coverage_amount || undefined,
          fund_value: policy.fund_value || 0,
          fund_value_date: policy.fund_value_date || '',
          riders: (policy.riders as PolicyRiders) || {},
          notes: policy.notes || '',
        }
      : {
          status: 'active',
          premium_frequency: 'monthly',
          policy_type: 'life_insurance',
          fund_value: 0,
          riders: {},
        },
  })

  const onSubmit = async (data: PolicyFormData) => {
    const beneficiaries = data.beneficiary_name
      ? [{ name: data.beneficiary_name, percentage: data.beneficiary_percentage || 100 }]
      : []

    const policyData = {
      organization_id: currentUser?.organization_id || '',
      client_id: data.client_id,
      created_by: currentUser?.id || '',
      policy_type: data.policy_type,
      policy_name: data.policy_name,
      policy_number: data.policy_number || null,
      carrier: data.carrier,
      status: data.status,
      effective_date: data.effective_date,
      renewal_date: data.renewal_date || null,
      premium_amount: data.premium_amount,
      premium_frequency: data.premium_frequency,
      coverage_amount: data.coverage_amount || null,
      fund_value: data.fund_value || 0,
      fund_value_date: data.fund_value_date || null,
      riders: data.riders || {},
      beneficiaries: beneficiaries,
      notes: data.notes || null,
    }

    if (policy) {
      updatePolicy({ id: policy.id, ...policyData })
    } else {
      createPolicy(policyData)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Selection */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="client_id">Client *</Label>
          <select
            id="client_id"
            {...register('client_id')}
            className="w-full rounded-lg bg-surface-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-0"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.first_name} {client.last_name}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="text-sm text-destructive">{errors.client_id.message}</p>
          )}
        </div>

        {/* Policy Type */}
        <div className="space-y-2">
          <Label htmlFor="policy_type">Policy Type *</Label>
          <select
            id="policy_type"
            {...register('policy_type')}
            className="w-full rounded-lg bg-surface-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-0"
          >
            <option value="life_insurance">Life Insurance</option>
            <option value="annuity">Annuity</option>
            <option value="ltc">Long Term Care</option>
            <option value="health">Health</option>
            <option value="disability">Disability</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-lg bg-surface-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-0"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="grace_period">Grace Period</option>
            <option value="lapsed">Lapsed</option>
            <option value="cancelled">Cancelled</option>
            <option value="matured">Matured</option>
          </select>
        </div>

        {/* Policy Name */}
        <div className="space-y-2">
          <Label htmlFor="policy_name">Policy Name *</Label>
          <Input id="policy_name" {...register('policy_name')} placeholder="e.g., Whole Life Portfolio" />
          {errors.policy_name && (
            <p className="text-sm text-destructive">{errors.policy_name.message}</p>
          )}
        </div>

        {/* Policy Number */}
        <div className="space-y-2">
          <Label htmlFor="policy_number">Policy Number</Label>
          <Input id="policy_number" {...register('policy_number')} placeholder="e.g., #44921-X" />
        </div>

        {/* Carrier */}
        <div className="space-y-2">
          <Label htmlFor="carrier">Carrier *</Label>
          <Input id="carrier" {...register('carrier')} placeholder="e.g., Prudential Financial" />
          {errors.carrier && (
            <p className="text-sm text-destructive">{errors.carrier.message}</p>
          )}
        </div>

        {/* Premium Amount */}
        <div className="space-y-2">
          <Label htmlFor="premium_amount">Premium Amount *</Label>
          <Input
            id="premium_amount"
            type="number"
            step="0.01"
            {...register('premium_amount', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.premium_amount && (
            <p className="text-sm text-destructive">{errors.premium_amount.message}</p>
          )}
        </div>

        {/* Premium Frequency */}
        <div className="space-y-2">
          <Label htmlFor="premium_frequency">Premium Frequency *</Label>
          <select
            id="premium_frequency"
            {...register('premium_frequency')}
            className="w-full rounded-lg bg-surface-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-0"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="semi_annual">Semi-Annual</option>
            <option value="annual">Annual</option>
            <option value="single_premium">Single Premium</option>
          </select>
        </div>

        {/* Coverage Amount */}
        <div className="space-y-2">
          <Label htmlFor="coverage_amount">Coverage Amount</Label>
          <Input
            id="coverage_amount"
            type="number"
            step="0.01"
            {...register('coverage_amount', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        {/* Fund Value */}
        <div className="space-y-2">
          <Label htmlFor="fund_value">Fund Value</Label>
          <Input
            id="fund_value"
            type="number"
            step="0.01"
            {...register('fund_value', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        {/* Fund Value Date */}
        <div className="space-y-2">
          <Label htmlFor="fund_value_date">Fund Value As Of</Label>
          <Input id="fund_value_date" type="date" {...register('fund_value_date')} />
        </div>

        {/* Effective Date */}
        <div className="space-y-2">
          <Label htmlFor="effective_date">Effective Date *</Label>
          <Input id="effective_date" type="date" {...register('effective_date')} />
          {errors.effective_date && (
            <p className="text-sm text-destructive">{errors.effective_date.message}</p>
          )}
        </div>

        {/* Renewal Date */}
        <div className="space-y-2">
          <Label htmlFor="renewal_date">Renewal Date</Label>
          <Input id="renewal_date" type="date" {...register('renewal_date')} />
        </div>

        {/* Beneficiary */}
        <div className="space-y-2">
          <Label htmlFor="beneficiary_name">Primary Beneficiary</Label>
          <Input id="beneficiary_name" {...register('beneficiary_name')} placeholder="e.g., John Smith" />
        </div>

        {/* Beneficiary Percentage */}
        <div className="space-y-2">
          <Label htmlFor="beneficiary_percentage">Beneficiary %</Label>
          <Input
            id="beneficiary_percentage"
            type="number"
            min="0"
            max="100"
            {...register('beneficiary_percentage', { valueAsNumber: true })}
            placeholder="100"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register('notes')} placeholder="Additional notes..." rows={3} />
        </div>

        {/* Riders */}
        <div className="md:col-span-2">
          <Controller
            name="riders"
            control={control}
            render={({ field }) => (
              <RidersEditor
                value={(field.value as PolicyRiders) || {}}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
        </Button>
      </div>
    </form>
  )
}
