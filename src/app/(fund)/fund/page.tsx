import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { CampaignGrid } from "@/features/fund/components/campaign-grid";
import { CAMPAIGN_CATEGORIES, CAMPAIGN_CATEGORY_LABELS } from "@/features/fund/constants";
import type { FundCampaign } from "@/features/fund/types";

const CATEGORY_ICONS: Record<string, string> = {
  church_planting: "M3 21V9l9-6 9 6v12",
  missions_trips: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  bible_distribution: "M4 19.5A2.5 2.5 0 016.5 17H20",
  medical_missions: "M12 6v12M6 12h12",
  disaster_relief: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  building_projects: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16",
  youth_ministry: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
  worship_ministry: "M9 19V6l12-3v13",
};

const HERO_STATS = [
  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "Secure donations via Stripe" },
  { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "No platform fees" },
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "Community of believers" },
];

export default async function FundHomePage() {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("fund_campaigns")
    .select("*, creator:fund_profiles!fund_campaigns_creator_profile_fkey(*)")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recent } = await supabase
    .from("fund_campaigns")
    .select("*, creator:fund_profiles!fund_campaigns_creator_profile_fkey(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  const hasFeatured = (featured?.length ?? 0) > 0;
  const hasRecent = (recent?.length ?? 0) > 0;

  return (
    <div className="bg-white">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold tracking-wide text-cyan-600 uppercase mb-4">
              A ministry fundraising platform
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Where ministry{" "}
              <span className="relative">
                fundraisers
                <span className="absolute bottom-1 left-0 w-full h-2 bg-cyan-200/60 -z-10 rounded" />
              </span>{" "}
              start
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
              Launch a campaign in minutes. Share your story. Receive donations
              from supporters around the world.
            </p>
            <div className="mt-8">
              <Link
                href="/fund/campaigns/new"
                className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Start a Campaign
              </Link>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            {HERO_STATS.map((stat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-gray-400">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d={stat.icon} />
                </svg>
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / Social Proof ── */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <p className="text-xs font-semibold tracking-widest text-cyan-600 uppercase mb-3">
            No fee to start fundraising
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Thousands raised for ministry<br className="hidden sm:block" /> campaigns every week
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Get started in just a few minutes &mdash; create a compelling campaign,
            share it with your community, and watch support pour in.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Mockup card */}
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-sm mx-auto lg:mx-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Set your starting goal</p>
                    <p className="text-sm font-semibold text-gray-900">$5,000</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full w-3/4 bg-cyan-500 rounded-full" />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Fundraisers like yours typically raise</p>
                  <p className="text-lg font-bold text-gray-900">$2,000 or more</p>
                </div>
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-6 -right-6 w-24 h-24 opacity-20" style={{
                backgroundImage: "radial-gradient(circle, rgb(20 184 166) 1.5px, transparent 1.5px)",
                backgroundSize: "12px 12px",
              }} />
            </div>

            {/* Right: Steps */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-10">
                Fundraising on BSH Fund is easy, powerful, and trusted
              </h2>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Share your campaign story
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Use our guided prompts to add fundraiser details and set
                      your goal. Make it personal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Reach donors by sharing
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Share your fundraiser link with friends and use the resources in your
                      dashboard to get the word out.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Securely receive funds
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      All donations are processed securely through Stripe. Funds go
                      directly toward your ministry campaign.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/fund/campaigns/new"
                  className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 transition-colors"
                >
                  Start a campaign
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Discover Campaigns ── */}
      <section className="bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Discover campaigns you care about
            </h2>
            <p className="mt-2 text-gray-500">
              {hasRecent ? "Happening now across the community" : "Be the first to start a campaign"}
            </p>
          </div>

          {hasFeatured && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Featured</h3>
                <Link href="/fund/search" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
                  View all &rarr;
                </Link>
              </div>
              <CampaignGrid campaigns={(featured ?? []) as FundCampaign[]} />
            </div>
          )}

          <div>
            {!hasFeatured && (
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent campaigns</h3>
                <Link href="/fund/search" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
                  View all &rarr;
                </Link>
              </div>
            )}
            {hasFeatured && hasRecent && (
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent campaigns</h3>
              </div>
            )}
            <CampaignGrid
              campaigns={(recent ?? []) as FundCampaign[]}
              emptyMessage="No campaigns yet. Be the first to start one!"
            />
          </div>
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="bg-cyan-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest text-cyan-600 uppercase mb-3">
            What you need to succeed
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Get what you need to help your fundraiser succeed on BSH Fund
          </h2>
          <p className="mt-5 text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            From church building projects to medical missions and disaster relief.
            Whatever you need, you can find it here.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Still have questions?{" "}
            <Link href="/fund/search" className="text-cyan-600 underline hover:text-cyan-700">
              Learn more about how BSH Fund works
            </Link>
          </p>
        </div>
      </section>

      {/* ── Featured Categories ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
            Browse by category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CAMPAIGN_CATEGORIES.filter(c => c !== "other").map((cat) => (
              <Link
                key={cat}
                href={`/fund/category/${cat}`}
                className="group relative flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-cyan-50 border border-gray-100 hover:border-cyan-200 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 group-hover:border-cyan-300 flex items-center justify-center mb-4 shadow-sm group-hover:shadow transition-all">
                  <svg
                    className="w-6 h-6 text-cyan-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={CATEGORY_ICONS[cat] || CATEGORY_ICONS.disaster_relief} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-700 text-center transition-colors">
                  {CAMPAIGN_CATEGORY_LABELS[cat]}
                </span>
                <span className="mt-2 text-xs font-medium text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Credibility Section ── */}
      <section className="bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">
                Trusted platform
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15]">
              BSH Fund is a trusted partner in ministry fundraising.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-gray-400 leading-relaxed">
              With secure payment processing and direct support from the
              Billion Soul Harvest team, you can start a fundraiser and make
              a donation with peace of mind.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/fund/campaigns/new"
                className="inline-flex items-center px-7 py-3 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-full transition-colors"
              >
                Start a Campaign
              </Link>
              <Link
                href="/fund/search"
                className="inline-flex items-center px-7 py-3 text-sm font-semibold text-white border border-gray-600 hover:border-gray-400 rounded-full transition-colors"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to make a difference?
          </h2>
          <p className="mt-3 text-cyan-100 max-w-xl mx-auto">
            Join a community of believers advancing the Kingdom. Start your
            campaign today &mdash; it only takes a few minutes.
          </p>
          <Link
            href="/fund/campaigns/new"
            className="inline-flex items-center mt-8 px-8 py-3.5 text-base font-semibold text-cyan-700 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-colors"
          >
            Start Your Campaign
          </Link>
        </div>
      </section>
    </div>
  );
}
