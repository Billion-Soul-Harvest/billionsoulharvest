import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("title, slug, description, city, country, start_date, end_date, status")
    .in("status", ["published", "registration_open"])
    .order("start_date", { ascending: true })
    .limit(3);

  const featuredEvent = events?.[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#c69c3f]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8">
            <div className="w-2 h-2 bg-[#c69c3f] rounded-full" />
            <span className="text-[#c69c3f]/80 text-xs font-semibold tracking-widest uppercase">
              Global Ministry Movement
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[0.95] tracking-tight">
            Reaching 1 Billion Souls
            <br />
            <span className="text-[#c69c3f]">by 2033</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Billion Soul Harvest unites churches, ministries, and leaders worldwide in a shared
            mission to bring the Gospel to every nation through strategic gatherings and collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {featuredEvent ? (
              <Link
                href={`/events/${featuredEvent.slug}`}
                className="inline-flex items-center justify-center gap-2 bg-[#c69c3f] hover:bg-[#b08a35] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#c69c3f]/20"
              >
                View {featuredEvent.title}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 bg-[#c69c3f] hover:bg-[#b08a35] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#c69c3f]/20"
              >
                View Events
              </Link>
            )}
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium px-8 py-4 rounded-xl text-lg transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Event Card */}
      {featuredEvent && (
        <section className="relative -mt-8 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <p className="text-[#c69c3f]/60 text-xs font-semibold tracking-widest uppercase mb-3">
                Featured Event
              </p>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white mb-2">
                {featuredEvent.title}
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                {featuredEvent.start_date && new Date(featuredEvent.start_date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {featuredEvent.end_date && (
                  <>
                    {" "}&ndash;{" "}
                    {new Date(featuredEvent.end_date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
                {featuredEvent.city && <> &middot; {featuredEvent.city}{featuredEvent.country && `, ${featuredEvent.country}`}</>}
              </p>
              {featuredEvent.description && (
                <p className="text-gray-400 text-sm mb-4">{featuredEvent.description}</p>
              )}
              <div className="flex gap-3">
                <Link
                  href={`/events/${featuredEvent.slug}`}
                  className="text-[#c69c3f] hover:text-[#d4aa4f] text-sm font-semibold transition-colors"
                >
                  Learn more &rarr;
                </Link>
                {featuredEvent.status === "registration_open" && (
                  <Link
                    href={`/register/${featuredEvent.slug}`}
                    className="text-white hover:text-gray-200 text-sm font-semibold transition-colors ml-4"
                  >
                    Register now &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission / Impact Stats */}
      <section className="bg-[#0a1e38] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white mb-4">
              A Global Movement
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Since its founding, Billion Soul Harvest has brought together thousands of church leaders
              and ministries across continents, united in the vision of the Great Commission.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: "50+", label: "Nations Represented" },
              { stat: "5,000+", label: "Church Leaders Connected" },
              { stat: "12", label: "Global Summits Held" },
              { stat: "2033", label: "Vision Year" },
            ].map((item) => (
              <div key={item.label} className="text-center p-6 rounded-xl bg-white/5 border border-white/5">
                <p className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#c69c3f] mb-2">
                  {item.stat}
                </p>
                <p className="text-gray-400 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Harvest
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Whether you&apos;re a pastor, ministry leader, or believer passionate about the Great Commission,
            there&apos;s a place for you in this movement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center bg-[#c69c3f] hover:bg-[#b08a35] text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              View Upcoming Events
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium px-8 py-4 rounded-xl transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
