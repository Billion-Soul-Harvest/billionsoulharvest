import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connect — Billion Soul Harvest",
  description: "Join the Billion Soul Harvest movement. Partner, pray, give, and connect.",
};

export default function ConnectPage() {
  return (
    <div>
      {/* Hero with background image */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2744]/85 via-[#0f2744]/75 to-[#0f2744]/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <p className="text-[#29BDD6] text-xs font-semibold tracking-widest uppercase mb-4">Get Involved</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white mb-6">
            Join the Movement
          </h1>
          <p className="text-lg text-gray-200/80 max-w-2xl mx-auto leading-relaxed">
            The Great Commission is too great for any one church, ministry, or nation to fulfill alone.
            We believe God is calling His people to work together in unity for the greatest harvest in history.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Partner With Us */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#29BDD6]/20 transition-all group">
              <div className="w-14 h-14 mb-5 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-5.192a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-3">
                Partner With Us
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                We welcome strategic partnerships with churches, ministries, mission organizations, Christian
                networks, educational institutions, and Kingdom leaders who share our passion for evangelism,
                discipleship, and multiplication.
              </p>
              <a
                href="mailto:info@billionsoulharvest.org?subject=Partnership%20Inquiry"
                className="inline-flex items-center gap-2 text-[#29BDD6] hover:text-[#3dcde6] font-semibold text-sm transition-colors"
              >
                Become a Partner
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Invite BSH */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#29BDD6]/20 transition-all group">
              <div className="w-14 h-14 mb-5 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-3">
                Invite BSH
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                Would you like Billion Soul Harvest to participate in your conference, church, leadership
                gathering, or ministry event?
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Our leadership team is available for speaking engagements, leadership training, strategic
                consultations, and partnership development around the world.
              </p>
              <a
                href="mailto:info@billionsoulharvest.org?subject=Speaker%20Request"
                className="inline-flex items-center gap-2 text-[#29BDD6] hover:text-[#3dcde6] font-semibold text-sm transition-colors"
              >
                Request a Speaker
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Pray With Us */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#29BDD6]/20 transition-all group">
              <div className="w-14 h-14 mb-5 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-3">
                Pray With Us
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                Prayer is the foundation of everything we do.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Join us in praying for global revival, the fulfillment of the Great Commission, and the unity of
                the Body of Christ as we prepare for the greatest harvest in history.
              </p>
              <a
                href="mailto:info@billionsoulharvest.org?subject=Prayer%20Network"
                className="inline-flex items-center gap-2 text-[#29BDD6] hover:text-[#3dcde6] font-semibold text-sm transition-colors"
              >
                Join Our Prayer Network
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Support the Mission */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#29BDD6]/20 transition-all group">
              <div className="w-14 h-14 mb-5 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-3">
                Support the Mission
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your generosity helps mobilize leaders, strengthen churches, equip evangelists, and advance
                strategic Kingdom initiatives around the world. Together, we can help accelerate the
                fulfillment of the Great Commission.
              </p>
              <a
                href="mailto:info@billionsoulharvest.org?subject=Giving%20Inquiry"
                className="inline-flex items-center gap-2 text-[#29BDD6] hover:text-[#3dcde6] font-semibold text-sm transition-colors"
              >
                Give Today
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Connected — with background image */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0f2744]/85" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay Connected
          </h2>
          <p className="text-gray-200/80 leading-relaxed mb-8">
            Receive ministry updates, upcoming event announcements, prayer requests, and stories of
            what God is doing through Billion Soul Harvest around the world.
          </p>
          <a
            href="mailto:info@billionsoulharvest.org?subject=Newsletter%20Subscription"
            className="inline-flex items-center justify-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-[#29BDD6]/25"
          >
            Subscribe to Our Newsletter
          </a>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-4">
            Contact Us
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            We would love to hear from you. Whether you have a question, would like to partner with us,
            or simply want to learn more about Billion Soul Harvest, our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="mailto:info@billionsoulharvest.org"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white hover:border-[#29BDD6]/30 transition-all"
            >
              <svg className="w-5 h-5 text-[#29BDD6] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              info@billionsoulharvest.org
            </a>
            <Link
              href="/events"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-gray-300 hover:border-[#29BDD6]/30 hover:text-white transition-all"
            >
              <svg className="w-5 h-5 text-[#29BDD6] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              View Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
