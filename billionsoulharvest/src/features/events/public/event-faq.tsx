"use client";

import { useState } from "react";
import type { EventFaq } from "@/shared/types/database";

interface Props {
  faqs: EventFaq[];
}

const categoryLabels: Record<string, string> = {
  general: "General",
  travel: "Travel",
  accommodation: "Accommodation",
  registration: "Registration",
};

function FaqItem({ faq }: { faq: EventFaq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-white font-medium text-sm pr-4 group-hover:text-[#c69c3f] transition-colors">
          {faq.question}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-gray-400 text-sm leading-relaxed whitespace-pre-line">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export function EventFaqSection({ faqs }: Props) {
  if (faqs.length === 0) return null;

  // Group by category
  const categories = new Map<string, EventFaq[]>();
  for (const faq of faqs) {
    const cat = faq.category ?? "general";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(faq);
  }

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-10 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8">
          {[...categories.entries()].map(([category, items]) => (
            <div key={category}>
              {categories.size > 1 && (
                <h3 className="text-[#c69c3f] text-sm font-semibold uppercase tracking-wider mb-3">
                  {categoryLabels[category] ?? category}
                </h3>
              )}
              <div className="bg-white/5 border border-white/10 rounded-xl px-5">
                {items
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((faq) => (
                    <FaqItem key={faq.id} faq={faq} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
