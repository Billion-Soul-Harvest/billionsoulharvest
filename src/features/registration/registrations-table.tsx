"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, Eye, RefreshCw, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowRightLeft, Trash2, Settings2, X } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
import { SendEmailDialog } from "@/features/emails/send-email-dialog";
import { toast } from "sonner";
import { AllCommunityModule, themeQuartz } from "ag-grid-community";
import type { ColDef, SelectionChangedEvent, RowClickedEvent, ICellRendererParams, SortChangedEvent } from "ag-grid-community";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import { AgGridReact, AgGridProvider } from "ag-grid-react";

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
  contact_id: string;
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
  events: EventOption[];
}

const STATUS_OPTIONS = ["confirmed", "pending", "cancelled", "waitlisted"] as const;

const statusColor: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  waitlisted: "bg-blue-100 text-blue-800",
};

const registrationsGridTheme = themeQuartz.withParams({
  backgroundColor: "#ffffff",
  headerBackgroundColor: "#f9fafb",
  headerFontSize: 13,
  fontSize: 14,
  borderRadius: 12,
  spacing: 6,
  headerFontWeight: 500,
  rowBorder: { color: "#f3f4f6" },
  selectedRowBackgroundColor: "rgba(6, 182, 212, 0.08)",
});

function StatusCellRenderer(params: ICellRendererParams<Registration>) {
  if (!params.data) return null;
  const status = params.data.status;
  return (
    <Badge variant="secondary" className={statusColor[status] ?? ""}>
      {status}
    </Badge>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActionsCellRenderer(params: ICellRendererParams<Registration> & { context: any }) {
  const reg = params.data;
  const [open, setOpen] = useState(false);
  const [statusSubOpen, setStatusSubOpen] = useState(false);
  if (!reg) return null;
  const ctx = params.context;

  const close = () => { setOpen(false); setStatusSubOpen(false); };

  return (
    <div data-action-menu>
      <ActionMenu
        open={open}
        onToggle={() => { setOpen((prev) => !prev); setStatusSubOpen(false); }}
        onClose={close}
      >
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          onClick={(e) => { e.stopPropagation(); ctx.setSelectedRegistration(reg); close(); }}
        >
          <Eye className="w-4 h-4" /> View Details
        </button>
        <div
          className="relative"
          onMouseEnter={() => setStatusSubOpen(true)}
          onMouseLeave={() => setStatusSubOpen(false)}
        >
          <button
            type="button"
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            onClick={(e) => { e.stopPropagation(); setStatusSubOpen((prev) => !prev); }}
          >
            <span className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Change Status</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
          {statusSubOpen && (
            <div className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-white shadow-lg py-1 z-[80]">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 capitalize ${reg.status === s ? "font-semibold text-gray-900" : "text-gray-700"}`}
                  onClick={(e) => { e.stopPropagation(); ctx.handleStatusChange(reg, s); close(); }}
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
          onClick={(e) => { e.stopPropagation(); ctx.setSelectedRegistration(reg); close(); }}
        >
          <FileText className="w-4 h-4" /> Add/Edit Note
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          onClick={(e) => { e.stopPropagation(); ctx.handleResendEmail(reg.id); }}
        >
          <RefreshCw className="w-4 h-4" /> Resend Email
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
          onClick={(e) => { e.stopPropagation(); close(); ctx.setDeleteConfirm({ type: "single", id: reg.id }); }}
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </ActionMenu>
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

// Base (static) column settings — always available
const BASE_COLUMN_SETTINGS: { key: string; label: string; defaultVisible: boolean }[] = [
  { key: "name", label: "Name", defaultVisible: true },
  { key: "email", label: "Email", defaultVisible: true },
  { key: "phone", label: "Phone", defaultVisible: true },
  { key: "church", label: "Church", defaultVisible: true },
  { key: "location", label: "Location", defaultVisible: true },
  { key: "event", label: "Event", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "date", label: "Date", defaultVisible: true },
];

// Format a camelCase/snake_case key into a human-readable label
function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function PaginationFooter({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Rows per page:</span>
        <select
          className="border rounded px-2 py-1 text-sm bg-white"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm">
          {totalCount === 0
            ? "No rows"
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export function RegistrationsTable({ events }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  // const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single"; id: string } | { type: "bulk" } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [bulkStatusSubOpen, setBulkStatusSubOpen] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);
  const [tableSettingsOpen, setTableSettingsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(BASE_COLUMN_SETTINGS.filter((c) => c.defaultVisible).map((c) => c.key))
  );

  // Server-side data state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, waitlisted: 0 });
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const gridRef = useRef<AgGridReactType<Registration>>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [eventFilter, countryFilter]);

  // Fetch registrations from API
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortField,
        sortDir,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (eventFilter !== "all") params.set("event", eventFilter);
      if (countryFilter !== "all") params.set("country", countryFilter);

      const res = await fetch(`/api/registrations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setRegistrations(data.rows);
      setTotalCount(data.totalCount);
      setStats(data.stats);
      setUniqueCountries(data.uniqueCountries);
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, eventFilter, countryFilter, sortField, sortDir]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Discover custom field keys from all loaded registrations
  const customFieldKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const reg of registrations) {
      if (reg.custom_fields) {
        for (const k of Object.keys(reg.custom_fields)) {
          keys.add(k);
        }
      }
    }
    return Array.from(keys).sort();
  }, [registrations]);

  // Combined column settings: base + custom fields
  const allColumnSettings = useMemo(() => [
    ...BASE_COLUMN_SETTINGS,
    ...customFieldKeys.map((key) => ({
      key: `cf_${key}`,
      label: formatFieldLabel(key),
      defaultVisible: false,
    })),
  ], [customFieldKeys]);

  const confirmedCount = stats.confirmed;
  // const pendingCount = stats.pending;
  // const cancelledCount = stats.cancelled;
  // const waitlistedCount = stats.waitlisted;

  // Close bulk actions dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(e.target as Node)) {
        setActionsDropdownOpen(false);
        setBulkStatusSubOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleResendEmail(regId: string) {
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
    exportCSVForRows(registrations);
  }

  function exportSelected() {
    const selected = registrations.filter((r) => selectedIds.has(r.id));
    exportCSVForRows(selected);
  }

  async function bulkUpdateStatus(targetStatus: string) {
    if (!targetStatus || selectedIds.size === 0) return;
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
              body: JSON.stringify({ action: "update_status", status: targetStatus }),
            })
          )
        );
        failed += results.filter((r) => !r.ok).length;
      }
      setSelectedIds(new Set());
      fetchRegistrations();
      if (failed > 0) {
        toast.error(`${failed} of ${count} updates failed`);
      } else {
        toast.success(`${count} registration${count !== 1 ? "s" : ""} updated to ${targetStatus}`);
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
          fetchRegistrations();
        } else {
          toast.error("Failed to update status");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [fetchRegistrations]
  );

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const idsToDelete = deleteConfirm.type === "single"
        ? [deleteConfirm.id]
        : Array.from(selectedIds);

      let failed = 0;
      for (let i = 0; i < idsToDelete.length; i += 10) {
        const batch = idsToDelete.slice(i, i + 10);
        const results = await Promise.all(
          batch.map((id) => fetch(`/api/registrations/${id}`, { method: "DELETE" }))
        );
        failed += results.filter((r) => !r.ok).length;
      }

      if (failed > 0) {
        toast.error(`${failed} of ${idsToDelete.length} deletions failed`);
      } else {
        toast.success(`${idsToDelete.length} registration${idsToDelete.length !== 1 ? "s" : ""} deleted`);
      }
      if (deleteConfirm.type === "bulk") {
        setSelectedIds(new Set());
      }
      fetchRegistrations();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  // Deduplicated contact IDs from selected registrations (a contact may have multiple registrations)
  const selectedContactIds = useMemo(() =>
    Array.from(new Set(
      registrations
        .filter((r) => selectedIds.has(r.id) && r.contact_id)
        .map((r) => r.contact_id)
    )),
    [registrations, selectedIds]
  );

  // --- AG Grid column definitions ---
  const columnDefs = useMemo<ColDef<Registration>[]>(() => {
    const baseCols: ColDef<Registration>[] = [
      {
        colId: "name",
        headerName: "Name",
        valueGetter: (p) => `${p.data?.contact?.first_name ?? ""} ${p.data?.contact?.last_name ?? ""}`.trim(),
        minWidth: 130,
        flex: 1,
        filter: true,
        hide: !visibleColumns.has("name"),
      },
      {
        colId: "email",
        headerName: "Email",
        valueGetter: (p) => p.data?.contact?.email ?? "",
        minWidth: 160,
        flex: 1,
        filter: true,
        hide: !visibleColumns.has("email"),
      },
      {
        colId: "phone",
        headerName: "Phone",
        valueGetter: (p) => p.data?.contact?.phone || "\u2014",
        minWidth: 120,
        flex: 0.8,
        filter: true,
        hide: !visibleColumns.has("phone"),
      },
      {
        colId: "church",
        headerName: "Church",
        valueGetter: (p) => p.data?.church_name || p.data?.contact?.church_name || "\u2014",
        minWidth: 120,
        flex: 1,
        filter: true,
        hide: !visibleColumns.has("church"),
      },
      {
        colId: "location",
        headerName: "Location",
        valueGetter: (p) => [p.data?.city, p.data?.country].filter(Boolean).join(", ") || "\u2014",
        minWidth: 110,
        flex: 0.8,
        filter: true,
        hide: !visibleColumns.has("location"),
      },
      {
        colId: "event",
        headerName: "Event",
        valueGetter: (p) => p.data?.event?.title ?? "",
        minWidth: 140,
        flex: 1,
        filter: true,
        hide: !visibleColumns.has("event"),
      },
      {
        colId: "status",
        headerName: "Status",
        field: "status",
        cellRenderer: StatusCellRenderer,
        minWidth: 100,
        flex: 0.6,
        filter: true,
        hide: !visibleColumns.has("status"),
      },
      {
        colId: "date",
        headerName: "Date",
        valueGetter: (p) => p.data ? new Date(p.data.created_at).toLocaleDateString() : "",
        minWidth: 90,
        flex: 0.6,
        filter: true,
        hide: !visibleColumns.has("date"),
      },
    ];

    // Dynamic custom field columns (not sortable server-side since they're in JSONB)
    const customCols: ColDef<Registration>[] = customFieldKeys.map((key) => ({
      colId: `cf_${key}`,
      headerName: formatFieldLabel(key),
      valueGetter: (p: { data?: Registration }) => {
        const val = p.data?.custom_fields?.[key];
        if (val == null) return "\u2014";
        if (typeof val === "boolean") return val ? "Yes" : "No";
        return String(val);
      },
      minWidth: 120,
      flex: 0.8,
      filter: true,
      sortable: false,
      hide: !visibleColumns.has(`cf_${key}`),
    }));

    const actionCol: ColDef<Registration> = {
      headerName: "",
      cellRenderer: ActionsCellRenderer,
      minWidth: 60,
      maxWidth: 60,
      sortable: false,
      filter: false,
      resizable: false,
      pinned: "right" as const,
    };

    return [...baseCols, ...customCols, actionCol];
  }, [visibleColumns, customFieldKeys]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
  }), []);

  // --- AG Grid event handlers ---
  const onSelectionChanged = useCallback((event: SelectionChangedEvent<Registration>) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedIds(new Set(selectedRows.map((r) => r.id)));
  }, []);

  const onRowClicked = useCallback((event: RowClickedEvent<Registration>) => {
    const target = event.event?.target as HTMLElement | undefined;
    if (target?.closest('input[type="checkbox"]') || target?.closest("[data-action-menu]")) return;
    if (event.data) setSelectedRegistration(event.data);
  }, []);

  const onSortChanged = useCallback((event: SortChangedEvent<Registration>) => {
    const colState = event.api.getColumnState();
    const sorted = colState.find((c) => c.sort);
    if (sorted && sorted.colId) {
      setSortField(sorted.colId);
      setSortDir(sorted.sort === "asc" ? "asc" : "desc");
    } else {
      setSortField("date");
      setSortDir("desc");
    }
    setPage(1);
  }, []);

  // --- AG Grid context (pass functions to cell renderers) ---
  const gridContext = useMemo(() => ({
    setSelectedRegistration,
    handleStatusChange,
    handleResendEmail,
    setDeleteConfirm,
  }), [handleStatusChange]);

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
        {/* <div className="bg-white rounded-xl border p-4">
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
        </div> */}
      </div>

      {/* Filters -- Constant Contact style */}
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

        {/* <FilterDropdown
          value={statusFilter}
          label="All Statuses"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "confirmed", label: "Confirmed" },
            // { value: "pending", label: "Pending" },
            // { value: "cancelled", label: "Cancelled" },
            // { value: "waitlisted", label: "Waitlisted" },
          ]}
          onChange={setStatusFilter}
        /> */}

        <FilterDropdown
          value={countryFilter}
          label="All Countries"
          options={[
            { value: "all", label: "All Countries" },
            ...uniqueCountries.map((c) => ({ value: c, label: c })),
          ]}
          onChange={setCountryFilter}
        />

        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" onClick={() => setTableSettingsOpen(true)} className="rounded-lg h-[42px]">
            <Settings2 className="w-4 h-4 mr-2" />
            Table Settings
          </Button>
          <Button variant="outline" onClick={exportCSV} className="rounded-lg h-[42px]">
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
      </div>

      {/* Selected bar with Actions dropdown */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-gray-900">Selected registrations</p>
            <span className="text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2.5 py-0.5">
              {selectedIds.size.toLocaleString()}
            </span>
          </div>
          <div className="relative" ref={actionsDropdownRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActionsDropdownOpen((prev) => !prev); setBulkStatusSubOpen(false); }}
              className="gap-1"
            >
              Actions
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            {actionsDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => { setSendEmailOpen(true); setActionsDropdownOpen(false); }}
                >
                  Send Campaign
                </button>
                <div className="h-px bg-gray-100 mx-2" />
                <div
                  className="relative"
                  onMouseEnter={() => setBulkStatusSubOpen(true)}
                  onMouseLeave={() => setBulkStatusSubOpen(false)}
                >
                  <button
                    type="button"
                    className="flex items-center justify-between gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setBulkStatusSubOpen((prev) => !prev)}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      Update Status
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </button>
                  {bulkStatusSubOpen && (
                    <div className="absolute left-full top-0 ml-1 w-40 rounded-lg border bg-white shadow-lg py-1 z-[80]">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                          onClick={() => {
                            bulkUpdateStatus(s);
                            setActionsDropdownOpen(false);
                            setBulkStatusSubOpen(false);
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="h-px bg-gray-100 mx-2" />
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => { exportSelected(); setActionsDropdownOpen(false); }}
                >
                  Export selection
                </button>
                <div className="h-px bg-gray-100 mx-2" />
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => { setDeleteConfirm({ type: "bulk" }); setActionsDropdownOpen(false); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* AG Grid Table — hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <div style={{ height: 600, width: "100%" }}>
          <AgGridProvider modules={[AllCommunityModule]}>
            <AgGridReact<Registration>
              ref={gridRef}
              theme={registrationsGridTheme}
              rowData={registrations}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
              pagination={false}
              onSelectionChanged={onSelectionChanged}
              onRowClicked={onRowClicked}
              onSortChanged={onSortChanged}
              getRowId={(params) => params.data.id}
              context={gridContext}
              suppressCellFocus={true}
              loading={loading}
              noRowsOverlayComponent={() => (
                <div className="text-center text-gray-400 py-12">No registrations found</div>
              )}
            />
          </AgGridProvider>
        </div>

        {/* Pagination Footer — desktop */}
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>

      {/* Mobile Card List — shown only on mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No registrations found</div>
        ) : (
          registrations.map((reg) => {
            const fullName = `${reg.contact?.first_name ?? ""} ${reg.contact?.last_name ?? ""}`.trim();
            const location = [reg.city, reg.country].filter(Boolean).join(", ");
            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border p-4 space-y-2 active:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedRegistration(reg)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{fullName || "—"}</p>
                    <p className="text-sm text-gray-500 truncate">{reg.contact?.email || "—"}</p>
                  </div>
                  <Badge variant="secondary" className={`${statusColor[reg.status] ?? ""} shrink-0 capitalize`}>
                    {reg.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {reg.event?.title && (
                    <span className="truncate max-w-[200px]">{reg.event.title}</span>
                  )}
                  {location && <span>{location}</span>}
                  <span>{new Date(reg.created_at).toLocaleDateString()}</span>
                </div>
                {(reg.church_name || reg.contact?.church_name) && (
                  <p className="text-xs text-gray-400 truncate">
                    {reg.church_name || reg.contact?.church_name}
                  </p>
                )}
                {/* Show visible custom fields */}
                {reg.custom_fields && customFieldKeys.filter((k) => visibleColumns.has(`cf_${k}`)).length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1 border-t border-gray-100">
                    {customFieldKeys
                      .filter((k) => visibleColumns.has(`cf_${k}`) && reg.custom_fields?.[k] != null)
                      .map((k) => {
                        const val = reg.custom_fields![k];
                        const display = typeof val === "boolean" ? (val ? "Yes" : "No") : String(val);
                        return (
                          <span key={k}>
                            <span className="text-gray-400">{formatFieldLabel(k)}:</span> {display}
                          </span>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination Footer — mobile */}
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[80]" onClick={() => !deleting && setDeleteConfirm(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border p-6 w-full max-w-md z-[90]">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Registration{deleteConfirm.type === "bulk" ? "s" : ""}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {deleteConfirm.type === "single"
                ? "Are you sure you want to delete this registration? This action cannot be undone."
                : `Are you sure you want to delete ${selectedIds.size} registration${selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </>
      )}

      <SendEmailDialog
        open={sendEmailOpen}
        onOpenChange={setSendEmailOpen}
        contactIds={selectedContactIds}
        selectAllMode={false}
        recipientCount={selectedContactIds.length}
        onSuccess={() => {
          setSelectedIds(new Set());
        }}
      />

      {/* Table Settings Panel */}
      {tableSettingsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setTableSettingsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-[320px] bg-white z-50 shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Table settings</h2>
              <button
                type="button"
                onClick={() => setTableSettingsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Close table settings"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 73px)" }}>
              {allColumnSettings.map((col, i) => (
                <React.Fragment key={col.key}>
                  {i === BASE_COLUMN_SETTINGS.length && customFieldKeys.length > 0 && (
                    <div className="pt-3 pb-1 px-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Fields</p>
                    </div>
                  )}
                  <label
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(col.key)}
                      onChange={() => {
                        setVisibleColumns((prev) => {
                          const next = new Set(prev);
                          if (next.has(col.key)) {
                            if (next.size > 1) next.delete(col.key);
                          } else {
                            next.add(col.key);
                          }
                          return next;
                        });
                      }}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
