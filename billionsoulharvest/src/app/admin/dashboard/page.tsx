import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import CountryMap from "@/features/dashboard/country-map";
import { normalizeCountry } from "@/features/dashboard/country-codes";

export const metadata: Metadata = {
  title: "Dashboard — BSH Admin",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [contactsRes, eventsRes, registrationsRes, followUpsRes, countriesRes] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contacts").select("country").not("country", "is", null),
  ]);

  const countryData = Object.entries(
    (countriesRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
      const c = normalizeCountry(row.country as string);
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const stats = [
    { label: "Total Contacts", value: contactsRes.count ?? 0, href: "/contacts", color: "bg-blue-50 text-blue-700" },
    { label: "Events", value: eventsRes.count ?? 0, href: "/events", color: "bg-purple-50 text-purple-700" },
    { label: "Registrations", value: registrationsRes.count ?? 0, href: "/registrations", color: "bg-green-50 text-green-700" },
    { label: "Pending Follow-ups", value: followUpsRes.count ?? 0, href: "/follow-ups", color: "bg-amber-50 text-amber-700" },
  ];

  const { data: recentRegs } = await supabase
    .from("registrations")
    .select("*, contact:contacts(first_name, last_name, email), event:events(title)")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: upcomingFollowUps } = await supabase
    .from("follow_ups")
    .select("*, contact:contacts(first_name, last_name)")
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Country Map */}
      <div className="mb-8">
        <CountryMap data={countryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Registrations</h3>
            <Link href="/admin/registrations" className="text-sm text-cyan-600 hover:text-cyan-700">View all</Link>
          </div>
          <div className="divide-y">
            {recentRegs && recentRegs.length > 0 ? (
              recentRegs.map((reg) => (
                <div key={reg.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {reg.contact?.first_name} {reg.contact?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{reg.contact?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{reg.event?.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No registrations yet
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Upcoming Follow-ups</h3>
            <Link href="/admin/follow-ups" className="text-sm text-cyan-600 hover:text-cyan-700">View all</Link>
          </div>
          <div className="divide-y">
            {upcomingFollowUps && upcomingFollowUps.length > 0 ? (
              upcomingFollowUps.map((fu) => (
                <div key={fu.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{fu.title}</p>
                    <p className="text-xs text-gray-500">
                      {fu.contact?.first_name} {fu.contact?.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      fu.priority === "urgent" ? "bg-red-100 text-red-700" :
                      fu.priority === "high" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {fu.priority}
                    </span>
                    {fu.due_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due {new Date(fu.due_date + "T00:00:00").toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No pending follow-ups
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
