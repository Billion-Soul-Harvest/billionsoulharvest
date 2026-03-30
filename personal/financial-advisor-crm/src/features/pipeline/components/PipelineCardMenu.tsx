import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'

interface PipelineCardMenuProps {
  leadId: string
  onScheduleTask?: () => void
  onAssign?: () => void
  onDelete?: () => void
}

export function PipelineCardMenu({
  leadId,
  onScheduleTask,
  onAssign,
  onDelete,
}: PipelineCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to={`/leads/${leadId}`} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/leads/${leadId}/edit`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Lead
          </Link>
        </DropdownMenuItem>
        {onScheduleTask && (
          <DropdownMenuItem onClick={onScheduleTask} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Task
          </DropdownMenuItem>
        )}
        {onAssign && (
          <DropdownMenuItem onClick={onAssign} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Reassign
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Lead
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
