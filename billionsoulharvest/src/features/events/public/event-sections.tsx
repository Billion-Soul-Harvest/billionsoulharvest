import type { EventSection } from "@/shared/types/database";

interface Props {
  sections: EventSection[];
}

const sectionIcons: Record<string, React.ReactNode> = {
  arrival_info: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  accommodation: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  transportation: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  about: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  custom: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export function EventSections({ sections }: Props) {
  if (sections.length === 0) return null;

  return (
    <section className="bg-[#0a1e38] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {sections
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((section) => (
              <div
                key={section.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-[#29BDD6] shrink-0 mt-0.5">
                    {sectionIcons[section.section_type] ?? sectionIcons.custom}
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
                    {section.title}
                  </h3>
                </div>
                <div
                  className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none ml-10"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
