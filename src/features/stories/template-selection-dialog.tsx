"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  storyId: string;
}

const templates = [
  {
    key: "blog",
    title: "Blog / Story",
    description: "Text-focused layout with banner, headings, body text, and inline images. Ideal for long-form stories and articles.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    key: "visual",
    title: "Visual / Marketing",
    description: "Hero images, two-column layouts, quote sections, and call-to-action buttons. Great for impact stories.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "gallery",
    title: "Photo Gallery",
    description: "Carousel slideshows with supporting text. Great for photo stories and event galleries.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    key: "blank",
    title: "Blank Canvas",
    description: "Start from scratch with an empty page. Build your layout entirely from the component panel.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
];

export function TemplateSelectionDialog({ open, storyId }: Props) {
  const router = useRouter();

  function handleSelect(key: string) {
    router.push(`/admin/stories/edit/${storyId}/builder?template=${key}`);
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Pick a starting layout for your story. You can customize everything in the page builder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => handleSelect(t.key)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#29BDD6] hover:bg-[#29BDD6]/5 transition-all text-center group cursor-pointer"
            >
              <div className="text-gray-400 group-hover:text-[#29BDD6] transition-colors">
                {t.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
