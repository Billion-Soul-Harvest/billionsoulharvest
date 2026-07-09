import { createClient } from "@/shared/utils/supabase/server";
import { PositionsClient } from "@/features/positions/positions-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Positions — BSH Admin",
};

export default async function PositionsPage() {
  const supabase = await createClient();

  const { data: positions } = await supabase
    .from("positions")
    .select("*")
    .order("name");

  // Get contact counts per position
  const { data: contacts } = await supabase
    .from("contacts")
    .select("position_id");

  const contactCounts: Record<string, number> = {};
  contacts?.forEach((c) => {
    if (c.position_id) {
      contactCounts[c.position_id] = (contactCounts[c.position_id] ?? 0) + 1;
    }
  });

  return (
    <div>
      <PositionsClient
        initialPositions={positions ?? []}
        contactCounts={contactCounts}
      />
    </div>
  );
}
