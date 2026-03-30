import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import type { PolicyRiders, PolicyRider } from '@/types/database'

interface RidersEditorProps {
  value: PolicyRiders
  onChange: (riders: PolicyRiders) => void
}

const RIDER_DEFINITIONS = [
  { key: 'ccb', label: 'CCB/LCB - Critical Care / Living Care Benefit', hasAmount: true },
  { key: 'tpd', label: 'TPD - Total Permanent Disability', hasAmount: true },
  { key: 'core_add', label: 'Core ADD - Accidental Death & Dismemberment', hasAmount: true },
  { key: 'wptpd', label: 'WPTPD - Waiver of Premium on TPD', hasAmount: false },
  { key: 'dhi', label: 'DHI - Daily Hospital Income', hasAmount: true, amountLabel: 'Daily Rate' },
  { key: 'ser', label: 'SER - Surgical Expense Reimbursement', hasAmount: true },
  { key: 'icu', label: 'ICU - Intensive Care Unit', hasAmount: true, amountLabel: 'Daily Rate' },
  { key: 'pa_add', label: 'PA ADD - Personal Accident ADD', hasAmount: true },
  { key: 'pa_atpd', label: 'PA ATPD - Personal Accident - Accidental TPD', hasAmount: true },
  { key: 'ma', label: 'M&A - Murder and Assault', hasAmount: true },
  { key: 'amr', label: 'AMR - Accident Medical Reimbursement', hasAmount: true },
  { key: 'fs', label: 'FS - Future Safe', hasAmount: true },
  { key: 'bb', label: 'BB - Burial Benefit', hasAmount: true },
] as const

export function RidersEditor({ value, onChange }: RidersEditorProps) {
  const handleToggle = (key: string, enabled: boolean) => {
    const currentRider = value[key as keyof PolicyRiders] || { enabled: false }
    onChange({
      ...value,
      [key]: { ...currentRider, enabled },
    })
  }

  const handleAmountChange = (key: string, amount: number) => {
    const currentRider = value[key as keyof PolicyRiders] || { enabled: true }
    const amountKey = RIDER_DEFINITIONS.find(r => r.key === key)?.amountLabel === 'Daily Rate' ? 'daily_rate' : 'amount'
    onChange({
      ...value,
      [key]: { ...currentRider, [amountKey]: amount },
    })
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Policy Riders</Label>
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1">
        {RIDER_DEFINITIONS.map((rider) => {
          const riderValue = value[rider.key as keyof PolicyRiders] as PolicyRider | undefined
          const isEnabled = riderValue?.enabled || false
          const amountValue = rider.amountLabel === 'Daily Rate' ? riderValue?.daily_rate : riderValue?.amount

          return (
            <div
              key={rider.key}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
            >
              <Checkbox
                id={`rider-${rider.key}`}
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(rider.key, checked === true)}
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`rider-${rider.key}`}
                  className="text-xs font-medium cursor-pointer block truncate"
                >
                  {rider.label}
                </label>
              </div>
              {rider.hasAmount && isEnabled && (
                <Input
                  type="number"
                  placeholder={rider.amountLabel || 'Amount'}
                  value={amountValue || ''}
                  onChange={(e) => handleAmountChange(rider.key, parseFloat(e.target.value) || 0)}
                  className="w-28 h-8 text-xs"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
