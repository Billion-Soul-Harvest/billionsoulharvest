import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Billion Soul Harvest",
  description: "Learn about the vision, mission, and history of Billion Soul Harvest.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-6">
            About Billion Soul Harvest
          </h1>
          <p className="text-lg text-gray-300/80 max-w-2xl mx-auto leading-relaxed">
            A global coalition of churches, ministries, and leaders united around the vision
            of reaching 1 billion souls for Christ by 2033.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-[#0a1e38] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#c69c3f] mb-4">
                Our Vision
              </h2>
              <p className="text-gray-300 leading-relaxed">
                To see 1 billion souls reached with the Gospel of Jesus Christ by the year 2033,
                through the united efforts of churches, ministries, and leaders across every nation.
                We believe that through strategic collaboration and Spirit-led gatherings, the Great
                Commission can be fulfilled in our generation.
              </p>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#c69c3f] mb-4">
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Billion Soul Harvest exists to mobilize and equip church leaders globally through
                strategic gatherings, resource sharing, and partnership development. We convene
                Global Harvest Summits that bring together pastors, evangelists, and ministry leaders
                to share best practices, build relationships, and catalyze evangelistic movements
                in every region of the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-6 text-center">
            Our Story
          </h2>
          <div className="space-y-5 text-gray-300 leading-relaxed">
            <p>
              Billion Soul Harvest was born from a conviction that the body of Christ, working
              together across denominational and national boundaries, can accomplish what no single
              church or organization could do alone. Founded by James O. Huang with a passion for
              global evangelism, BSH has grown into a movement that spans continents.
            </p>
            <p>
              In partnership with organizations like Finishing the Task and inspired by the vision
              of leaders like Rick Warren, BSH focuses on the unreached and underserved communities
              around the world. Through our Global Harvest Summits, we create spaces where leaders
              from diverse backgrounds can worship together, learn from one another, and forge
              lasting partnerships.
            </p>
            <p>
              From Asia to Africa, Latin America to Europe, BSH has convened thousands of leaders
              who share a common heartbeat: to see every person have the opportunity to hear and
              respond to the Gospel.
            </p>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="bg-[#0a1e38] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-10">
            Global Presence
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { region: "Asia Pacific", description: "Taiwan, Philippines, South Korea, Japan, India" },
              { region: "Latin America", description: "Brazil, Colombia, Mexico, Guatemala" },
              { region: "Africa", description: "Nigeria, Kenya, South Africa, Ghana" },
              { region: "North America", description: "United States, Canada" },
              { region: "Europe", description: "United Kingdom, Germany, France" },
              { region: "Middle East", description: "Strategic partnerships in sensitive regions" },
            ].map((item) => (
              <div key={item.region} className="p-5 rounded-xl bg-white/5 border border-white/5 text-left">
                <h3 className="text-[#c69c3f] font-semibold text-sm mb-1">{item.region}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-4">
            Strategic Partnerships
          </h2>
          <p className="text-gray-400 leading-relaxed">
            BSH works alongside Finishing the Task, a global initiative co-founded by Rick Warren,
            to identify and engage unreached people groups. Together, we are committed to ensuring
            that every people group and every place has an opportunity to hear the Gospel by 2033.
          </p>
        </div>
      </section>
    </div>
  );
}
