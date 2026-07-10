import Link from "next/link";
import { VideoDialogButton } from "./components/video-dialog";
import { ScrollReveal } from "./components/scroll-reveal";
import { HeroSlideshow } from "./components/hero-slideshow";

export const revalidate = 3600;

const coreLeaders = [
  {
    role: "Founder & Visionary",
    name: "Dr. James Hwang",
    photo: "/leaders/james-hwang.jpg",
    bio: "Dr. James Hwang is the Founder and Visionary of Billion Soul Harvest. With a lifelong passion for world evangelization and Kingdom collaboration, he established BSH to inspire and unite the global Church around the vision of seeing one billion souls reached with the Gospel by 2033.",
  },
  {
    role: "Global Director",
    name: "Rev. Dr. Young Cho",
    photo: "/leaders/young-cho.jpg",
    bio: "Rev. Dr. Young Cho serves as the Global Director of Billion Soul Harvest, providing strategic leadership, developing international partnerships, and coordinating global initiatives that advance the mission of BSH across the nations.",
  },
];

const honoraryChairmen: { name: string; org: string; role: string; photo: string }[] = [
  { name: "Dr. James Hwang", org: "Founder & Visionary", role: "Honorary Chairman", photo: "/leaders/james-hwang.jpg" },
  { name: "Rev. Dr. Young Cho", org: "Global Director", role: "Honorary Chairman", photo: "/leaders/young-cho.jpg" },
  { name: "Rick Warren", org: "Finishing the Task", role: "Honorary Chairman", photo: "/leaders/rick-warren.jpg" },
  { name: "Sameh Maurice", org: "Kasr El Dobara Evangelical Church", role: "Honorary Chairman", photo: "/leaders/sameh-maurice.jpg" },
  { name: "Dick Eastman", org: "Every Home for Christ", role: "Honorary Chairman", photo: "/leaders/dick-eastman.jpg" },
  { name: "Luis Bush", org: "10/40 Window, Transform World", role: "Honorary Chairman", photo: "/leaders/luis-bush.jpg" },
  { name: "Enoch Adeboye", org: "Redeemed Christian Church of God", role: "Honorary Chairman", photo: "/leaders/enoch-adeboye.jpg" },
  { name: "Young Hoon Lee", org: "Full Gospel Yoido", role: "Honorary Chairman", photo: "/leaders/young-hoon-lee.jpg" },
  { name: "Yangjae Kim", org: "Wooridle Church", role: "Honorary Chairman", photo: "/leaders/yangjae-kim.jpg" },
  { name: "Carlito Paes", org: "City Church", role: "Convener", photo: "/leaders/carlito-paes.jpg" },
  { name: "Satish Kumar", org: "Calvary Temple", role: "Convener", photo: "/leaders/satish-kumar.jpg" },
  { name: "David Hwang", org: "SaeJoongAng Church", role: "Convener", photo: "/leaders/david-hwang.jpg" },
  { name: "James Hwang", org: "Erom Global", role: "Visionary", photo: "/leaders/james-hwang.jpg" },
];

const coChairs: { name: string; org: string; photo: string }[] = [
  { name: "Seongho Chang", org: "King of Kings", photo: "/leaders/seongho-chang.jpg" },
  { name: "Bill Wolfe", org: "Jesus Film Project", photo: "/leaders/bill-wolfe.jpg" },
  { name: "Joseph W Handley, Jr.", org: "A3", photo: "/leaders/joseph-w-handley-jr.jpg" },
  { name: "Werner Nachtigal", org: "GO MOVEMENT", photo: "/leaders/werner-nachtigal.jpg" },
  { name: "Jeremiah Cho", org: "Child Evangelism Fellowship", photo: "/leaders/jeremiah-cho.jpg" },
  { name: "Stephen Mutua", org: "Africa Evangelist Association", photo: "/leaders/stephen-mutua.jpg" },
  { name: "Tom Victor", org: "2BC", photo: "/leaders/tom-victor.jpg" },
  { name: "David Gibson", org: "GACX", photo: "/leaders/david-gibson.jpg" },
  { name: "Eddy Hallock", org: "Stoller Foundation", photo: "/leaders/eddy-hallock.jpg" },
  { name: "Tiong Howe Wee", org: "IPP Financial Advisers", photo: "/leaders/tiong-howe-wee.jpg" },
  { name: "Sungmin Park", org: "CCC (Cru) Korea", photo: "/leaders/sungmin-park.jpg" },
  { name: "Jason Mandryk", org: "Operation World", photo: "/leaders/jason-mandryk.jpg" },
  { name: "Jason Chudnofsky", org: "Summit Initiative", photo: "/leaders/jason-chudnofsky.jpg" },
  { name: "Ben Jack", org: "The Messages", photo: "/leaders/ben-jack.jpg" },
  { name: "Richard Howell", org: "Emeritas, WEA", photo: "/leaders/richard-howell.jpg" },
  { name: "Ricardo Luna", org: "Transform World", photo: "/leaders/ricardo-luna.jpg" },
  { name: "Shawn Brann", org: "Go & Tell", photo: "/leaders/shawn-brann.jpg" },
  { name: "Efrem Buckle", org: "London City Mission", photo: "/leaders/efrem-buckle.jpg" },
  { name: "Girma Bishaw", org: "The London Project", photo: "/leaders/girma-bishaw.jpg" },
  { name: "Olivier Fleury", org: "JC2033", photo: "/leaders/olivier-fleury.jpg" },
  { name: "Ashish Thomas", org: "Chosen", photo: "/leaders/ashish-thomas.jpg" },
  { name: "Daniel King", org: "Daniel King Ministries", photo: "/leaders/daniel-king.jpg" },
  { name: "Irwan Widjaja", org: "Gereja Bethel Indonesia (GBI)", photo: "/leaders/irwan-widjaja.jpg" },
  { name: "Bhavesh Kumar", org: "Go Movement Middle East", photo: "/leaders/bhavesh-kumar.jpg" },
  { name: "Gaylord Enns", org: "Love Revolution Now", photo: "/leaders/gaylord-enns.jpg" },
  { name: "Larry LeGrande", org: "Impact", photo: "/leaders/larry-legrande.jpg" },
  { name: "David Ro", org: "Arise Asia", photo: "/leaders/david-ro.jpg" },
  { name: "David Botelho", org: "Horizontes America Latina", photo: "/leaders/david-botelho.jpg" },
  { name: "Dai Sup Han", org: "Pray Surge Now!", photo: "/leaders/dai-sup-han.jpg" },
  { name: "Irene Kauma", org: "Dear Destined One", photo: "/leaders/irene-kauma.jpg" },
  { name: "Samuel Chiang", org: "World Evangelical Alliance", photo: "/leaders/samuel-chiang.jpg" },
  { name: "Ryan Emis", org: "Via Nations", photo: "/leaders/ryan-emis.jpg" },
  { name: "Thawng Tha Thang", org: "Gospel for Myanmar", photo: "/leaders/thawng-tha-thang.jpg" },
  { name: "Ari Talja", org: "Salvation To All Nations", photo: "/leaders/ari-talja.jpg" },
  { name: "Andres Castelazo Noguera", org: "Solo Cristo Salva", photo: "/leaders/andres-castelazo-noguera.jpg" },
  { name: "Charlie Abro", org: "David C Cook", photo: "/leaders/charlie-abro.jpg" },
  { name: "Kyle Henderson", org: "Finishing the Task", photo: "/leaders/kyle-henderson.jpg" },
  { name: "Don Haymon", org: "Calvary Church of Denver", photo: "/leaders/don-haymon.jpg" },
  { name: "Dong Campoy", org: "The HUB of Christ Philippines", photo: "/leaders/dong-campoy.jpg" },
  { name: "Fouad Masri", org: "Crescent Project", photo: "/leaders/fouad-masri.jpg" },
  { name: "Daniel Ko", org: "The New International University", photo: "/leaders/daniel-ko.jpg" },
  { name: "Jon Shabaglian", org: "Psalmist Mission", photo: "/leaders/jon-shabaglian.jpg" },
  { name: "Mark Sergeyev", org: "Ecclesia Church", photo: "/leaders/mark-sergeyev.jpg" },
  { name: "Oleg Bogomaz", org: "Ecclesia Church", photo: "/leaders/oleg-bogomaz.jpg" },
  { name: "Semeon Mulatu Taye", org: "Ethiopian Kale Heywet Church", photo: "/leaders/semeon-mulatu-taye.jpg" },
  { name: "Peter van Breda", org: "The New International University", photo: "/leaders/peter-van-breda.jpg" },
  { name: "Gabriella van Breda", org: "The New International University", photo: "/leaders/gabriella-van-breda.jpg" },
  { name: "Jihoon Cho", org: "GHS Korea", photo: "/leaders/jihoon-cho.jpg" },
  { name: "Dosun Choi", org: "GHS Korea", photo: "/leaders/dosun-choi.jpg" },
  { name: "SeongEun Hwang", org: "GHS Korea", photo: "/leaders/seongeun-hwang.jpg" },
];

const timeline = [
  { label: "The Great Commission", desc: "Matthew 28" },
  { label: "2,000 Years of Church History", desc: "The Gospel advancing through every generation" },
  { label: "Birth of Billion Soul Harvest Korea", desc: "A vision to unite the Body of Christ for the greatest harvest in history" },
  { label: "Launch of Global and National Summits", desc: "Gathering leaders across nations for vision, unity, and mobilization" },
  { label: "2020", desc: "Colorado Springs Global Summit" },
  { label: "2022", desc: "Colorado Springs Global Summit" },
  { label: "2023", desc: "Anyang, Korea Global Next Generation Summit" },
  { label: "2024", desc: "Pyeongchang Global Summit" },
  { label: "2025", desc: "Jeju Global Summit" },
  { label: "2026", desc: "Brazil Global Summit" },
  { label: "2033", desc: "One Billion Souls", highlight: true },
];

function getInitials(name: string) {
  return name
    .replace(/^(Dr\.|Rev\.|Pastor)\s*/g, "")
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function LeaderAvatar({ name, photo, size = "md" }: { name: string; photo?: string | null; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-16 h-16" : "w-20 h-20";
  const textSize = size === "sm" ? "text-lg" : "text-2xl";
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${dims} rounded-full object-cover border-2 border-[#b4c7ec]/30 mx-auto`}
      />
    );
  }
  return (
    <div className={`${dims} rounded-full bg-[#0d223f] flex items-center justify-center shrink-0 mx-auto`}>
      <span className={`font-[family-name:var(--font-jakarta)] ${textSize} font-bold text-[#a9edff]`}>
        {getInitials(name)}
      </span>
    </div>
  );
}

export default async function StaticHomePage() {
  return (
    <div className="scroll-smooth">
      {/* ── 1. Hero Section ── */}
      <header
        id="about"
        className="relative min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden"
      >
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.45), rgba(13,34,63,0.8))",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          <div className="max-w-2xl">
            <span className="inline-block bg-[#65e2fe] text-[#006373] px-4 py-1 rounded-lg text-xs font-semibold font-[family-name:var(--font-geist-sans)] mb-6 uppercase tracking-wider">
              ESTABLISHED FOR 2033
            </span>
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mb-6 tracking-[-0.02em]">
              What is Billion Soul Harvest?
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/90 mb-10">
              <strong>Billion Soul Harvest (BSH)</strong> is a global movement
              uniting churches, ministries, mission organizations, and Christian
              leaders around a shared vision: <strong>to help catalyze the
              greatest harvest of souls in history as we approach the year
              2033</strong> — the 2,000th anniversary of the death, resurrection,
              and the birth of the Church.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/gatherings"
                className="bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all inline-flex items-center gap-2"
              >
                Join the Movement
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="https://www.youtube.com/@ghs2033"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-white/10 transition-all"
              >
                Watch Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Floating social icons */}
        <div className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 flex-col gap-3">
          <a
            href="https://www.facebook.com/BillionSoulHarvest/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#00b8d4] shadow-lg flex items-center justify-center text-white hover:bg-[#006879] hover:scale-110 transition-all duration-300"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/billionsoul_/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#00b8d4] shadow-lg flex items-center justify-center text-white hover:bg-[#006879] hover:scale-110 transition-all duration-300"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@ghs2033"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#00b8d4] shadow-lg flex items-center justify-center text-white hover:bg-[#006879] hover:scale-110 transition-all duration-300"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── 2. Our Leadership (Core) — temporarily hidden ──
      <section id="our-leadership" className="py-20 md:py-[100px] bg-[#f0f3ff] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Our Leadership
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                Our Leadership
              </h2>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-[#44474d] mt-4 max-w-2xl mx-auto">
                Billion Soul Harvest is led by a diverse team of Christian leaders
                from around the world who are united by a shared commitment to the
                Great Commission.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
            {coreLeaders.map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:bg-white hover:border-[#00b8d4]/20 border border-transparent hover:scale-105 transition-all duration-300"
              >
                {leader.photo && (
                  <div className="w-full h-56">
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}
                <div className="p-6">
                  <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                    {leader.role}
                  </span>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] mt-2 mb-1">
                    {leader.name}
                  </h3>
                  <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d] flex-1 mt-2">
                    {leader.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>
      */}

      {/* ── 3. Honorary Chairmen & Conveners ── */}
      <section id="honorary-chairmen" className="py-20 md:py-[100px] bg-white scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Honorary Chairmen
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {honoraryChairmen.filter((p) => p.role === "Honorary Chairman").map((person) => (
              <div key={person.name} className="text-center group bg-[#f0f3ff] rounded-2xl p-5 hover:shadow-lg hover:bg-white hover:border-[#00b8d4]/20 border border-transparent hover:scale-105 transition-all duration-300">
                <LeaderAvatar name={person.name} photo={person.photo} size="sm" />
                <h4 className="font-[family-name:var(--font-jakarta)] text-sm font-semibold text-[#0d223f] leading-tight mt-4">
                  {person.name}
                </h4>
                <p className="font-[family-name:var(--font-geist-sans)] text-xs text-[#44474d] mt-1 leading-snug">
                  {person.org}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. Co-Chairs & Session Contributors ── */}
      <section id="co-chairs" className="py-20 md:py-[100px] bg-[#f9f9ff] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Co-Chairs &amp; Session Contributors
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {coChairs.map((person) => (
              <div key={`${person.name}-${person.org}`} className="text-center group bg-white rounded-2xl p-5 hover:shadow-lg hover:border-[#00b8d4]/20 border border-[#b4c7ec]/20 hover:scale-105 transition-all duration-300">
                <LeaderAvatar name={person.name} photo={person.photo} size="sm" />
                <h4 className="font-[family-name:var(--font-jakarta)] text-sm font-semibold text-[#0d223f] leading-tight mt-4">
                  {person.name}
                </h4>
                <p className="font-[family-name:var(--font-geist-sans)] text-xs text-[#44474d] mt-1 leading-snug">
                  {person.org}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. Our Story (condensed) ── */}
      <section id="our-story" className="py-20 md:py-[100px] bg-white scroll-mt-20">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <ScrollReveal direction="none">
            <div className="text-center mb-12">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Our Story
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                A Vision Born for Such a Time as This
              </h2>
            </div>
            <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
              <p>
                Billion Soul Harvest was born from a simple yet compelling
                conviction:{" "}
                <strong className="text-[#0d223f]">
                  the greatest harvest in history will require the greatest unity
                  in history.
                </strong>
              </p>
              <p>
                No single church, denomination, ministry, or mission organization
                can fulfill the Great Commission alone. But together, through
                prayer, humility, collaboration, and the power of the Holy Spirit,
                the Body of Christ can make an unprecedented impact for the Kingdom
                of God.
              </p>
              <p>
                From its beginning, Billion Soul Harvest has sought to bring
                Christian leaders together across nations, generations, and
                traditions&mdash;not to build another organization, but to serve as
                a catalyst for Kingdom collaboration through global gatherings,
                leadership development, ministry partnerships, and strategic
                ministries.
              </p>
              <blockquote className="border-l-4 border-[#00b8d4] pl-6 py-2 my-8 bg-[#e7f9fc] rounded-r-lg">
                <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 font-semibold text-[#0d223f]">
                  To unite the Body of Christ and help accelerate the fulfillment
                  of the Great Commission&mdash;one soul, one church, one nation at
                  a time.
                </p>
              </blockquote>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 6. Our Journey Timeline ── */}
      <section id="our-journey" className="py-20 md:py-[100px] bg-[#0d223f] relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00b8d4]/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#a9edff]/5 rounded-full blur-[100px]" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="text-center mb-16">
              <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Our Journey
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-white mt-4 tracking-[-0.02em]">
                Our Journey
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00b8d4] via-[#a9edff]/40 to-[#00b8d4]" />
            <div className="absolute left-[17px] md:left-[calc(50%-2px)] top-0 bottom-0 w-[5px] bg-gradient-to-b from-[#00b8d4]/20 via-[#a9edff]/10 to-[#00b8d4]/20 blur-sm" />

            <div className="space-y-8 md:space-y-12">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`absolute left-[12px] md:left-1/2 md:-translate-x-1/2 top-1 z-10 w-[16px] h-[16px] rounded-full border-[3px] transition-all ${
                      "highlight" in item && item.highlight
                        ? "bg-[#00b8d4] border-[#00b8d4] shadow-lg shadow-[#00b8d4]/50"
                        : "bg-[#0d223f] border-[#00b8d4]/70"
                    }`}
                  />
                  <div className="ml-10 md:ml-0 md:w-[calc(50%-32px)]">
                    <div
                      className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        "highlight" in item && item.highlight
                          ? "bg-[#00b8d4]/20 border-[#00b8d4]/50 shadow-lg shadow-[#00b8d4]/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#a9edff]/30"
                      }`}
                    >
                      <h4
                        className={`font-[family-name:var(--font-jakarta)] text-base font-bold ${
                          "highlight" in item && item.highlight ? "text-[#a9edff]" : "text-white"
                        }`}
                      >
                        {item.label}
                      </h4>
                      <p
                        className={`font-[family-name:var(--font-jakarta)] text-sm mt-1 ${
                          "highlight" in item && item.highlight ? "text-white/90" : "text-white/60"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Win, Build, Multiply ── */}
      <section id="mission" className="py-20 md:py-[120px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#000b20]">
                Win, Build, Multiply
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#00b8d4] group h-full">
              <div className="w-16 h-16 bg-[#00b8d4]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#00b8d4] transition-colors">
                <svg className="w-8 h-8 text-[#00b8d4] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">Win</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Win people to Christ so that every person has the opportunity to know Jesus.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#000b20] group h-full">
              <div className="w-16 h-16 bg-[#000b20]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#000b20] transition-colors">
                <svg className="w-8 h-8 text-[#000b20] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">Build</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Build believers up in their faith, equipping them to grow in Christ and become faithful followers.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#58d6f2] group h-full">
              <div className="w-16 h-16 bg-[#58d6f2]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#58d6f2] transition-colors">
                <svg className="w-8 h-8 text-[#58d6f2] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">Multiply</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Develop leaders, plant ministries, strengthen churches, and reproduce disciple-makers who will impact future generations.
              </p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 8. Our DNA: Holy, Humble, Hidden ── */}
      <section id="our-dna" className="bg-[#0d223f] text-white py-20 md:py-[120px] relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b8d4]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#a9edff]/5 rounded-full blur-[100px]" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white tracking-[-0.02em]">
                Our DNA: Holy, Humble, Hidden
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: "01",
                title: "Holy",
                desc: "Living lives fully devoted to God.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Humble",
                desc: "Serving others with the spirit of Christ.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Hidden",
                desc: "Seeking God\u2019s glory above our own recognition.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.num}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-white/10 hover:border-[#a9edff]/30 transition-all duration-300"
              >
                <div className="text-6xl font-[family-name:var(--font-jakarta)] text-[#a9edff]/10 italic absolute top-4 right-6">
                  {item.num}
                </div>
                <div className="text-[#a9edff] mb-5">
                  {item.icon}
                </div>
                <h4 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-white mb-3">
                  {item.title}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. The Four Greats ── */}
      <section id="vision" className="py-20 md:py-[120px] bg-[#f0f3ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f]">
                The Four Greats
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
            <div className="md:col-span-2 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg">
              <svg className="w-10 h-10 text-[#00b8d4] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Return</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">Living with expectancy for Christ&apos;s return.</p>
            </div>

            <div className="md:col-span-2 md:row-span-2 bg-[#0d223f] text-white p-8 rounded-lg flex flex-col justify-end relative overflow-hidden" style={{ backgroundImage: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%), url('/great-harvest-bg.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
              <svg className="w-12 h-12 text-[#a9edff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold mb-4">Great Harvest</h3>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 max-w-md">Reaching the world with the Gospel.</p>
              <Link href="/gatherings" className="mt-8 inline-flex items-center gap-2 text-[#a9edff] text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:underline">
                LEARN MORE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#b4c7ec]">
              <svg className="w-10 h-10 text-[#b4c7ec] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Unity</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">Bringing the Body of Christ together.</p>
            </div>

            <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#006879]">
              <svg className="w-10 h-10 text-[#006879] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Breakthrough</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">
                Advancing God&apos;s Kingdom through prayer, faith, and the power of the Holy Spirit.
              </p>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 10. Global Initiatives ── */}
      <section id="initiatives" className="py-20 md:py-[120px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <ScrollReveal direction="left">
            <div>
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                The Implementation
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f] mt-2 mb-4">
                Global Initiatives
              </h2>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d] mb-8 max-w-lg">
                Through strategic global gatherings, leadership development,
                collaborative partnerships, and compassionate outreach, we seek
                to serve as a catalyst for a worldwide movement that prepares
                the Church for the greatest harvest in history.
              </p>

              <div className="space-y-3">
                {[
                  { num: 1, title: "Harvest Summits", desc: "Gathering and mobilizing leaders.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832" /></svg> },
                  { num: 2, title: "International Leadership Institute", desc: "Equipping leaders for lasting Kingdom impact.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg> },
                  { num: 3, title: "Fanning the Flame", desc: "Encouraging spiritual renewal and evangelistic momentum.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg> },
                  { num: 4, title: "Billion Soul Care", desc: "Demonstrating Christ\u2019s love through compassionate action.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
                  { num: 5, title: "Strategic Partnerships", desc: "Collaborating with churches, ministries, and networks to accelerate the Great Commission.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-6.364-6.364L4.5 8.06" /></svg> },
                ].map((item) => (
                  <details
                    key={item.num}
                    className="group rounded-xl border border-[#c4c6ce]/60 overflow-hidden transition-all hover:border-[#00b8d4]/40 open:border-[#00b8d4]/50 open:shadow-lg open:shadow-[#00b8d4]/5"
                    open
                  >
                    <summary className="flex justify-between items-center p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-white group-open:bg-[#f0f3ff] transition-colors">
                      <span className="font-[family-name:var(--font-jakarta)] text-lg text-[#0d223f] flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-[#00b8d4]/10 text-[#00b8d4] flex items-center justify-center shrink-0 group-open:bg-[#00b8d4] group-open:text-white transition-colors">
                          {item.icon}
                        </span>
                        <span className="font-semibold">{item.title}</span>
                      </span>
                      <svg className="w-5 h-5 text-[#74777e] group-open:text-[#00b8d4] group-open:rotate-180 transition-all shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 bg-[#f0f3ff]">
                      <div className="ml-14 pl-0 border-l-2 border-[#00b8d4]/20 pl-4">
                        <p className="text-[#44474d] font-[family-name:var(--font-geist-sans)] text-[15px] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 bg-[#b4c7ec]/20 rounded-2xl blur-2xl group-hover:bg-[#00b8d4]/10 transition-all duration-500" />
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-[#b4c7ec]/20">
                <img src="/initiatives-collab.webp" alt="Leaders collaborating together" className="w-full h-[620px] object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%)" }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl border-l-4 border-[#00b8d4] shadow-lg">
                    <p className="font-[family-name:var(--font-jakarta)] text-[#0d223f] text-lg leading-7 font-semibold">
                      Gather for Vision. Scatter for Harvest. Unite for the Kingdom.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 11. Final CTA ── */}
      <section className="py-20 md:py-[120px] bg-[#0d223f] text-white text-center">
        <ScrollReveal direction="none">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#a9edff] mb-4">
            Gather for Vision. Scatter for Harvest. Unite for the Kingdom.
          </h2>
          <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 mb-12">
            Whether you are a pastor, missionary, ministry leader, church
            member, or believer with a heart for the nations, we invite you to
            join us. Together, let us pray, serve, collaborate, and proclaim
            Christ so that every person has the opportunity to hear the Gospel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gatherings"
              className="bg-[#00b8d4] text-white px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-all shadow-xl shadow-[#00b8d4]/40 uppercase tracking-widest"
            >
              Join the Movement Now
            </Link>
            <Link
              href="/connect"
              className="bg-white text-[#0d223f] px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#dee8ff] transition-all uppercase tracking-widest"
            >
              Partner With Us
            </Link>
          </div>
          <VideoDialogButton
            videoSrc="https://www.youtube.com/embed/EQ6zj85bxEA?autoplay=1"
            title="BSH Theme Song"
            className="inline-flex items-center gap-2 text-[#a9edff] hover:text-white font-[family-name:var(--font-geist-sans)] text-sm font-medium transition-colors mt-8 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Listen to the BSH Theme Song
          </VideoDialogButton>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
