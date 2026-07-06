"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/shared/utils/supabase/client";
import type { ContactType } from "@/shared/types/database";

interface ContactData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  phone_home: string | null;
  phone_mobile: string | null;
  phone_work: string | null;
  contact_type: ContactType;
  tags: string[];
  church_name: string | null;
  church_role: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  street_address: string | null;
  region_id: string | null;
  position_id: string | null;
  notes: string | null;
  email_status: string | null;
  email_permission: string | null;
  alternative_email: string | null;
  birthday: string | null;
  gender: string | null;
  age_group: string | null;
  language: string | null;
  job_title: string | null;
  referred_by: string | null;
  interests: string | null;
  expectations: string | null;
  source: string | null;
  cc_region: string | null;
  email_lists: string[] | null;
  region: { id: string; name: string; color: string } | null;
  position: { id: string; name: string } | null;
  created_at: string;
}

interface Region {
  id: string;
  name: string;
  color: string;
}

interface PositionOption {
  id: string;
  name: string;
}

interface Registration {
  id: string;
  status: string;
  created_at: string;
  event: { title: string; slug: string; start_date: string | null } | null;
}

interface FollowUp {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
}

interface Props {
  contact: ContactData;
  regions: Region[];
  positions: PositionOption[];
  registrations: Registration[];
  followUps: FollowUp[];
}

export function ContactDetail({ contact, regions, positions, registrations, followUps }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    contact_type: contact.contact_type,
    church_name: contact.church_name ?? "",
    church_role: contact.church_role ?? "",
    city: contact.city ?? "",
    state: contact.state ?? "",
    country: contact.country ?? "",
    region_id: contact.region_id ?? "",
    position_id: contact.position_id ?? "",
    notes: contact.notes ?? "",
    tags: contact.tags.join(", "),
  });

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        contact_type: form.contact_type,
        church_name: form.church_name || null,
        church_role: form.church_role || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        region_id: form.region_id || null,
        position_id: form.position_id || null,
        notes: form.notes || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      })
      .eq("id", contact.id);

    setSaving(false);
    if (!error) {
      setEditing(false);
      router.refresh();
    }
  }

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/contacts" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {contact.first_name} {contact.last_name}
          </h1>
          <p className="text-sm text-gray-500">{contact.email}</p>
        </div>
        <Button
          variant={editing ? "default" : "outline"}
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
        >
          {saving ? "Saving..." : editing ? "Save Changes" : "Edit"}
        </Button>
        {editing && (
          <Button variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" value={form.first_name} editing={editing}
                onChange={(v) => setForm({ ...form, first_name: v })} />
              <Field label="Last Name" value={form.last_name} editing={editing}
                onChange={(v) => setForm({ ...form, last_name: v })} />
              <Field label="Email" value={form.email} editing={editing}
                onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone} editing={editing}
                onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Type</Label>
                {editing ? (
                  <Select value={form.contact_type} onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, contact_type: v as ContactType });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pastor", "leader", "donor", "attendee", "subscriber", "other"].map((t) => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-900 capitalize">{contact.contact_type}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Region</Label>
                {editing ? (
                  <Select value={form.region_id} onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, region_id: v === "none" ? "" : v });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No region</SelectItem>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-900">{contact.region?.name ?? "—"}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Position</Label>
                {editing ? (
                  <Select value={form.position_id} onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, position_id: v === "none" ? "" : v });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No position</SelectItem>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-900">{contact.position?.name ?? "—"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Personal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Gender" value={contact.gender} />
              <ReadOnlyField label="Age Group" value={contact.age_group} />
              <ReadOnlyField label="Birthday" value={contact.birthday ? new Date(contact.birthday + "T00:00:00").toLocaleDateString() : null} />
              <ReadOnlyField label="Language" value={contact.language} />
              <ReadOnlyField label="Job Title" value={contact.job_title} />
              <ReadOnlyField label="Referred By" value={contact.referred_by} />
              <ReadOnlyField label="Source" value={contact.source} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Church & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Church" value={form.church_name} editing={editing}
                onChange={(v) => setForm({ ...form, church_name: v })} />
              <Field label="Role" value={form.church_role} editing={editing}
                onChange={(v) => setForm({ ...form, church_role: v })} />
              <Field label="City" value={form.city} editing={editing}
                onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="State" value={form.state} editing={editing}
                onChange={(v) => setForm({ ...form, state: v })} />
              <Field label="Country" value={form.country} editing={editing}
                onChange={(v) => setForm({ ...form, country: v })} />
              <ReadOnlyField label="Street Address" value={contact.street_address} />
              <ReadOnlyField label="CC Region" value={contact.cc_region} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Phone (Home)" value={contact.phone_home} />
              <ReadOnlyField label="Phone (Mobile)" value={contact.phone_mobile} />
              <ReadOnlyField label="Phone (Work)" value={contact.phone_work} />
              <ReadOnlyField label="Alternative Email" value={contact.alternative_email} />
              <ReadOnlyField label="Email Status" value={contact.email_status} />
              <ReadOnlyField label="Email Permission" value={contact.email_permission} />
            </div>
            {contact.email_lists && contact.email_lists.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <Label className="text-xs text-gray-500">Email Lists</Label>
                <div className="flex flex-wrap gap-1.5">
                  {contact.email_lists.map((list) => (
                    <Badge key={list} variant="secondary" className="bg-gray-100">{list}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Interests & Expectations</h3>
            <div className="space-y-4">
              <ReadOnlyField label="Passionate About" value={contact.interests} />
              <ReadOnlyField label="Primary Expectation" value={contact.expectations} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notes & Tags</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Tags (comma separated)</Label>
                {editing ? (
                  <Input value={form.tags} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, tags: e.target.value })} />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {contact.tags.length > 0 ? contact.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-gray-100">{t}</Badge>
                    )) : <span className="text-sm text-gray-400">No tags</span>}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Notes</Label>
                {editing ? (
                  <Textarea value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setForm({ ...form, notes: e.target.value })} className="min-h-[80px]" />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {contact.notes || "No notes"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registrations */}
          <div className="bg-white rounded-xl border">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-900 text-sm">Event Registrations</h3>
            </div>
            <div className="divide-y">
              {registrations.length > 0 ? registrations.map((r) => (
                <div key={r.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">{r.event?.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={
                      r.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }>{r.status}</Badge>
                    {r.event?.start_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(r.event.start_date + "T00:00:00").toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="px-5 py-6 text-center text-sm text-gray-400">
                  No registrations
                </div>
              )}
            </div>
          </div>

          {/* Follow-ups */}
          <div className="bg-white rounded-xl border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Follow-ups</h3>
              <Link href={`/follow-ups?contact=${contact.id}`} className="text-xs text-cyan-600 hover:text-cyan-700">
                Add
              </Link>
            </div>
            <div className="divide-y">
              {followUps.length > 0 ? followUps.map((fu) => (
                <div key={fu.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">{fu.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={priorityColors[fu.priority] ?? ""}>
                      {fu.priority}
                    </Badge>
                    <span className="text-xs text-gray-400 capitalize">{fu.status}</span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-6 text-center text-sm text-gray-400">
                  No follow-ups
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{new Date(contact.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-400 text-xs font-mono">{contact.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-500">{label}</Label>
      {editing ? (
        <Input value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} />
      ) : (
        <p className="text-sm text-gray-900">{value || "—"}</p>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-500">{label}</Label>
      <p className="text-sm text-gray-900">{value || "—"}</p>
    </div>
  );
}
