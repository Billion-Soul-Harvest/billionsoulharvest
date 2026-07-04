"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { SegmentFilter } from "@/shared/types/database";

interface RecipientContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_type: string;
}

interface Props {
  campaignId: string;
  filter: SegmentFilter;
  refreshKey: number;
}

export function RecipientPreview({ campaignId, filter, refreshKey }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [contacts, setContacts] = useState<RecipientContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecipients() {
      setLoading(true);
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/recipients`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCount(data.count);
          setContacts(data.contacts);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Only fetch if there are any active filters or contact_ids
    const hasFilters = Object.values(filter).some((v) =>
      Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
    );

    if (hasFilters) {
      fetchRecipients();
    } else {
      setCount(0);
      setContacts([]);
    }

    return () => { cancelled = true; };
  }, [campaignId, refreshKey, filter]);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium text-gray-700">Recipients</h3>
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600" />
        ) : count !== null ? (
          <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">
            {count.toLocaleString()} contact{count !== 1 ? "s" : ""}
          </Badge>
        ) : null}
      </div>

      {contacts.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Email</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 text-gray-900">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{c.email}</td>
                  <td className="px-3 py-2">
                    <span className="capitalize text-gray-600">{c.contact_type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {count !== null && count > 50 && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
              Showing first 50 of {count.toLocaleString()} recipients
            </div>
          )}
        </div>
      )}

      {!loading && count === 0 && (
        <p className="text-sm text-gray-400">
          No contacts match the current filters. Adjust your segment to include recipients.
        </p>
      )}
    </div>
  );
}
