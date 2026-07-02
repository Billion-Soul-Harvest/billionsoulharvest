"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";

interface FollowUp {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  contact_id: string;
  created_at: string;
  contact: { id: string; first_name: string; last_name: string; email: string | null } | null;
}

interface ContactOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface Props {
  initialFollowUps: FollowUp[];
  contacts: ContactOption[];
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export function FollowUpsClient({ initialFollowUps, contacts }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    contact_id: "",
    due_date: "",
  });

  const filtered = initialFollowUps.filter((fu) => {
    if (statusFilter === "active") return fu.status === "pending" || fu.status === "in_progress";
    if (statusFilter === "all") return true;
    return fu.status === statusFilter;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.contact_id || !form.title) return;
    setSaving(true);

    const supabase = createClient();
    await supabase.from("follow_ups").insert({
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      contact_id: form.contact_id,
      due_date: form.due_date || null,
      status: "pending",
    });

    setSaving(false);
    setDialogOpen(false);
    setForm({ title: "", description: "", priority: "medium", contact_id: "", due_date: "" });
    router.refresh();
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("follow_ups").update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    }).eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Follow-up
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Follow-up</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Contact</Label>
                <Select value={form.contact_id} onValueChange={(v: string | null) => { if (v) setForm({ ...form, contact_id: v }); }}>
                  <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={form.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                  required placeholder="e.g. Follow up on summit attendance" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional details..." className="min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: string | null) => { if (v) setForm({ ...form, priority: v }); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.due_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creating..." : "Create Follow-up"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        {[
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
          { value: "all", label: "All" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} follow-up{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map((fu) => (
          <div key={fu.id} className="bg-white rounded-xl border p-4 flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={() => updateStatus(fu.id, fu.status === "completed" ? "pending" : "completed")}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                fu.status === "completed"
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 hover:border-green-400"
              }`}
            >
              {fu.status === "completed" && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`font-medium ${fu.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {fu.title}
                </p>
                <Badge variant="secondary" className={priorityColors[fu.priority]}>
                  {fu.priority}
                </Badge>
                <Badge variant="secondary" className={statusColors[fu.status]}>
                  {fu.status.replace("_", " ")}
                </Badge>
              </div>
              {fu.description && (
                <p className="text-sm text-gray-500 mt-1">{fu.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {fu.contact && (
                  <Link href={`/contacts/${fu.contact.id}`} className="hover:text-emerald-600">
                    {fu.contact.first_name} {fu.contact.last_name}
                  </Link>
                )}
                {fu.due_date && (
                  <span className={
                    new Date(fu.due_date + "T00:00:00") < new Date() && fu.status !== "completed"
                      ? "text-red-500 font-medium"
                      : ""
                  }>
                    Due {new Date(fu.due_date + "T00:00:00").toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Quick actions */}
            {fu.status !== "completed" && (
              <Select onValueChange={(v: string | null) => { if (v) updateStatus(fu.id, v); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Update..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Complete</SelectItem>
                  <SelectItem value="cancelled">Cancel</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            No follow-ups found
          </div>
        )}
      </div>
    </div>
  );
}
