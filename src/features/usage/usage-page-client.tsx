"use client";

import { useState, useTransition } from "react";
import { getUsageData } from "./actions";
import type { UsageData } from "./types";

function UsageGauge({
  label,
  percentage,
  used,
  limit,
}: {
  label: string;
  percentage: number;
  used: string;
  limit: string;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  let color = "text-emerald-500";
  let bgRing = "text-emerald-100";
  if (percentage >= 80) {
    color = "text-red-500";
    bgRing = "text-red-100";
  } else if (percentage >= 50) {
    color = "text-yellow-500";
    bgRing = "text-yellow-100";
  }

  return (
    <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            strokeWidth="12"
            className={`stroke-current ${bgRing}`}
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`stroke-current ${color} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{label}</h3>
      <p className="text-xs text-gray-500">
        {used} / {limit}
      </p>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active)
    return (
      <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 8l5-5 5 5H5zm0 4l5 5 5-5H5z" />
      </svg>
    );
  return (
    <svg className="w-3 h-3 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
      {dir === "asc" ? (
        <path d="M5 12l5-5 5 5H5z" />
      ) : (
        <path d="M5 8l5 5 5-5H5z" />
      )}
    </svg>
  );
}

type SortKey = "name" | "total_size" | "row_estimate";

export function UsagePageClient({ initialData }: { initialData: UsageData }) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("total_size");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleRefresh() {
    startTransition(async () => {
      const fresh = await getUsageData();
      setData(fresh);
    });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedTables = [...(data.database.tables ?? [])].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return mul * a.name.localeCompare(b.name);
    return mul * (a[sortKey] - b[sortKey]);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Usage</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Last updated:{" "}
            {new Date(data.fetched_at).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isPending ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Supabase Free Tier</span> — 500 MB
          database, 1 GB file storage, 5 GB bandwidth/month.
        </p>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <UsageGauge
          label="Database"
          percentage={data.database.percentage}
          used={data.database.total_size_pretty}
          limit={data.database.limit_pretty}
        />
        <UsageGauge
          label="File Storage"
          percentage={data.storage.percentage}
          used={data.storage.total_size_pretty}
          limit={data.storage.limit_pretty}
        />
      </div>

      {/* Storage Buckets */}
      <div className="bg-white rounded-xl border mb-8">
        <div className="px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">
            Storage Buckets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b bg-gray-50">
                <th className="px-5 py-3 font-medium">Bucket</th>
                <th className="px-5 py-3 font-medium">Visibility</th>
                <th className="px-5 py-3 font-medium text-right">Files</th>
                <th className="px-5 py-3 font-medium text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.storage.buckets.map((bucket) => (
                <tr key={bucket.name} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {bucket.name}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        bucket.public
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bucket.public ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {bucket.file_count}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {bucket.total_size_pretty}
                  </td>
                </tr>
              ))}
              {data.storage.buckets.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No storage buckets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Tables */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">
            Database Tables
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {sortedTables.length} tables
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b bg-gray-50">
                <th className="px-5 py-3 font-medium">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-gray-700"
                  >
                    Table
                    <SortIcon
                      active={sortKey === "name"}
                      dir={sortDir}
                    />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium text-right">
                  <button
                    onClick={() => handleSort("total_size")}
                    className="inline-flex items-center gap-1 hover:text-gray-700 ml-auto"
                  >
                    Total Size
                    <SortIcon
                      active={sortKey === "total_size"}
                      dir={sortDir}
                    />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium text-right">Data Size</th>
                <th className="px-5 py-3 font-medium text-right">
                  <button
                    onClick={() => handleSort("row_estimate")}
                    className="inline-flex items-center gap-1 hover:text-gray-700 ml-auto"
                  >
                    Est. Rows
                    <SortIcon
                      active={sortKey === "row_estimate"}
                      dir={sortDir}
                    />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTables.map((table) => (
                <tr key={table.name} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-900">
                    {table.name}
                  </td>
                  <td className="px-5 py-2.5 text-right text-gray-600">
                    {table.total_size_pretty}
                  </td>
                  <td className="px-5 py-2.5 text-right text-gray-600">
                    {table.table_size_pretty}
                  </td>
                  <td className="px-5 py-2.5 text-right text-gray-600">
                    {table.row_estimate.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
