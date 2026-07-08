import { createClient } from "@/shared/utils/supabase/server";
import { RegionsClient } from "@/features/regions/regions-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regions — BSH Admin",
};

export default async function RegionsPage() {
  const supabase = await createClient();

  const { data: regions } = await supabase
    .from("ministry_regions")
    .select("*")
    .order("name");

  // Get contact counts per region
  const { data: contacts } = await supabase
    .from("contacts")
    .select("region_id");

  const contactCounts: Record<string, number> = {};
  contacts?.forEach((c) => {
    if (c.region_id) {
      contactCounts[c.region_id] = (contactCounts[c.region_id] ?? 0) + 1;
    }
  });

  // Event counts per region — events no longer have region_id
  const eventCounts: Record<string, number> = {};

  return (
    <div>
      <RegionsClient
        initialRegions={regions ?? []}
        contactCounts={contactCounts}
        eventCounts={eventCounts}
      />
    </div>
  );
}
