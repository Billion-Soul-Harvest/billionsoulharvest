import type { BlockType } from "@/shared/types/database";

interface TemplateBlock {
  block_type: BlockType;
  title: string | null;
  content: Record<string, unknown>;
}

interface TemplatePage {
  title: string;
  slug: string;
  blocks: TemplateBlock[];
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  pages: TemplatePage[];
}

export const eventTemplates: EventTemplate[] = [
  {
    id: "conference",
    name: "Conference",
    description: "Multi-page layout with overview, schedule, logistics, and registration.",
    pages: [
      {
        title: "Overview",
        slug: "overview",
        blocks: [
          { block_type: "hero", title: null, content: { show_dates: true, show_cta: true } },
          { block_type: "rich_text", title: "About This Event", content: { html: "<p>Welcome to our conference. Add your event description here.</p>" } },
          { block_type: "speakers", title: "Featured Speakers", content: { layout: "grid" } },
        ],
      },
      {
        title: "Schedule",
        slug: "schedule",
        blocks: [
          { block_type: "schedule", title: "Event Schedule", content: { show_day_tabs: true } },
        ],
      },
      {
        title: "Logistics",
        slug: "logistics",
        blocks: [
          { block_type: "rich_text", title: "Travel & Accommodation", content: { html: "<p>Add travel and accommodation details here.</p>" } },
          { block_type: "faq", title: "Frequently Asked Questions", content: {} },
        ],
      },
      {
        title: "Register",
        slug: "register",
        blocks: [
          { block_type: "cta", title: null, content: { text: "Register Now", subtitle: "Secure your spot today" } },
        ],
      },
    ],
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Single-page layout perfect for smaller events.",
    pages: [
      {
        title: "Overview",
        slug: "overview",
        blocks: [
          { block_type: "hero", title: null, content: { show_dates: true, show_cta: true } },
          { block_type: "rich_text", title: "About This Workshop", content: { html: "<p>Describe your workshop here.</p>" } },
          { block_type: "schedule", title: "Agenda", content: { show_day_tabs: false } },
          { block_type: "cta", title: null, content: { text: "Register Now", subtitle: "" } },
        ],
      },
    ],
  },
  {
    id: "summit",
    name: "Summit",
    description: "Multi-page layout for large summits with speakers and detailed info.",
    pages: [
      {
        title: "Overview",
        slug: "overview",
        blocks: [
          { block_type: "hero", title: null, content: { show_dates: true, show_cta: true } },
          { block_type: "rich_text", title: "About This Summit", content: { html: "<p>Add summit description here.</p>" } },
          { block_type: "speakers", title: "Keynote Speakers", content: { layout: "grid", filter_roles: ["keynote"] } },
        ],
      },
      {
        title: "Schedule",
        slug: "schedule",
        blocks: [
          { block_type: "schedule", title: "Summit Schedule", content: { show_day_tabs: true } },
          { block_type: "speakers", title: "All Speakers", content: { layout: "grid" } },
        ],
      },
      {
        title: "Info",
        slug: "info",
        blocks: [
          { block_type: "faq", title: "Frequently Asked Questions", content: {} },
          { block_type: "rich_text", title: "Additional Information", content: { html: "<p>Add venue, travel, and accommodation details here.</p>" } },
        ],
      },
      {
        title: "Register",
        slug: "register",
        blocks: [
          { block_type: "cta", title: null, content: { text: "Register Now", subtitle: "Join us at the summit" } },
        ],
      },
    ],
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch with no pre-built pages.",
    pages: [],
  },
];
