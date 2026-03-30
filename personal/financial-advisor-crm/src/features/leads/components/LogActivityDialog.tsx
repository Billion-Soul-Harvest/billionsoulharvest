import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, Calendar, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useLeadActivities } from '../hooks/useLeadActivities'

interface LogActivityDialogProps {
  leadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'call' | 'email' | 'meeting' | 'note'
}

const callSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  outcome: z.string().optional(),
})

const emailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
})

const meetingSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  outcome: z.string().optional(),
})

const noteSchema = z.object({
  description: z.string().min(1, 'Note content is required'),
})

type CallFormData = z.infer<typeof callSchema>
type EmailFormData = z.infer<typeof emailSchema>
type MeetingFormData = z.infer<typeof meetingSchema>
type NoteFormData = z.infer<typeof noteSchema>

export function LogActivityDialog({
  leadId,
  open,
  onOpenChange,
  defaultTab = 'call',
}: LogActivityDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const { logCall, logEmail, logMeeting, logNote, isCreating } = useLeadActivities(leadId)

  const callForm = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: { subject: '', description: '', outcome: '' },
  })

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { subject: '', description: '' },
  })

  const meetingForm = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: { subject: '', description: '', outcome: '' },
  })

  const noteForm = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { description: '' },
  })

  const handleClose = () => {
    callForm.reset()
    emailForm.reset()
    meetingForm.reset()
    noteForm.reset()
    onOpenChange(false)
  }

  const onSubmitCall = async (data: CallFormData) => {
    await logCall(data)
    handleClose()
  }

  const onSubmitEmail = async (data: EmailFormData) => {
    await logEmail(data)
    handleClose()
  }

  const onSubmitMeeting = async (data: MeetingFormData) => {
    await logMeeting(data)
    handleClose()
  }

  const onSubmitNote = async (data: NoteFormData) => {
    await logNote(data)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="call" className="gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="meeting" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Meeting</span>
            </TabsTrigger>
            <TabsTrigger value="note" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
          </TabsList>

          {/* Call Form */}
          <TabsContent value="call">
            <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="call-subject">Subject</Label>
                <Input
                  id="call-subject"
                  placeholder="Brief description of the call"
                  {...callForm.register('subject')}
                />
                {callForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {callForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="call-duration">Duration (minutes)</Label>
                  <Input
                    id="call-duration"
                    type="number"
                    placeholder="15"
                    {...callForm.register('duration', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-outcome">Outcome</Label>
                  <Select
                    value={callForm.watch('outcome') || ''}
                    onValueChange={(v) => callForm.setValue('outcome', v)}
                  >
                    <SelectTrigger id="call-outcome">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="voicemail">Left Voicemail</SelectItem>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                      <SelectItem value="scheduled">Scheduled Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="call-notes">Notes</Label>
                <Textarea
                  id="call-notes"
                  placeholder="Additional notes from the call..."
                  {...callForm.register('description')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Logging...' : 'Log Call'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Email Form */}
          <TabsContent value="email">
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject line"
                  {...emailForm.register('subject')}
                />
                {emailForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-summary">Summary</Label>
                <Textarea
                  id="email-summary"
                  placeholder="Brief summary of the email content..."
                  {...emailForm.register('description')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Logging...' : 'Log Email'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Meeting Form */}
          <TabsContent value="meeting">
            <form onSubmit={meetingForm.handleSubmit(onSubmitMeeting)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-subject">Meeting Title</Label>
                <Input
                  id="meeting-subject"
                  placeholder="What was the meeting about?"
                  {...meetingForm.register('subject')}
                />
                {meetingForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {meetingForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-outcome">Outcome</Label>
                <Select
                  value={meetingForm.watch('outcome') || ''}
                  onValueChange={(v) => meetingForm.setValue('outcome', v)}
                >
                  <SelectTrigger id="meeting-outcome">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="productive">Productive</SelectItem>
                    <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                    <SelectItem value="proposal_requested">Proposal Requested</SelectItem>
                    <SelectItem value="closed_won">Closed - Won</SelectItem>
                    <SelectItem value="closed_lost">Closed - Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-notes">Notes</Label>
                <Textarea
                  id="meeting-notes"
                  placeholder="Meeting notes and action items..."
                  {...meetingForm.register('description')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Logging...' : 'Log Meeting'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Note Form */}
          <TabsContent value="note">
            <form onSubmit={noteForm.handleSubmit(onSubmitNote)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-content">Note</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your note here..."
                  className="min-h-[150px]"
                  {...noteForm.register('description')}
                />
                {noteForm.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {noteForm.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
