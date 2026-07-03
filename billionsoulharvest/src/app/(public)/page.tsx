import Link from "next/link";
import Image from "next/image";
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
      {/* Hero Section — Full-screen with background image */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2744]/80 via-[#0f2744]/70 to-[#0f2744]/90" />
        {/* Cyan accent glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#29BDD6]/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
            <div className="w-2 h-2 bg-[#29BDD6] rounded-full animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
              Global Ministry Movement
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-6 leading-[0.9] tracking-tight">
            Reaching 1 Billion Souls
            <br />
            <span className="text-[#D4A843]">by 2033</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            A global movement uniting churches, ministries, and Christian leaders to help catalyze the
            greatest harvest of souls in history as we approach the 2,000th anniversary of the death,
            resurrection, and the birth of the Church.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {featuredEvent ? (
              <Link
                href={`/events/${featuredEvent.slug}`}
                className="inline-flex items-center justify-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#29BDD6]/25 hover:shadow-[#29BDD6]/40"
              >
                View {featuredEvent.title}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/gatherings"
                className="inline-flex items-center justify-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#29BDD6]/25 hover:shadow-[#29BDD6]/40"
              >
                View Gatherings
              </Link>
            )}
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-8 py-4 rounded-xl text-lg transition-all backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Event Card */}
      {featuredEvent && (
        <section className="relative -mt-16 pb-16 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
              <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">
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
                  className="text-[#29BDD6] hover:text-[#3dcde6] text-sm font-semibold transition-colors"
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

      {/* What is BSH — white background section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=960&q=80"
                alt="Global community united in faith"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Who We Are</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#0f2744] mb-6">
                What is Billion Soul Harvest?
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Billion Soul Harvest (BSH) is a global movement uniting churches, ministries, mission organizations,
                  and Christian leaders around a shared vision: to help catalyze the greatest harvest of souls in history
                  as we approach the year 2033.
                </p>
                <p className="text-gray-500">
                  We believe that no single church, denomination, ministry, or nation can fulfill the Great Commission alone.
                  But together, through humility, collaboration, prayer, and the power of the Holy Spirit, the Body of Christ
                  can accelerate evangelism, discipleship, and multiplication on an unprecedented scale.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[#29BDD6] hover:text-[#1a9ab5] font-semibold mt-6 transition-colors"
              >
                Read our story &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission: Evangelize. Disciple. Multiply. — with background image */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1e38]/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our Heartbeat</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white mb-4">
              Evangelize. Disciple. Multiply.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Evangelize",
                description: "Proclaim the Gospel so that every person has the opportunity to know Jesus Christ.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                ),
              },
              {
                title: "Disciple",
                description: "Equip believers to grow in Christ, live out their faith, and become faithful followers of Jesus.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
              },
              {
                title: "Multiply",
                description: "Develop leaders, plant ministries, strengthen churches, and reproduce disciple-makers who will impact future generations.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#29BDD6]/30 transition-all group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our DNA — Holy. Humble. Hidden. — white background */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our DNA</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#0f2744] mb-6">
                Holy. Humble. Hidden.
              </h2>
              <p className="text-gray-500 mb-8">
                Our culture is defined by three commitments that shape who we are and how we serve.
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: "Holy",
                    description: "Living lives fully devoted to God.",
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    ),
                  },
                  {
                    title: "Humble",
                    description: "Serving others with the spirit of Christ.",
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    ),
                  },
                  {
                    title: "Hidden",
                    description: "Seeking God's glory above our own recognition.",
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-[#0f2744] font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=960&q=80"
                alt="Community in prayer and fellowship"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Four Greats */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1e38]/85" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our Vision</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white mb-4">
              The Four Greats
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto">
              As we look toward 2033, we pray for what we call the Four Greats.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Great Return",
                description: "A renewed expectation of Christ's return.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Great Harvest",
                description: "A global awakening to the Gospel.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                ),
              },
              {
                title: "Great Unity",
                description: "Greater collaboration across the Body of Christ.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
              },
              {
                title: "Great Breakthrough",
                description: "Fresh movements of God's power and transformation among the nations.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#29BDD6]/30 transition-all text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-[#29BDD6] font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Five Global Initiatives — white background */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our Strategy</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-[#0f2744] mb-4">
              Five Global Initiatives
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Global Harvest Summits",
                description: "Gathering and mobilizing leaders across nations for vision, unity, and collaboration.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
              {
                title: "International Leadership Institute",
                description: "Equipping leaders for lasting Kingdom impact through training and development.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
              },
              {
                title: "Fanning the Flame",
                description: "Encouraging spiritual renewal and evangelistic momentum through strategic funding.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                  </svg>
                ),
              },
              {
                title: "Billion Soul Care",
                description: "Demonstrating Christ's love through compassionate action and mercy ministries.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
              {
                title: "Strategic Partnerships",
                description: "Collaborating with churches, ministries, and networks to accelerate the Great Commission.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-5.192a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#29BDD6]/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 mb-4 rounded-lg bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-[#0f2744] font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/initiatives"
              className="inline-flex items-center gap-2 bg-[#0f2744] hover:bg-[#0a1e38] text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              Learn more about our initiatives &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0a1e38] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white mb-4">
              A Global Movement
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Billion Soul Harvest has brought together thousands of church leaders
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
              <div key={item.label} className="text-center p-8 rounded-2xl bg-white/5 border border-white/5">
                <p className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-[#D4A843] mb-2">
                  {item.stat}
                </p>
                <p className="text-gray-400 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action — with background image */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0f2744]/85" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            <span className="text-[#D4A843]">Gather</span> for Vision.<br className="hidden sm:block" /> <span className="text-[#D4A843]">Scatter</span> for Harvest.<br className="hidden sm:block" /> <span className="text-[#D4A843]">Unite</span> for the Kingdom.
          </h2>
          <p className="text-gray-200/80 max-w-xl mx-auto mb-10 text-lg">
            Whether you&apos;re a pastor, missionary, ministry leader, church member, or believer with a heart
            for the nations, we invite you to join us in this movement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/connect"
              className="inline-flex items-center justify-center bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#29BDD6]/25"
            >
              Join the Movement
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-8 py-4 rounded-xl transition-all backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
