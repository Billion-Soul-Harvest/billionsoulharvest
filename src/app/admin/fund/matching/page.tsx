"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCents } from "@/features/fund/utils/format-currency";
import { CAMPAIGN_CATEGORIES, CAMPAIGN_CATEGORY_LABELS } from "@/features/fund/constants";
import type { FundMatchingRule } from "@/features/fund/types";
import { createClient } from "@/shared/utils/supabase/client";

export default function MatchingRulesPage() {
  const [rules, setRules] = useState<FundMatchingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    match_ratio: "1",
    max_match_cents: "",
    total_budget_cents: "",
    category: "",
    starts_at: "",
    ends_at: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("fund_matching_rules")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRules((data ?? []) as FundMatchingRule[]);
        setLoading(false);
      });
  }, []);

  async function handleCreate() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fund_matching_rules")
      .insert({
        match_ratio: parseFloat(form.match_ratio) || 1,
        max_match_cents: form.max_match_cents ? Math.round(parseFloat(form.max_match_cents) * 100) : null,
        total_budget_cents: Math.round(parseFloat(form.total_budget_cents || "0") * 100),
        category: form.category || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        is_active: true,
      })
      .select()
      .single();

    if (!error && data) {
      setRules([data as FundMatchingRule, ...rules]);
      setShowForm(false);
      setForm({ match_ratio: "1", max_match_cents: "", total_budget_cents: "", category: "", starts_at: "", ends_at: "" });
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase
      .from("fund_matching_rules")
      .update({ is_active: !current })
      .eq("id", id);
    setRules(rules.map((r) => (r.id === id ? { ...r, is_active: !current } : r)));
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Matching Rules</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          {showForm ? "Cancel" : "New Rule"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Create Matching Rule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Match Ratio (e.g. 1 = 1:1, 0.5 = 50%)</Label>
              <Input value={form.match_ratio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, match_ratio: e.target.value })} type="number" step="0.01" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Max Match per Donation ($)</Label>
              <Input value={form.max_match_cents} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, max_match_cents: e.target.value })} type="number" placeholder="No limit" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Total Budget ($)</Label>
              <Input value={form.total_budget_cents} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, total_budget_cents: e.target.value })} type="number" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Category (optional)</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All categories</option>
                {CAMPAIGN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CAMPAIGN_CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.starts_at} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, starts_at: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.ends_at} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, ends_at: e.target.value })} className="h-11" />
            </div>
          </div>
          <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white">Create Rule</Button>
        </div>
      )}

      {/* Rules list */}
      <div className="bg-white rounded-xl border divide-y">
        {rules.map((rule) => (
          <div key={rule.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{rule.match_ratio}:1 match</span>
                {rule.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {CAMPAIGN_CATEGORY_LABELS[rule.category]}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  rule.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {rule.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Budget: {formatCents(rule.total_budget_cents)} &middot; Spent: {formatCents(rule.spent_cents)}
                {rule.max_match_cents && ` · Max per donation: ${formatCents(rule.max_match_cents)}`}
                {rule.starts_at && ` · From: ${new Date(rule.starts_at).toLocaleDateString()}`}
                {rule.ends_at && ` · Until: ${new Date(rule.ends_at).toLocaleDateString()}`}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toggleActive(rule.id, rule.is_active)}>
              {rule.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="p-8 text-center text-gray-400">No matching rules configured.</div>
        )}
      </div>
    </div>
  );
}
