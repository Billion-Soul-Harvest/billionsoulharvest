import { createClient } from "@/shared/utils/supabase/server";
import { FollowUpsClient } from "@/features/follow-ups/follow-ups-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Follow-ups — BSH Admin",
};

export default async function FollowUpsPage() {
  const supabase = await createClient();

  const { data: followUps } = await supabase
    .from("follow_ups")
    .select("*, contact:contacts(id, first_name, last_name, email)")
    .order("created_at", { ascending: false });

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name")
    .order("first_name");

  return (
    <div>
      <FollowUpsClient
        initialFollowUps={followUps ?? []}
        contacts={contacts ?? []}
      />
    </div>
  );
}
