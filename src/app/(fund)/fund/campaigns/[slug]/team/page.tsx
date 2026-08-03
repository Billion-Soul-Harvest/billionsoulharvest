import { notFound } from "next/navigation";
import { createClient } from "@/shared/utils/supabase/server";
import { CampaignGrid } from "@/features/fund/components/campaign-grid";
import { ProgressBar } from "@/features/fund/components/progress-bar";
import { formatCents } from "@/features/fund/utils/format-currency";
import type { FundCampaign } from "@/features/fund/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("fund_campaigns")
    .select("id, title, team_id")
    .eq("slug", slug)
    .single();

  if (!campaign?.team_id) notFound();

  const { data: team } = await supabase
    .from("fund_teams")
    .select("*, members:fund_team_members(*, profile:fund_profiles(*))")
    .eq("id", campaign.team_id)
    .single();

  if (!team) notFound();

  const { data: teamCampaigns } = await supabase
    .from("fund_campaigns")
    .select("*, creator:fund_profiles!fund_campaigns_creator_profile_fkey(*)")
    .eq("team_id", team.id)
    .eq("status", "active")
    .order("raised_cents", { ascending: false });

  const totalRaised = (teamCampaigns ?? []).reduce((sum, c) => sum + (c.raised_cents || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{team.name}</h1>
      {team.description && <p className="text-gray-500 mt-2 text-sm sm:text-base">{team.description}</p>}

      <div className="mt-4 sm:mt-6 bg-white rounded-xl border p-4 sm:p-6">
        <div className="flex gap-6 sm:gap-8 mb-4">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCents(totalRaised)}</p>
            <p className="text-xs sm:text-sm text-gray-500">total raised</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{team.members?.length || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">members</p>
          </div>
        </div>
        {team.goal_cents > 0 && (
          <ProgressBar raisedCents={totalRaised} goalCents={team.goal_cents} size="lg" showLabel />
        )}
      </div>

      {/* Members */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 sm:mt-10 mb-3 sm:mb-4">Team Members</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {(team.members ?? []).map((m: { id: string; role: string; profile?: { display_name: string; avatar_url?: string } }) => (
          <div key={m.id} className="bg-white rounded-xl border p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold mx-auto mb-2">
              {(m.profile?.display_name?.[0] || "?").toUpperCase()}
            </div>
            <p className="text-sm font-medium text-gray-900">{m.profile?.display_name || "Member"}</p>
            {m.role === "captain" && (
              <span className="text-xs text-cyan-600 font-medium">Captain</span>
            )}
          </div>
        ))}
      </div>

      {/* Team campaigns */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 sm:mt-10 mb-3 sm:mb-4">Team Campaigns</h2>
      <CampaignGrid campaigns={(teamCampaigns ?? []) as FundCampaign[]} />
    </div>
  );
}
