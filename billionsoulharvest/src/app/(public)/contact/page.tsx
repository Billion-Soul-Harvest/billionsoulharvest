import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Billion Soul Harvest",
  description: "Get in touch with Billion Soul Harvest.",
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-gray-300/80 max-w-2xl mx-auto leading-relaxed">
            We&apos;d love to hear from you. Whether you have questions about our events,
            want to explore partnership, or simply want to connect, reach out below.
          </p>
        </div>
      </section>

      <section className="bg-[#0a1e38] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[#c69c3f] font-semibold text-sm uppercase tracking-wider mb-3">
                  Email
                </h3>
                <a
                  href="mailto:info@billionsoulharvest.org"
                  className="text-white hover:text-[#c69c3f] transition-colors"
                >
                  info@billionsoulharvest.org
                </a>
              </div>

              <div>
                <h3 className="text-[#c69c3f] font-semibold text-sm uppercase tracking-wider mb-3">
                  General Inquiries
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  For questions about Billion Soul Harvest, our events, or how to get involved,
                  please email us and we&apos;ll respond as soon as possible.
                </p>
              </div>

              <div>
                <h3 className="text-[#c69c3f] font-semibold text-sm uppercase tracking-wider mb-3">
                  Event Registration Support
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  If you need help with event registration, have questions about an upcoming summit,
                  or need to modify your registration, please reach out to our team.
                </p>
              </div>

              <div>
                <h3 className="text-[#c69c3f] font-semibold text-sm uppercase tracking-wider mb-3">
                  Partnership
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Interested in partnering with BSH for a regional or global event?
                  We welcome conversations with churches, ministries, and organizations
                  who share our vision.
                </p>
              </div>
            </div>

            {/* Social / Quick Links */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-6">
                Stay Connected
              </h3>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Follow Billion Soul Harvest to stay updated on upcoming events, testimonies
                  from the field, and opportunities to get involved.
                </p>
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <a
                    href="mailto:info@billionsoulharvest.org"
                    className="flex items-center gap-3 text-gray-300 hover:text-[#c69c3f] transition-colors text-sm"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@billionsoulharvest.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
