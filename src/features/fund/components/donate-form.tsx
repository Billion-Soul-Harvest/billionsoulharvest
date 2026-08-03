"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DONATION_PRESETS } from "../constants";
import { formatCents } from "../utils/format-currency";

interface DonateFormProps {
  campaignId: string;
  campaignTitle: string;
}

export function DonateForm({ campaignId, campaignTitle }: DonateFormProps) {
  const [amountCents, setAmountCents] = useState(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectPreset(cents: number) {
    setAmountCents(cents);
    setCustomAmount("");
  }

  function handleCustom(value: string) {
    setCustomAmount(value);
    const parsed = Math.round(parseFloat(value || "0") * 100);
    if (parsed > 0) setAmountCents(parsed);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amountCents < 100) {
      setError("Minimum donation is $1.00");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/fund/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          amount_cents: amountCents,
          donor_name: donorName || undefined,
          donor_email: donorEmail || undefined,
          is_anonymous: isAnonymous,
          is_recurring: isRecurring,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Donate to</h3>
        <p className="text-sm text-gray-500">{campaignTitle}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Amount presets */}
      <div className="space-y-2">
        <Label>Select Amount</Label>
        <div className="grid grid-cols-3 gap-2">
          {DONATION_PRESETS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => selectPreset(cents)}
              className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                amountCents === cents && !customAmount
                  ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {formatCents(cents)}
            </button>
          ))}
        </div>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <Input
            type="number"
            min="1"
            step="0.01"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustom(e.target.value)}
            className="h-11 pl-7"
          />
        </div>
      </div>

      {/* Recurring toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-sm text-gray-700">Make this a monthly donation</span>
      </label>

      {/* Donor info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="donor_name">Your Name</Label>
          <Input
            id="donor_name"
            value={donorName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDonorName(e.target.value)}
            placeholder="Your name"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="donor_email">Email (for receipt)</Label>
          <Input
            id="donor_email"
            type="email"
            value={donorEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDonorEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message (optional)</Label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave an encouraging message..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-sm text-gray-700">Donate anonymously</span>
      </label>

      <Button
        type="submit"
        disabled={loading || amountCents < 100}
        className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl text-base"
      >
        {loading ? "Processing..." : `Donate ${formatCents(amountCents)}`}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Secure payment powered by Stripe. You&apos;ll be redirected to complete your donation.
      </p>
    </form>
  );
}
