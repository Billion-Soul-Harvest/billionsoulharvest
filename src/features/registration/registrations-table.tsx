"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Registration {
  id: string;
  status: string;
  church_name: string | null;
  church_role: string | null;
  city: string | null;
  country: string | null;
  dietary_requirements: string | null;
  how_heard: string | null;
  special_needs: string | null;
  notes?: string | null;
  created_at: string;
  custom_fields?: Record<string, unknown>;
  contact: {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    church_name: string | null;
  } | null;
  event: {
    title: string;
    slug: string;
  } | null;
}

interface EventOption {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  registrations: Registration[];
  events: EventOption[];
}

const STATUS_OPTIONS = ["confirmed", "pending", "cancelled", "waitlisted"] as const;

const statusColor: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  waitlisted: "bg-blue-100 text-blue-800",
};

// --- Row Action Menu Component ---
function RowActionMenu({
  reg,
  onViewDetails,
  onStatusChange,
  onEditNote,
}: {
  reg: Registration;
  onViewDetails: () => void;
  onStatusChange: (status: string) => void;
  onEditNote: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showStatusSub, setShowStatusSub] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowStatusSub(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleResendEmail() {
    try {
      const res = await fetch(`/api/registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_email" }),
      });
      if (res.ok) {
        setActionFeedback("Email sent!");
      } else {
        setActionFeedback("Failed to send");
      }
    } catch {
      setActionFeedback("Failed to send");
    }
    setOpen(false);
    setShowStatusSub(false);
    setTimeout(() => setActionFeedback(null), 2500);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
          setShowStatusSub(false);
        }}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        aria-label="Row actions"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {actionFeedback && (
        <span className="absolute right-8 top-1 text-xs whitespace-nowrap bg-gray-800 text-white rounded px-2 py-1 z-50">
          {actionFeedback}
        </span>
      )}

      {open && (
        <div className="absolute right-0 top-8 z-50 w-52 rounded-lg border bg-white shadow-lg py-1">
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
              setOpen(false);
            }}
          >
            View Details
          </button>

          {/* Change Status with submenu */}
          <div
            className="relative"
            onMouseEnter={() => setShowStatusSub(true)}
            onMouseLeave={() => setShowStatusSub(false)}
          >
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700 flex items-center justify-between"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusSub((prev) => !prev);
              }}
            >
              Change Status
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {showStatusSub && (
              <div className="absolute left-full top-0 ml-1 w-40 rounded-lg border bg-white shadow-lg py-1 z-50">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors capitalize ${
                      reg.status === s
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(s);
                      setOpen(false);
                      setShowStatusSub(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onEditNote();
              setOpen(false);
            }}
          >
            Add/Edit Note
          </button>

          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              handleResendEmail();
            }}
          >
            Resend Confirmation Email
          </button>

          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              router.push("/admin/follow-ups");
            }}
          >
            Create Follow-up
          </button>
        </div>
      )}
    </div>
  );
}

// --- Detail Slide-out Panel Component ---
function DetailPanel({
  registration,
  onClose,
  onStatusChange,
}: {
  registration: Registration;
  onClose: () => void;
  onStatusChange: (reg: Registration, status: string) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(registration.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Sync notes when registration changes
  useEffect(() => {
    setEditingNotes(registration.notes ?? "");
    setNotesFeedback(null);
  }, [registration.id, registration.notes]);

  // Click outside to close status dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    }
    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showStatusDropdown]);

  async function handleSaveNotes() {
    setSavingNotes(true);
    setNotesFeedback(null);
    try {
      const res = await fetch(`/api/registrations/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_notes", notes: editingNotes }),
      });
      if (res.ok) {
        setNotesFeedback("Notes saved!");
      } else {
        setNotesFeedback("Failed to save notes");
      }
    } catch {
      setNotesFeedback("Failed to save notes");
    } finally {
      setSavingNotes(false);
      setTimeout(() => setNotesFeedback(null), 2500);
    }
  }

  const fullName = [
    registration.contact?.first_name,
    registration.contact?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const customFields = registration.custom_fields ?? {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-50 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 transition-colors z-10"
          aria-label="Close panel"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
            <div className="mt-2 relative inline-block" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setShowStatusDropdown((prev) => !prev)}
                className="cursor-pointer"
              >
                <Badge
                  variant="secondary"
                  className={`${statusColor[registration.status] ?? ""} capitalize`}
                >
                  {registration.status}
                </Badge>
              </button>
              {showStatusDropdown && (
                <div className="absolute left-0 top-8 z-50 w-40 rounded-lg border bg-white shadow-lg py-1">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors capitalize ${
                        registration.status === s
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        onStatusChange(registration, s);
                        setShowStatusDropdown(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contact Info
            </h3>
            <dl className="space-y-2">
              <DetailRow label="Email" value={registration.contact?.email} />
              <DetailRow label="Phone" value={registration.contact?.phone} />
              <DetailRow
                label="Church / Organization"
                value={
                  registration.church_name ??
                  registration.contact?.church_name ??
                  null
                }
              />
              <DetailRow label="Ministry Role" value={registration.church_role} />
            </dl>
          </section>

          {/* Event Info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Event Info
            </h3>
            <dl className="space-y-2">
              <DetailRow label="Event" value={registration.event?.title ?? null} />
              <DetailRow
                label="Registration Date"
                value={new Date(registration.created_at).toLocaleDateString()}
              />
              <DetailRow
                label="Location"
                value={
                  [registration.city, registration.country]
                    .filter(Boolean)
                    .join(", ") || null
                }
              />
            </dl>
          </section>

          {/* Additional Details */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Additional Details
            </h3>
            <dl className="space-y-2">
              <DetailRow
                label="Dietary Requirements"
                value={registration.dietary_requirements}
              />
              <DetailRow label="How Heard" value={registration.how_heard} />
              <DetailRow label="Special Needs" value={registration.special_needs} />
              {/* Custom fields */}
              {Object.entries(customFields).map(([key, value]) => (
                <DetailRow
                  key={key}
                  label={key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/_/g, " ")
                    .replace(/^\w/, (c) => c.toUpperCase())
                    .trim()}
                  value={value != null ? String(value) : null}
                />
              ))}
            </dl>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Notes
            </h3>
            <textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Add notes about this registration..."
            />
            <div className="flex items-center gap-3 mt-2">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
              {notesFeedback && (
                <span
                  className={`text-sm ${
                    notesFeedback.includes("Failed")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {notesFeedback}
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-sm text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 text-right">
        {value || "\u2014"}
      </dd>
    </div>
  );
}

// --- Main Component ---
export function RegistrationsTable({ registrations, events }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  // Unique countries for filter dropdown
  const uniqueCountries = Array.from(
    new Set(
      registrations
        .map((reg) => reg.country)
        .filter((c): c is string => Boolean(c))
    )
  ).sort();

  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      !search ||
      `${reg.contact?.first_name} ${reg.contact?.last_name} ${reg.contact?.email}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesEvent =
      eventFilter === "all" || reg.event?.slug === eventFilter;

    const matchesStatus =
      statusFilter === "all" || reg.status === statusFilter;

    const matchesCountry =
      countryFilter === "all" || reg.country === countryFilter;

    return matchesSearch && matchesEvent && matchesStatus && matchesCountry;
  });

  // Stat counts from filtered data
  const totalCount = filtered.length;
  const confirmedCount = filtered.filter((r) => r.status === "confirmed").length;
  const pendingCount = filtered.filter((r) => r.status === "pending").length;
  const cancelledCount = filtered.filter((r) => r.status === "cancelled").length;
  const waitlistedCount = filtered.filter(
    (r) => r.status === "waitlisted"
  ).length;

  // Select all / deselect all filtered
  function toggleSelectAll() {
    const filteredIds = filtered.map((r) => r.id);
    const allSelected = filteredIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function exportCSVForRows(rows: Registration[]) {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Church",
      "Role",
      "City",
      "Country",
      "Dietary",
      "How Heard",
      "Special Needs",
      "Status",
      "Event",
      "Registered At",
    ];

    const csvRows = rows.map((reg) => [
      reg.contact?.first_name ?? "",
      reg.contact?.last_name ?? "",
      reg.contact?.email ?? "",
      reg.contact?.phone ?? "",
      reg.church_name ?? reg.contact?.church_name ?? "",
      reg.church_role ?? "",
      reg.city ?? "",
      reg.country ?? "",
      reg.dietary_requirements ?? "",
      reg.how_heard ?? "",
      reg.special_needs ?? "",
      reg.status,
      reg.event?.title ?? "",
      new Date(reg.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    exportCSVForRows(filtered);
  }

  function exportSelected() {
    const selected = filtered.filter((r) => selectedIds.has(r.id));
    exportCSVForRows(selected);
  }

  async function bulkUpdateStatus() {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/registrations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", status: bulkStatus }),
        })
      );
      await Promise.all(promises);
      setSelectedIds(new Set());
      setBulkStatus("");
      router.refresh();
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setBulkUpdating(false);
    }
  }

  const handleStatusChange = useCallback(
    async (reg: Registration, status: string) => {
      try {
        await fetch(`/api/registrations/${reg.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", status }),
        });
        router.refresh();
      } catch (error) {
        console.error("Status update failed:", error);
      }
    },
    [router]
  );

  const filteredIds = filtered.map((r) => r.id);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));

  return (
    <div>
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div
          className="bg-white rounded-lg border p-4"
          style={{ borderLeft: "4px solid #9ca3af" }}
        >
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-sm text-gray-500">Total Registrations</div>
        </div>
        <div
          className="bg-white rounded-lg border p-4"
          style={{ borderLeft: "4px solid #22c55e" }}
        >
          <div className="text-2xl font-bold text-green-700">
            {confirmedCount}
          </div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div
          className="bg-white rounded-lg border p-4"
          style={{ borderLeft: "4px solid #eab308" }}
        >
          <div className="text-2xl font-bold text-yellow-700">
            {pendingCount}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div
          className="bg-white rounded-lg border p-4"
          style={{ borderLeft: "4px solid #ef4444" }}
        >
          <div className="text-2xl font-bold text-red-700">
            {cancelledCount}
          </div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
        <div
          className="bg-white rounded-lg border p-4"
          style={{ borderLeft: "4px solid #3b82f6" }}
        >
          <div className="text-2xl font-bold text-blue-700">
            {waitlistedCount}
          </div>
          <div className="text-sm text-gray-500">Waitlisted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={eventFilter}
          onValueChange={(v: string | null) => {
            if (v) setEventFilter(v);
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((ev) => (
              <SelectItem key={ev.id} value={ev.slug}>
                {ev.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v: string | null) => {
            if (v) setStatusFilter(v);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={countryFilter}
          onValueChange={(v: string | null) => {
            if (v) setCountryFilter(v);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {uniqueCountries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV} className="sm:ml-auto">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={bulkStatus}
              onValueChange={(v: string | null) => {
                if (v) setBulkStatus(v);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Pick status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={bulkUpdateStatus}
              disabled={!bulkStatus || bulkUpdating}
            >
              {bulkUpdating ? "Updating..." : "Update Status"}
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={exportSelected}>
            Export Selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} registration{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Church
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Location
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Event
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? (
                filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={(e) => {
                      // Don't open detail panel if clicking checkbox or action menu
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('input[type="checkbox"]') ||
                        target.closest("[data-action-menu]")
                      ) {
                        return;
                      }
                      setSelectedRegistration(reg);
                    }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(reg.id)}
                        onChange={() => toggleSelect(reg.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {reg.contact?.first_name} {reg.contact?.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.contact?.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.contact?.phone || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.church_name ||
                        reg.contact?.church_name ||
                        "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {[reg.city, reg.country].filter(Boolean).join(", ") ||
                        "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.event?.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={statusColor[reg.status] ?? ""}
                      >
                        {reg.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3" data-action-menu>
                      <RowActionMenu
                        reg={reg}
                        onViewDetails={() => setSelectedRegistration(reg)}
                        onStatusChange={(status) =>
                          handleStatusChange(reg, status)
                        }
                        onEditNote={() => setSelectedRegistration(reg)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-out Panel */}
      {selectedRegistration && (
        <DetailPanel
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onStatusChange={(reg, status) => {
            handleStatusChange(reg, status);
            setSelectedRegistration(null);
          }}
        />
      )}
    </div>
  );
}
