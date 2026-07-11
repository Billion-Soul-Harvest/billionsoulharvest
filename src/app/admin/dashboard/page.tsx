import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import CountryMap from "@/features/dashboard/country-map";
import ContactTypeChart from "@/features/dashboard/contact-type-chart";
import RegistrationsTimelineChart from "@/features/dashboard/registrations-timeline-chart";
import RegistrationStatusChart from "@/features/dashboard/registration-status-chart";
import FollowupOverviewChart from "@/features/dashboard/followup-overview-chart";
import { normalizeCountries } from "@/features/dashboard/country-codes";

export const metadata: Metadata = {
  title: "Dashboard — BSH Admin",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [contactsRes, eventsRes, registrationsRes, followUpsRes, countriesRes, contactTypesRes, regTimelineRes, regStatusRes, followUpDetailsRes] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contacts").select("country").not("country", "is", null),
    supabase.from("contacts").select("contact_type"),
    supabase.from("registrations").select("created_at"),
    supabase.from("registrations").select("status"),
    supabase.from("follow_ups").select("priority, status, due_date"),
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

  const regTimelineData = Object.entries(
    (regTimelineRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
      const d = new Date(row.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const regStatusData = Object.entries(
    (regStatusRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
      const s = (row.status as string) || "pending";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const followUpDetails = followUpDetailsRes.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const followUpPriorityData = Object.entries(
    followUpDetails.reduce<Record<string, number>>((acc, row) => {
      const p = (row.priority as string) || "medium";
      acc[p] = (acc[p] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const followUpOverdueCount = followUpDetails.filter(
    (r) => ["pending", "in_progress"].includes(r.status as string) && r.due_date && (r.due_date as string) < today
  ).length;

  const completedCount = followUpDetails.filter((r) => r.status === "completed").length;
  const followUpCompletionRate = followUpDetails.length > 0
    ? Math.round((completedCount / followUpDetails.length) * 100)
    : 0;

  const stats = [
    {
      label: "Total Contacts", value: contactsRes.count ?? 0, href: "/contacts",
      iconBg: "bg-cyan-100", iconColor: "text-cyan-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Events", value: eventsRes.count ?? 0, href: "/events",
      iconBg: "bg-purple-100", iconColor: "text-purple-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      label: "Registrations", value: registrationsRes.count ?? 0, href: "/registrations",
      iconBg: "bg-green-100", iconColor: "text-green-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      label: "Pending Follow-ups", value: followUpsRes.count ?? 0, href: "/follow-ups",
      iconBg: "bg-amber-100", iconColor: "text-amber-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
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
        <RegistrationsTimelineChart data={regTimelineData} />
        <RegistrationStatusChart data={regStatusData} />
        <FollowupOverviewChart
          priorityData={followUpPriorityData}
          overdueCount={followUpOverdueCount}
          completionRate={followUpCompletionRate}
          totalCount={followUpDetails.length}
        />
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
