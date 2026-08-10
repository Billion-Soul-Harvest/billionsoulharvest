import { getUsageData } from "@/features/usage/actions";
import type { Metadata } from "next";
import { UsagePageClient } from "@/features/usage/usage-page-client";

export const metadata: Metadata = {
  title: "System Usage - BSH Admin",
};

export default async function UsagePage() {
  const data = await getUsageData();
  return <UsagePageClient initialData={data} />;
}
