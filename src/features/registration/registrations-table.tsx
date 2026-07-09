"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { Search, ChevronDown, Eye, RefreshCw, FileText, ChevronRight, ArrowRightLeft } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
import { toast } from "sonner";

function FilterDropdown({
  value,
  label,
  options,
  onChange,
}: {
  value: string;
  label: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const activeLabel = options.find((o) => o.value === value)?.label ?? label;
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery(""); }}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors min-w-[160px] ${
          open
            ? "border-cyan-300 ring-2 ring-cyan-100 text-gray-900"
            : value !== "all"
              ? "border-cyan-200 bg-cyan-50 text-cyan-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
        }`}
      >
        {activeLabel}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[220px]">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    opt.value === value
                      ? "bg-cyan-50 text-cyan-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <p className="px-4 py-2.5 text-sm text-gray-400">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Sync notes when registration changes
  useEffect(() => {
    setEditingNotes(registration.notes ?? "");
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
    try {
      const res = await fetch(`/api/registrations/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_notes", notes: editingNotes }),
      });
      if (res.ok) {
        toast.success("Notes saved");
      } else {
        toast.error("Failed to save notes");
      }
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [actionMenuStatusSub, setActionMenuStatusSub] = useState(false);

  // Unique countries for filter dropdown
  const uniqueCountries = useMemo(() =>
    Array.from(
      new Set(
        registrations
          .map((reg) => reg.country)
          .filter((c): c is string => Boolean(c))
      )
    ).sort(),
    [registrations]
  );

  const filtered = useMemo(() =>
    registrations.filter((reg) => {
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
    }),
    [registrations, search, eventFilter, statusFilter, countryFilter]
  );

  // Stat counts from filtered data (single pass)
  const { totalCount, confirmedCount, pendingCount, cancelledCount, waitlistedCount } = useMemo(() => {
    const counts = { totalCount: filtered.length, confirmedCount: 0, pendingCount: 0, cancelledCount: 0, waitlistedCount: 0 };
    for (const r of filtered) {
      if (r.status === "confirmed") counts.confirmedCount++;
      else if (r.status === "pending") counts.pendingCount++;
      else if (r.status === "cancelled") counts.cancelledCount++;
      else if (r.status === "waitlisted") counts.waitlistedCount++;
    }
    return counts;
  }, [filtered]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNum = Math.min(page, totalPages);
  const startIndex = (safePageNum - 1) * pageSize;
  const endIndex = Math.min(safePageNum * pageSize, totalCount);
  const paginatedRows = filtered.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, eventFilter, statusFilter, countryFilter]);


  async function handleResendEmail(regId: string) {
    setActionMenu(null);
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_email" }),
      });
      if (res.ok) {
        toast.success("Confirmation email sent");
      } else {
        toast.error("Failed to send email");
      }
    } catch {
      toast.error("Failed to send email");
    }
  }

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
    const ids = Array.from(selectedIds);
    const count = ids.length;
    setBulkUpdating(true);
    try {
      let failed = 0;
      // Batch in groups of 10 to avoid connection saturation
      for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);
        const results = await Promise.all(
          batch.map((id) =>
            fetch(`/api/registrations/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "update_status", status: bulkStatus }),
            })
          )
        );
        failed += results.filter((r) => !r.ok).length;
      }
      setSelectedIds(new Set());
      setBulkStatus("");
      router.refresh();
      if (failed > 0) {
        toast.error(`${failed} of ${count} updates failed`);
      } else {
        toast.success(`${count} registration${count !== 1 ? "s" : ""} updated to ${bulkStatus}`);
      }
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setBulkUpdating(false);
    }
  }

  const handleStatusChange = useCallback(
    async (reg: Registration, status: string) => {
      try {
        const res = await fetch(`/api/registrations/${reg.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", status }),
        });
        if (res.ok) {
          toast.success(`Status updated to ${status}`);
          router.refresh();
        } else {
          toast.error("Failed to update status");
        }
      } catch {
        toast.error("Failed to update status");
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Registrations</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Confirmed</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{confirmedCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Pending</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100 text-yellow-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Cancelled</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{cancelledCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Waitlisted</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{waitlistedCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters — Constant Contact style */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search input with icon */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="pl-9 pr-4 h-[42px] min-w-[260px] rounded-lg border-gray-200"
          />
        </div>

        <FilterDropdown
          value={eventFilter}
          label="All Events"
          options={[
            { value: "all", label: "All Events" },
            ...events.map((ev) => ({ value: ev.slug, label: ev.title })),
          ]}
          onChange={setEventFilter}
        />

        <FilterDropdown
          value={statusFilter}
          label="All Statuses"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "cancelled", label: "Cancelled" },
            { value: "waitlisted", label: "Waitlisted" },
          ]}
          onChange={setStatusFilter}
        />

        <FilterDropdown
          value={countryFilter}
          label="All Countries"
          options={[
            { value: "all", label: "All Countries" },
            ...uniqueCountries.map((c) => ({ value: c, label: c })),
          ]}
          onChange={setCountryFilter}
        />

        <Button variant="outline" onClick={exportCSV} className="sm:ml-auto rounded-lg h-[42px]">
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
      <div className="bg-white rounded-xl border" style={{ overflow: "visible" }}>
        <div>
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
                <th className="px-4 py-3 font-medium text-gray-600 sticky right-0 bg-gray-50">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((reg) => (
                  <tr
                    key={reg.id}
                    className="group/row hover:bg-gray-50/50 cursor-pointer"
                    onClick={(e) => {
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
                    <td className="px-4 py-3 sticky right-0 bg-white group-hover/row:bg-gray-50" data-action-menu>
                      <ActionMenu
                        open={actionMenu === reg.id}
                        onToggle={() => {
                          setActionMenu(actionMenu === reg.id ? null : reg.id);
                          setActionMenuStatusSub(false);
                        }}
                        onClose={() => { setActionMenu(null); setActionMenuStatusSub(false); }}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegistration(reg);
                            setActionMenu(null);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <div
                          className="relative"
                          onMouseEnter={() => setActionMenuStatusSub(true)}
                          onMouseLeave={() => setActionMenuStatusSub(false)}
                        >
                          <button
                            type="button"
                            className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuStatusSub((prev) => !prev);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <ArrowRightLeft className="w-4 h-4" />
                              Change Status
                            </span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </button>
                          {actionMenuStatusSub && (
                            <div className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-white shadow-lg py-1 z-[80]">
                              {STATUS_OPTIONS.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 capitalize ${
                                    reg.status === s
                                      ? "font-semibold text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(reg, s);
                                    setActionMenu(null);
                                    setActionMenuStatusSub(false);
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
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegistration(reg);
                            setActionMenu(null);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Add/Edit Note
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResendEmail(reg.id);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Resend Email
                        </button>
                      </ActionMenu>
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

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {startIndex + 1}–{endIndex} of {totalCount}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v: string | null) => {
                      if (v) {
                        setPageSize(Number(v));
                        setPage(1);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[70px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50, 100].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={safePageNum <= 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePageNum <= 1}
                >
                  Prev
                </Button>
                <span className="px-3 text-sm text-gray-600">
                  {safePageNum} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePageNum >= totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={safePageNum >= totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
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
