"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/features/fund/utils/format-currency";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_CATEGORY_LABELS, CAMPAIGN_CATEGORIES } from "@/features/fund/constants";
import type { FundCampaign, FundCampaignStatus, FundCampaignCategory } from "@/features/fund/types";

const PAGE_SIZE = 10;

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<FundCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FundCampaignStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FundCampaignCategory | "all">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not_featured">("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "most_funded" | "most_donors" | "goal_high" | "goal_low">("recent");

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [goalMin, setGoalMin] = useState("");
  const [goalMax, setGoalMax] = useState("");
  const [raisedMin, setRaisedMin] = useState("");
  const [raisedMax, setRaisedMax] = useState("");
  const [donorMin, setDonorMin] = useState("");
  const [donorMax, setDonorMax] = useState("");

  // Pending review count (fetched once)
  const [pendingCount, setPendingCount] = useState(0);
  const pendingFetched = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Build query string from filters
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("all", "true");
    params.set("limit", String(PAGE_SIZE));
    params.set("page", String(page));

    if (statusFilter !== "all") params.set("status", statusFilter);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (featuredFilter === "featured") params.set("featured", "true");
    if (featuredFilter === "not_featured") params.set("featured", "false");
    if (sortBy !== "recent") params.set("sort", sortBy);

    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (goalMin) params.set("goal_min", String(Math.round(parseFloat(goalMin) * 100)));
    if (goalMax) params.set("goal_max", String(Math.round(parseFloat(goalMax) * 100)));
    if (raisedMin) params.set("raised_min", String(Math.round(parseFloat(raisedMin) * 100)));
    if (raisedMax) params.set("raised_max", String(Math.round(parseFloat(raisedMax) * 100)));
    if (donorMin) params.set("donor_min", donorMin);
    if (donorMax) params.set("donor_max", donorMax);

    return params.toString();
  }, [page, statusFilter, debouncedSearch, categoryFilter, featuredFilter, sortBy, dateFrom, dateTo, goalMin, goalMax, raisedMin, raisedMax, donorMin, donorMax]);

  // Fetch campaigns from API
  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    fetch(`/api/fund/campaigns?${buildQueryString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data.campaigns || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [buildQueryString]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Fetch pending count once
  useEffect(() => {
    if (pendingFetched.current) return;
    pendingFetched.current = true;
    fetch("/api/fund/campaigns?all=true&status=pending_review&limit=0")
      .then((res) => res.json())
      .then((data) => setPendingCount(data.total || 0))
      .catch(() => {});
  }, []);

  async function updateStatus(id: string, status: FundCampaignStatus) {
    try {
      await fetch(`/api/fund/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status } : c)));
      if (status === "active" || status === "rejected") {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent fail
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await fetch(`/api/fund/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !current }),
      });
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, is_featured: !current } : c)));
    } catch {
      // Silent fail
    }
  }

  const hasActiveFilters = debouncedSearch || categoryFilter !== "all" || featuredFilter !== "all" ||
    dateFrom || dateTo || goalMin || goalMax || raisedMin || raisedMax || donorMin || donorMax || sortBy !== "recent";

  function clearAllFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategoryFilter("all");
    setFeaturedFilter("all");
    setDateFrom("");
    setDateTo("");
    setGoalMin("");
    setGoalMax("");
    setRaisedMin("");
    setRaisedMax("");
    setDonorMin("");
    setDonorMax("");
    setSortBy("recent");
    setPage(1);
  }

  // Reset page when filters change (except search which has its own reset)
  function handleFilterChange<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
        <span className="text-sm text-gray-500">
          {total === 0 ? "No campaigns" : `${showingFrom}–${showingTo} of ${total}`}
        </span>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending_review", "active", "draft", "paused", "completed", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(setStatusFilter, s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All" : CAMPAIGN_STATUS_LABELS[s]}
            {s === "pending_review" && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Basic filters */}
      <div className="bg-white rounded-xl border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value as FundCampaignCategory | "all")}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            <option value="all">All Categories</option>
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CAMPAIGN_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          {/* Featured */}
          <select
            value={featuredFilter}
            onChange={(e) => handleFilterChange(setFeaturedFilter, e.target.value as "all" | "featured" | "not_featured")}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            <option value="all">All (Featured)</option>
            <option value="featured">Featured Only</option>
            <option value="not_featured">Not Featured</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange(setSortBy, e.target.value as typeof sortBy)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            <option value="recent">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_funded">Most Funded</option>
            <option value="most_donors">Most Donors</option>
            <option value="goal_high">Goal: High to Low</option>
            <option value="goal_low">Goal: Low to High</option>
          </select>
        </div>

        {/* Advanced filters toggle + clear */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
          >
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Advanced Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Created From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Created To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Goal Min ($)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={goalMin}
                onChange={(e) => handleFilterChange(setGoalMin, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Goal Max ($)</label>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={goalMax}
                onChange={(e) => handleFilterChange(setGoalMax, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Raised Min ($)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={raisedMin}
                onChange={(e) => handleFilterChange(setRaisedMin, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Raised Max ($)</label>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={raisedMax}
                onChange={(e) => handleFilterChange(setRaisedMax, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Donors Min</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={donorMin}
                onChange={(e) => handleFilterChange(setDonorMin, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Donors Max</label>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={donorMax}
                onChange={(e) => handleFilterChange(setDonorMax, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Campaign list */}
      <div className="bg-white rounded-xl border divide-y">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No campaigns found.</div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/fund/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-cyan-700 truncate">
                    {c.title}
                  </Link>
                  {c.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    c.status === "active" ? "bg-green-100 text-green-700" :
                    c.status === "pending_review" ? "bg-yellow-100 text-yellow-700" :
                    c.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {CAMPAIGN_STATUS_LABELS[c.status]}
                  </span>
                  <span>{CAMPAIGN_CATEGORY_LABELS[c.category]}</span>
                  <span>{formatCents(c.raised_cents)} / {formatCents(c.goal_cents)}</span>
                  <span>{c.donor_count} donors</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => toggleFeatured(c.id, c.is_featured)}>
                  {c.is_featured ? "Unfeature" : "Feature"}
                </Button>
                {c.status === "pending_review" && (
                  <>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(c.id, "active")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(c.id, "rejected")}>
                      Reject
                    </Button>
                  </>
                )}
                {c.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "paused")}>Pause</Button>
                )}
                {c.status === "paused" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "active")}>Resume</Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "ellipsis" ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-1 text-sm text-gray-400">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={p === page ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
