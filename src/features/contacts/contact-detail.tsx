"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/shared/utils/supabase/client";
import type { ContactType } from "@/shared/types/database";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  Plus,
  Trash2,
} from "lucide-react";

// --- Types ---

interface ContactData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  phone_home: string | null;
  phone_mobile: string | null;
  phone_work: string | null;
  phone_other: string | null;
  contact_type: ContactType;
  tags: string[];
  church_name: string | null;
  church_role: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  street_address: string | null;
  address_line_2: string | null;
  zip_code: string | null;
  region_id: string | null;
  position_id: string | null;
  notes: string | null;
  email_status: string | null;
  email_permission: string | null;
  alternative_email: string | null;
  birthday: string | null;
  anniversary: string | null;
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
  updated_at: string;
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
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

interface AudienceList {
  id: string;
  name: string;
}

interface Props {
  contact: ContactData;
  regions: Region[];
  positions: PositionOption[];
  registrations: Registration[];
  followUps: FollowUp[];
  notes: Note[];
  audiences: AudienceList[];
}

// --- Helpers ---

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-600", "bg-emerald-600", "bg-purple-600", "bg-amber-600",
    "bg-rose-600", "bg-cyan-600", "bg-indigo-600", "bg-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- Collapsible Section ---

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

// --- Form field helpers ---

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={(v: string | null) => onChange(v === "__none__" ? "" : (v ?? ""))}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">—</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// --- Main Component ---

export function ContactDetail({
  contact,
  regions,
  positions,
  registrations,
  followUps,
  notes: initialNotes,
  audiences,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  // --- Form state (all editable fields) ---
  const buildFormState = useCallback(() => ({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    contact_type: contact.contact_type as string,
    church_name: contact.church_name ?? "",
    church_role: contact.church_role ?? "",
    city: contact.city ?? "",
    state: contact.state ?? "",
    country: contact.country ?? "",
    street_address: contact.street_address ?? "",
    address_line_2: contact.address_line_2 ?? "",
    zip_code: contact.zip_code ?? "",
    region_id: contact.region_id ?? "",
    position_id: contact.position_id ?? "",
    email_status: contact.email_status ?? "",
    email_permission: contact.email_permission ?? "",
    alternative_email: contact.alternative_email ?? "",
    birthday: contact.birthday ?? "",
    anniversary: contact.anniversary ?? "",
    gender: contact.gender ?? "",
    age_group: contact.age_group ?? "",
    language: contact.language ?? "",
    job_title: contact.job_title ?? "",
    referred_by: contact.referred_by ?? "",
    interests: contact.interests ?? "",
    expectations: contact.expectations ?? "",
    cc_region: contact.cc_region ?? "",
    phone_home: contact.phone_home ?? "",
    phone_mobile: contact.phone_mobile ?? "",
    phone_work: contact.phone_work ?? "",
    phone_other: contact.phone_other ?? "",
  }), [contact]);

  const [form, setForm] = useState(buildFormState);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dirty detection
  const initialForm = useMemo(buildFormState, [buildFormState]);
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // --- Tags state (saves immediately) ---
  const [tags, setTags] = useState<string[]>(contact.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // --- Lists state (saves immediately) ---
  const [lists, setLists] = useState<string[]>(contact.email_lists ?? []);
  const [showListDropdown, setShowListDropdown] = useState(false);

  // --- Notes state ---
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // --- Save contact fields ---
  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from("contacts")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        contact_type: form.contact_type as ContactType,
        church_name: form.church_name || null,
        church_role: form.church_role || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        street_address: form.street_address || null,
        address_line_2: form.address_line_2 || null,
        zip_code: form.zip_code || null,
        region_id: form.region_id || null,
        position_id: form.position_id || null,
        email_status: form.email_status || null,
        email_permission: form.email_permission || null,
        alternative_email: form.alternative_email || null,
        birthday: form.birthday || null,
        anniversary: form.anniversary || null,
        gender: form.gender || null,
        age_group: form.age_group || null,
        language: form.language || null,
        job_title: form.job_title || null,
        referred_by: form.referred_by || null,
        interests: form.interests || null,
        expectations: form.expectations || null,
        cc_region: form.cc_region || null,
        phone_home: form.phone_home || null,
        phone_mobile: form.phone_mobile || null,
        phone_work: form.phone_work || null,
        phone_other: form.phone_other || null,
      })
      .eq("id", contact.id);

    setSaving(false);
    if (error) {
      setSaveError(error.message);
      toast.error("Failed to save changes");
    } else {
      setSaveError(null);
      toast.success("Changes saved");
      router.refresh();
    }
  }

  // --- Tag operations (immediate save) ---
  async function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const newTags = [...tags, trimmed];
    setTags(newTags);
    setTagInput("");
    await supabase.from("contacts").update({ tags: newTags }).eq("id", contact.id);
  }

  async function removeTag(tag: string) {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    await supabase.from("contacts").update({ tags: newTags }).eq("id", contact.id);
  }

  // --- List operations (immediate save) ---
  async function addList(name: string) {
    if (lists.includes(name)) return;
    const newLists = [...lists, name];
    setLists(newLists);
    setShowListDropdown(false);
    await supabase.from("contacts").update({ email_lists: newLists }).eq("id", contact.id);
  }

  async function removeList(name: string) {
    const newLists = lists.filter((l) => l !== name);
    setLists(newLists);
    await supabase.from("contacts").update({ email_lists: newLists }).eq("id", contact.id);
  }

  // --- Note operations ---
  async function createNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const { data, error } = await supabase
      .from("contact_notes")
      .insert({ contact_id: contact.id, content: newNote.trim() })
      .select()
      .single();

    setSavingNote(false);
    if (!error && data) {
      setNotes([data, ...notes]);
      setNewNote("");
    }
  }

  async function deleteNote(noteId: string) {
    setNotes(notes.filter((n) => n.id !== noteId));
    await supabase.from("contact_notes").delete().eq("id", noteId);
  }

  // --- Activity timeline ---
  const activityItems = useMemo(() => {
    const items: { id: string; type: "registration" | "followup"; date: string; title: string; subtitle: string; status: string }[] = [];
    registrations.forEach((r) => {
      items.push({
        id: r.id,
        type: "registration",
        date: r.created_at,
        title: r.event?.title ?? "Unknown event",
        subtitle: r.event?.start_date ? formatDate(r.event.start_date + "T00:00:00") : "",
        status: r.status,
      });
    });
    followUps.forEach((fu) => {
      items.push({
        id: fu.id,
        type: "followup",
        date: fu.created_at,
        title: fu.title,
        subtitle: fu.due_date ? `Due ${formatDate(fu.due_date + "T00:00:00")}` : "",
        status: fu.status,
      });
    });
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [registrations, followUps]);

  const emailStatusLabel = form.email_status === "subscribed" || form.email_permission === "explicit"
    ? "Email subscribed"
    : form.email_status || "No status";

  const emailStatusColor = form.email_status === "subscribed" || form.email_permission === "explicit"
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-600";

  const availableLists = audiences.filter((a) => !lists.includes(a.name));

  return (
    <div>
      {/* --- Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/contacts"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div
          className={`size-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0 ${getAvatarColor(contact.first_name + contact.last_name)}`}
        >
          {getInitials(contact.first_name, contact.last_name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {contact.first_name} {contact.last_name}
            </h1>
            <Badge variant="secondary" className={emailStatusColor}>
              {emailStatusLabel}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Added on {formatDate(contact.created_at)}
            {contact.updated_at !== contact.created_at && (
              <> &middot; Last edit {formatDate(contact.updated_at)}</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            size="sm"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      {/* --- Tabs --- */}
      <Tabs defaultValue={0}>
        <TabsList variant="line" className="mb-5 border-b pb-0">
          <TabsTrigger value={0}>Details</TabsTrigger>
          <TabsTrigger value={1}>Activity</TabsTrigger>
          <TabsTrigger value={2}>Notes</TabsTrigger>
        </TabsList>

        {/* ====== DETAILS TAB ====== */}
        <TabsContent value={0}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* --- Left Column: Collapsible Sections --- */}
            <div className="bg-white rounded-xl border divide-y">
              {/* Basic details */}
              <CollapsibleSection title="Basic details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <FormField label="First name" value={form.first_name} onChange={(v) => updateField("first_name", v)} />
                  <FormField label="Last name" value={form.last_name} onChange={(v) => updateField("last_name", v)} />
                  <FormField label="Job title" value={form.job_title} onChange={(v) => updateField("job_title", v)} />
                  <FormField label="Company" value={form.church_name} onChange={(v) => updateField("church_name", v)} />
                  <FormField label="Birthday" value={form.birthday} onChange={(v) => updateField("birthday", v)} type="date" />
                  <FormField label="Anniversary" value={form.anniversary} onChange={(v) => updateField("anniversary", v)} type="date" />
                </div>
              </CollapsibleSection>

              {/* Campaign channels */}
              <CollapsibleSection title="Campaign channels">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <FormField label="Email" value={form.email} onChange={(v) => updateField("email", v)} type="email" />
                  <FormSelect
                    label="Email status"
                    value={form.email_status}
                    onChange={(v) => updateField("email_status", v)}
                    options={[
                      { value: "subscribed", label: "Subscribed" },
                      { value: "unsubscribed", label: "Unsubscribed" },
                      { value: "bounced", label: "Bounced" },
                      { value: "pending", label: "Pending" },
                    ]}
                    placeholder="Select status"
                  />
                </div>
              </CollapsibleSection>

              {/* Custom fields */}
              <CollapsibleSection title="Custom fields">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <FormField label="Age group" value={form.age_group} onChange={(v) => updateField("age_group", v)} />
                  <FormField label="Alternative email" value={form.alternative_email} onChange={(v) => updateField("alternative_email", v)} type="email" />
                  <FormField label="Country" value={form.country} onChange={(v) => updateField("country", v)} />
                  <FormSelect
                    label="Gender"
                    value={form.gender}
                    onChange={(v) => updateField("gender", v)}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                    placeholder="Select gender"
                  />
                  <FormField label="Language" value={form.language} onChange={(v) => updateField("language", v)} />
                  <FormField label="Ministry / Organization" value={form.church_name} onChange={(v) => updateField("church_name", v)} />
                  <FormField label="Referred by" value={form.referred_by} onChange={(v) => updateField("referred_by", v)} />
                  <FormSelect
                    label="Region"
                    value={form.region_id}
                    onChange={(v) => updateField("region_id", v)}
                    options={regions.map((r) => ({ value: r.id, label: r.name }))}
                    placeholder="Select region"
                  />
                  <FormField label="Role" value={form.church_role} onChange={(v) => updateField("church_role", v)} />
                  <FormField label="Expectations" value={form.expectations} onChange={(v) => updateField("expectations", v)} />
                  <FormField label="Interests" value={form.interests} onChange={(v) => updateField("interests", v)} />
                  <FormSelect
                    label="Contact type"
                    value={form.contact_type}
                    onChange={(v) => updateField("contact_type", v)}
                    options={[
                      { value: "pastor", label: "Pastor" },
                      { value: "leader", label: "Leader" },
                      { value: "donor", label: "Donor" },
                      { value: "attendee", label: "Attendee" },
                      { value: "subscriber", label: "Subscriber" },
                      { value: "other", label: "Other" },
                    ]}
                    placeholder="Select type"
                  />
                </div>
              </CollapsibleSection>

              {/* Street addresses */}
              <CollapsibleSection title="Street addresses">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <div className="sm:col-span-2">
                    <FormField label="Street address" value={form.street_address} onChange={(v) => updateField("street_address", v)} />
                  </div>
                  <div className="sm:col-span-2">
                    <FormField label="Address line 2" value={form.address_line_2} onChange={(v) => updateField("address_line_2", v)} />
                  </div>
                  <FormField label="State / Province" value={form.state} onChange={(v) => updateField("state", v)} />
                  <FormField label="City / Town" value={form.city} onChange={(v) => updateField("city", v)} />
                  <FormField label="ZIP / Postal code" value={form.zip_code} onChange={(v) => updateField("zip_code", v)} />
                  <FormField label="Country" value={form.country} onChange={(v) => updateField("country", v)} />
                </div>
              </CollapsibleSection>

              {/* Phone numbers */}
              <CollapsibleSection title="Phone numbers">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <FormField label="Home" value={form.phone_home} onChange={(v) => updateField("phone_home", v)} type="tel" />
                  <FormField label="Work" value={form.phone_work} onChange={(v) => updateField("phone_work", v)} type="tel" />
                  <FormField label="Mobile" value={form.phone_mobile} onChange={(v) => updateField("phone_mobile", v)} type="tel" />
                  <FormField label="Other" value={form.phone_other} onChange={(v) => updateField("phone_other", v)} type="tel" />
                </div>
              </CollapsibleSection>
            </div>

            {/* --- Right Sidebar --- */}
            <div className="space-y-5 min-w-0">
              {/* Insights (30 days) */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Insights (30 days)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Emails sent", value: "—" },
                    { label: "Open rate", value: "—" },
                    { label: "Click rate", value: "—" },
                    { label: "Bounced", value: "—" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* List membership */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">List membership</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {lists.length > 0 ? lists.map((list) => (
                    <Badge key={list} variant="secondary" className="bg-blue-50 text-blue-700 gap-1 pr-1 max-w-full">
                      <span className="truncate">{list}</span>
                      <button
                        type="button"
                        onClick={() => removeList(list)}
                        className="hover:bg-blue-200 rounded p-0.5 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )) : (
                    <span className="text-sm text-gray-400">No lists</span>
                  )}
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => setShowListDropdown(!showListDropdown)}
                  >
                    <Plus className="size-3" /> Add to list
                  </Button>
                  {showListDropdown && availableLists.length > 0 && (
                    <div className="absolute z-10 mt-1 w-56 bg-white border rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                      {availableLists.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => addList(a.name)}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.length > 0 ? tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 gap-1 pr-1 max-w-full">
                      <span className="truncate">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-gray-300 rounded p-0.5 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )) : (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTag(tagInput);
                  }}
                  className="flex gap-1.5"
                >
                  <Input
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="h-8 text-sm flex-1"
                  />
                  <Button type="submit" variant="outline" size="sm" disabled={!tagInput.trim()}>
                    <Plus className="size-3" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ====== ACTIVITY TAB ====== */}
        <TabsContent value={1}>
          <div className="bg-white rounded-xl border">
            {activityItems.length > 0 ? (
              <div className="divide-y">
                {activityItems.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                    <div
                      className={`mt-0.5 size-2 rounded-full shrink-0 ${
                        item.type === "registration" ? "bg-blue-500" : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={
                            item.status === "confirmed" || item.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {item.status}
                        </Badge>
                        <span className="text-xs text-gray-400 capitalize">{item.type === "registration" ? "Registration" : "Follow-up"}</span>
                        {item.subtitle && (
                          <span className="text-xs text-gray-400">&middot; {item.subtitle}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDate(item.date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </TabsContent>

        {/* ====== NOTES TAB ====== */}
        <TabsContent value={2}>
          <div className="space-y-5">
            {/* Create note */}
            <div className="bg-white rounded-xl border p-5">
              <Textarea
                value={newNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="min-h-[100px] mb-3"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewNote("")}
                  disabled={!newNote.trim()}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={createNote}
                  disabled={!newNote.trim() || savingNote}
                >
                  {savingNote ? "Saving..." : "Save note"}
                </Button>
              </div>
            </div>

            {/* Past notes */}
            {notes.length > 0 ? (
              <div className="bg-white rounded-xl border divide-y">
                {notes.map((note) => (
                  <div key={note.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">
                        {note.content}
                      </p>
                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border px-6 py-12 text-center text-sm text-gray-400">
                No notes yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
