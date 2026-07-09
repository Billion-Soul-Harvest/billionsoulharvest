import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Campaign — BSH Admin",
};

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      name: "Untitled Campaign",
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !campaign) {
    redirect("/admin/campaigns");
  }

  redirect(`/admin/campaigns/${campaign.id}`);
}
