"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  TestTube,
  Eye,
  EyeOff,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EmailAccountPublic {
  id: string;
  label: string;
  email_address: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProviderPreset {
  name: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  { name: "Hostinger", imap_host: "imap.hostinger.com", imap_port: 993, smtp_host: "smtp.hostinger.com", smtp_port: 465 },
  { name: "Gmail", imap_host: "imap.gmail.com", imap_port: 993, smtp_host: "smtp.gmail.com", smtp_port: 465 },
  { name: "Outlook / Microsoft 365", imap_host: "outlook.office365.com", imap_port: 993, smtp_host: "smtp.office365.com", smtp_port: 587 },
  { name: "Yahoo Mail", imap_host: "imap.mail.yahoo.com", imap_port: 993, smtp_host: "smtp.mail.yahoo.com", smtp_port: 465 },
  { name: "Zoho Mail", imap_host: "imap.zoho.com", imap_port: 993, smtp_host: "smtp.zoho.com", smtp_port: 465 },
  { name: "Custom", imap_host: "", imap_port: 993, smtp_host: "", smtp_port: 465 },
];

export function AccountManager() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<EmailAccountPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { imap: { success: boolean; error?: string }; smtp: { success: boolean; error?: string } }>>({});
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    label: "",
    email_address: "",
    username: "",
    password: "",
    imap_host: "imap.hostinger.com",
    imap_port: 993,
    smtp_host: "smtp.hostinger.com",
    smtp_port: 465,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/mailbox/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      setAccounts(await res.json());
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset: ProviderPreset) {
    setForm((prev) => ({
      ...prev,
      imap_host: preset.imap_host,
      imap_port: preset.imap_port,
      smtp_host: preset.smtp_host,
      smtp_port: preset.smtp_port,
    }));
    if (preset.name === "Custom") setShowAdvanced(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/mailbox/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add account");
      }

      const account = await res.json();
      setAccounts((prev) => [...prev, account]);
      setShowForm(false);
      setForm({ label: "", email_address: "", username: "", password: "", imap_host: "imap.hostinger.com", imap_port: 993, smtp_host: "smtp.hostinger.com", smtp_port: 465 });
      setShowAdvanced(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(accountId: string) {
    setTestingId(accountId);
    try {
      const res = await fetch(`/api/mailbox/accounts/${accountId}/test`, { method: "POST" });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [accountId]: data }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [accountId]: {
          imap: { success: false, error: "Request failed" },
          smtp: { success: false, error: "Request failed" },
        },
      }));
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(accountId: string) {
    setDeletingId(accountId);
    try {
      const res = await fetch(`/api/mailbox/accounts/${accountId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch {
      setError("Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your email accounts to send and receive emails directly from the admin.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Account Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Add Email Account</h2>

          {/* Provider Presets */}
          <div>
            <Label>Email Provider</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {PROVIDER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    form.imap_host === preset.imap_host && form.smtp_host === preset.smtp_host
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="acct-label">Label</Label>
              <Input
                id="acct-label"
                placeholder="e.g. Work Email"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="acct-email">Email Address</Label>
              <Input
                id="acct-email"
                type="email"
                placeholder="you@example.com"
                value={form.email_address}
                onChange={(e) => setForm((f) => ({ ...f, email_address: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="acct-username">Username</Label>
              <Input
                id="acct-username"
                placeholder="Usually same as email"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="acct-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="acct-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced IMAP/SMTP settings */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced Settings (IMAP/SMTP)
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-100">
              <div>
                <Label htmlFor="acct-imap-host">IMAP Host</Label>
                <Input
                  id="acct-imap-host"
                  value={form.imap_host}
                  onChange={(e) => setForm((f) => ({ ...f, imap_host: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="acct-imap-port">IMAP Port</Label>
                <Input
                  id="acct-imap-port"
                  type="number"
                  value={form.imap_port}
                  onChange={(e) => setForm((f) => ({ ...f, imap_port: parseInt(e.target.value) || 993 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="acct-smtp-host">SMTP Host</Label>
                <Input
                  id="acct-smtp-host"
                  value={form.smtp_host}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_host: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="acct-smtp-port">SMTP Port</Label>
                <Input
                  id="acct-smtp-port"
                  type="number"
                  value={form.smtp_port}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_port: parseInt(e.target.value) || 465 }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Add Account
            </Button>
          </div>
        </form>
      )}

      {/* Account List */}
      {accounts.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-sm text-gray-500">No email accounts configured yet.</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="mt-3">
            <Plus className="w-4 h-4 mr-1.5" />
            Add your first account
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const test = testResults[account.id];
            return (
              <div key={account.id} className="bg-white border rounded-lg p-4 hover:border-cyan-300 transition-colors">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => router.push(`/admin/mailbox?account=${account.id}`)}
                    className="text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">{account.label}</h3>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-cyan-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{account.email_address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      IMAP: {account.imap_host}:{account.imap_port} | SMTP: {account.smtp_host}:{account.smtp_port}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/mailbox?account=${account.id}`)}
                      className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="ml-1.5">Mailbox</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(account.id)}
                      disabled={testingId === account.id}
                    >
                      {testingId === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                      <span className="ml-1.5">Test</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      disabled={deletingId === account.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Test Results */}
                {test && (
                  <div className="mt-3 flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      {test.imap.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={test.imap.success ? "text-green-700" : "text-red-700"}>
                        IMAP {test.imap.success ? "OK" : test.imap.error}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {test.smtp.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={test.smtp.success ? "text-green-700" : "text-red-700"}>
                        SMTP {test.smtp.success ? "OK" : test.smtp.error}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
