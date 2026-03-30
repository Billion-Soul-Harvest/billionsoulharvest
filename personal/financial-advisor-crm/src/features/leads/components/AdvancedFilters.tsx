import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { User, PipelineStage } from '@/types/database'

export interface LeadFilters {
  dateFrom?: string
  dateTo?: string
  assignedTo?: string
  scoreMin?: number
  scoreMax?: number
  source?: string
  hasEmail?: boolean
  hasPhone?: boolean
}

interface AdvancedFiltersProps {
  filters: LeadFilters
  onFiltersChange: (filters: LeadFilters) => void
  users: User[]
  stages: PipelineStage[]
  sources: string[]
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  users,
  sources,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([, value]) => {
    if (value === undefined || value === '') return false
    return true
  }).length

  const updateFilter = <K extends keyof LeadFilters>(
    key: K,
    value: LeadFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilter = (key: keyof LeadFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  // Generate active filter chips
  const getActiveFilterChips = () => {
    const chips: { key: keyof LeadFilters; label: string }[] = []

    if (filters.dateFrom) {
      chips.push({ key: 'dateFrom', label: `From: ${filters.dateFrom}` })
    }
    if (filters.dateTo) {
      chips.push({ key: 'dateTo', label: `To: ${filters.dateTo}` })
    }
    if (filters.assignedTo) {
      const label =
        filters.assignedTo === 'unassigned'
          ? 'Advisor: Unassigned'
          : `Advisor: ${users.find((u) => u.id === filters.assignedTo)?.full_name || 'Unknown'}`
      chips.push({
        key: 'assignedTo',
        label,
      })
    }
    if (filters.source) {
      chips.push({ key: 'source', label: `Source: ${filters.source}` })
    }
    if (filters.scoreMin !== undefined) {
      chips.push({ key: 'scoreMin', label: `Min Score: ${filters.scoreMin}` })
    }
    if (filters.scoreMax !== undefined) {
      chips.push({ key: 'scoreMax', label: `Max Score: ${filters.scoreMax}` })
    }
    if (filters.hasEmail !== undefined) {
      chips.push({
        key: 'hasEmail',
        label: `Email: ${filters.hasEmail ? 'Yes' : 'No'}`,
      })
    }
    if (filters.hasPhone !== undefined) {
      chips.push({
        key: 'hasPhone',
        label: `Phone: ${filters.hasPhone ? 'Yes' : 'No'}`,
      })
    }

    return chips
  }

  const activeChips = getActiveFilterChips()

  return (
    <div className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <div className="mt-4 rounded-xl bg-surface-2 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Date From
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    updateFilter('dateFrom', e.target.value || undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Date To
                </Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) =>
                    updateFilter('dateTo', e.target.value || undefined)
                  }
                />
              </div>

              {/* Assigned Advisor */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Assigned Advisor
                </Label>
                <Select
                  value={filters.assignedTo || ''}
                  onValueChange={(value) =>
                    updateFilter('assignedTo', value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any advisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any advisor</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Source */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Lead Source
                </Label>
                <Select
                  value={filters.source || ''}
                  onValueChange={(value) =>
                    updateFilter('source', value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any source</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Min Score
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={filters.scoreMin ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'scoreMin',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Max Score
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="100"
                  value={filters.scoreMax ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'scoreMax',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              {/* Has Email */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Has Email
                </Label>
                <Select
                  value={
                    filters.hasEmail === undefined
                      ? ''
                      : filters.hasEmail
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(value) => {
                    if (value === '') {
                      updateFilter('hasEmail', undefined)
                    } else {
                      updateFilter('hasEmail', value === 'yes')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Has Phone */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Has Phone
                </Label>
                <Select
                  value={
                    filters.hasPhone === undefined
                      ? ''
                      : filters.hasPhone
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(value) => {
                    if (value === '') {
                      updateFilter('hasPhone', undefined)
                    } else {
                      updateFilter('hasPhone', value === 'yes')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onClear={() => clearFilter(chip.key)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-muted text-primary text-xs font-medium">
      {label}
      <button
        onClick={onClear}
        className="hover:bg-primary/20 rounded-full p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
