import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import CountryMap from "@/features/dashboard/country-map";
import ContactTypeChart from "@/features/dashboard/contact-type-chart";
// import RegistrationsTimelineChart from "@/features/dashboard/registrations-timeline-chart";
// import RegistrationStatusChart from "@/features/dashboard/registration-status-chart";
// import FollowupOverviewChart from "@/features/dashboard/followup-overview-chart";
import { normalizeCountries } from "@/features/dashboard/country-codes";

export const metadata: Metadata = {
  title: "Dashboard — BSH Admin",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [contactsRes, countriesRes, contactTypesRes] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("country").not("country", "is", null),
    supabase.from("contacts").select("contact_type"),
  ]);

  const countryData = Object.entries(
    (countriesRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
      const countries = normalizeCountries(row.country as string);
      for (const c of countries) {
        acc[c] = (acc[c] ?? 0) + 1;
      }
      return acc;
    }, {})
  )
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const contactTypeData = Object.entries(
    (contactTypesRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
      const t = (row.contact_type as string) || "other";
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const stats = [
    {
      label: "Total Contacts", value: contactsRes.count ?? 0, href: "/admin/contacts",
      iconBg: "bg-cyan-100", iconColor: "text-cyan-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Country Map */}
      <div className="mb-8">
        <CountryMap data={countryData} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ContactTypeChart data={contactTypeData} />
      </div>
    </div>
  );
}
