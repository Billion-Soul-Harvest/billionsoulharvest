import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leadership — Billion Soul Harvest",
  description: "Meet the leadership team behind Billion Soul Harvest.",
};

const leaders = [
  {
    name: "James O. Huang",
    title: "Chairman & Visionary",
    bio: "James O. Huang is the founding visionary of Billion Soul Harvest, a global movement committed to reaching 1 billion souls for Christ by 2033. With decades of ministry experience spanning Asia, North America, and beyond, Pastor Huang has dedicated his life to mobilizing churches and leaders for the Great Commission. His passion for unity across the body of Christ and strategic global evangelism has catalyzed partnerships across more than 50 nations.",
  },
];

export default function LeadershipPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-6">
            Leadership
          </h1>
          <p className="text-lg text-gray-300/80 max-w-2xl mx-auto leading-relaxed">
            Meet the leaders who guide the vision and mission of Billion Soul Harvest.
          </p>
        </div>
      </section>

      {/* Leaders */}
      <section className="bg-[#0a1e38] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {leaders.map((leader) => (
              <div
                key={leader.name}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 md:flex md:gap-8 items-start"
              >
                {/* Photo placeholder */}
                <div className="w-28 h-28 rounded-xl bg-[#c69c3f]/20 flex items-center justify-center shrink-0 mb-6 md:mb-0">
                  <span className="text-[#c69c3f] font-bold text-2xl">
                    {leader.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-1">
                    {leader.name}
                  </h3>
                  <p className="text-[#c69c3f] text-sm font-medium mb-4">{leader.title}</p>
                  <p className="text-gray-300 leading-relaxed text-sm">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
