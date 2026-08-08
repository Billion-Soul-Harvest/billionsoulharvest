import Link from "next/link";
import Image from "next/image";
import { ContactDialog } from "./contact-dialog";

export function StaticFooter() {
  return (
    <footer className="bg-[#0a1928] border-t-2 border-white/[0.16] pt-[70px] px-4 md:px-10 pb-10">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-14">
        <div className="flex flex-col gap-[18px]">
          <div className="h-12 flex items-center">
            <Image
              src="/bsh-logo.webp"
              alt="Billion Soul Harvest"
              width={180}
              height={48}
              className="h-full w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.6] text-white/85">
            A global initiative committed to mobilizing the body of Christ for
            the 2033 mandate.
          </p>
          <div className="flex gap-4 font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.08em]">
            <a
              href="https://www.youtube.com/@ghs2033"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1ecdec] hover:text-white transition-colors"
            >
              YouTube
            </a>
            <a
              href="https://www.facebook.com/BillionSoulHarvest/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1ecdec] hover:text-white transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/billionsoul_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1ecdec] hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>

        <div>
          <h6 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium text-white/70 mb-6 uppercase tracking-[0.18em]">
            Explore
          </h6>
          <ul className="space-y-4 font-[family-name:var(--font-geist-sans)] text-[15px] text-white/[0.94]">
            <li>
              <Link href="/about/our-story" className="hover:text-[#1ecdec] transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/gatherings" className="hover:text-[#1ecdec] transition-colors">
                Gatherings
              </Link>
            </li>
            <li>
              <Link href="/initiatives" className="hover:text-[#1ecdec] transition-colors">
                Initiatives
              </Link>
            </li>
            <li>
              <Link href="/stories" className="hover:text-[#1ecdec] transition-colors">
                Stories
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h6 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium text-white/70 mb-6 uppercase tracking-[0.18em]">
            Connect
          </h6>
          <ul className="space-y-4 font-[family-name:var(--font-geist-sans)] text-[15px] text-white/[0.94]">
            <li>
              <ContactDialog>
                <span className="hover:text-[#1ecdec] transition-colors">
                  Contact Us
                </span>
              </ContactDialog>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-[1280px] mx-auto mt-12 pt-6 border-t border-white/[0.16] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11.5px] tracking-[0.06em] text-white/70">
          &copy; {new Date().getFullYear()} Billion Soul Harvest. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
