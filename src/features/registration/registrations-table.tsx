"use client";

import { useState } from "react";
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
  created_at: string;
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

export function RegistrationsTable({ registrations, events }: Props) {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      !search ||
      `${reg.contact?.first_name} ${reg.contact?.last_name} ${reg.contact?.email}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesEvent =
      eventFilter === "all" || reg.event?.slug === eventFilter;

    return matchesSearch && matchesEvent;
  });

  function exportCSV() {
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

    const rows = filtered.map((reg) => [
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
      ...rows.map((row) =>
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

  const statusColor: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    waitlisted: "bg-blue-100 text-blue-800",
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={eventFilter} onValueChange={(v: string | null) => { if (v) setEventFilter(v); }}>
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
        <Button variant="outline" onClick={exportCSV} className="sm:ml-auto">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
      </div>

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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Church</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? (
                filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {reg.contact?.first_name} {reg.contact?.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.contact?.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.contact?.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.church_name || reg.contact?.church_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {[reg.city, reg.country].filter(Boolean).join(", ") || "—"}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
