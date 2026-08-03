"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FundProfile } from "@/features/fund/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<FundProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("fund_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as FundProfile);
    });
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    await supabase
      .from("fund_profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!profile) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input
            value={profile.display_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProfile({ ...profile, display_name: e.target.value })
            }
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Tell donors about yourself..."
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
