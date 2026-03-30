import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import type { LeadWithStage } from '@/types/database'

interface ExportLeadsDialogProps {
  leads: LeadWithStage[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ExportColumn {
  key: string
  label: string
  getter: (lead: LeadWithStage) => string
  default: boolean
}

const exportColumns: ExportColumn[] = [
  { key: 'name', label: 'Full Name', getter: (l) => `${l.first_name} ${l.last_name}`, default: true },
  { key: 'first_name', label: 'First Name', getter: (l) => l.first_name, default: false },
  { key: 'last_name', label: 'Last Name', getter: (l) => l.last_name, default: false },
  { key: 'email', label: 'Email', getter: (l) => l.email || '', default: true },
  { key: 'phone', label: 'Phone', getter: (l) => l.phone || '', default: true },
  { key: 'date_of_birth', label: 'Date of Birth', getter: (l) => l.date_of_birth || '', default: false },
  { key: 'source', label: 'Lead Source', getter: (l) => l.source || '', default: true },
  { key: 'stage', label: 'Pipeline Stage', getter: (l) => l.stage?.name || '', default: true },
  { key: 'lead_score', label: 'Lead Score', getter: (l) => String(l.lead_score || 0), default: true },
  { key: 'assigned_to', label: 'Assigned To', getter: (l) => l.assigned_user?.full_name || 'Unassigned', default: true },
  { key: 'financial_goals', label: 'Financial Goals', getter: (l) => l.financial_goals || '', default: false },
  { key: 'notes', label: 'Notes', getter: (l) => l.notes || '', default: false },
  { key: 'created_at', label: 'Created Date', getter: (l) => format(new Date(l.created_at), 'yyyy-MM-dd'), default: true },
  { key: 'updated_at', label: 'Last Updated', getter: (l) => format(new Date(l.updated_at), 'yyyy-MM-dd'), default: false },
]

function getDefaultSelectedColumns(): Set<string> {
  return new Set(exportColumns.filter((col) => col.default).map((col) => col.key))
}

function escapeCSVValue(value: string): string {
  // Escape quotes by doubling them, then wrap in quotes
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

function generateCSV(leads: LeadWithStage[], selectedColumns: Set<string>): string {
  const columns = exportColumns.filter((col) => selectedColumns.has(col.key))

  // Header row
  const headerRow = columns.map((col) => escapeCSVValue(col.label)).join(',')

  // Data rows
  const dataRows = leads.map((lead) =>
    columns.map((col) => escapeCSVValue(col.getter(lead))).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ExportLeadsDialog({
  leads,
  open,
  onOpenChange,
}: ExportLeadsDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(getDefaultSelectedColumns)

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedColumns(new Set(exportColumns.map((col) => col.key)))
  }

  const selectNone = () => {
    setSelectedColumns(new Set())
  }

  const handleExport = () => {
    const csv = generateCSV(leads, selectedColumns)
    const filename = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    downloadCSV(csv, filename)
    onOpenChange(false)
  }

  const hasSelectedColumns = selectedColumns.size > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Leads
          </DialogTitle>
          <DialogDescription>
            Export {leads.length} lead{leads.length !== 1 ? 's' : ''} to CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Select Columns</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={selectNone}>
                Select None
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {exportColumns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`col-${column.key}`}
                  checked={selectedColumns.has(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                />
                <Label
                  htmlFor={`col-${column.key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!hasSelectedColumns}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
