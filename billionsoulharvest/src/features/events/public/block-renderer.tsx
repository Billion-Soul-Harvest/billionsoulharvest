import type { Event, EventPageBlock, EventSpeaker, EventProgram, EventFaq } from "@/shared/types/database";
import { HeroBlock } from "./blocks/hero-block";
import { RichTextBlock } from "./blocks/rich-text-block";
import { SpeakersBlock } from "./blocks/speakers-block";
import { ScheduleBlock } from "./blocks/schedule-block";
import { FaqBlock } from "./blocks/faq-block";
import { ImageBlock } from "./blocks/image-block";
import { VideoBlock } from "./blocks/video-block";
import { CtaBlock } from "./blocks/cta-block";

interface Props {
  event: Event;
  blocks: EventPageBlock[];
  speakers: EventSpeaker[];
  programs: EventProgram[];
  faqs: EventFaq[];
}

export function BlockRenderer({ event, blocks, speakers, programs, faqs }: Props) {
  return (
    <>
      {blocks.map((block) => {
        const key = block.id;
        switch (block.block_type) {
          case "hero":
            return <HeroBlock key={key} event={event} config={block.content} />;
          case "rich_text":
            return <RichTextBlock key={key} title={block.title} config={block.content} />;
          case "speakers": {
            const filterRoles = block.content.filter_roles as string[] | undefined;
            const filtered = filterRoles
              ? speakers.filter((s) => filterRoles.includes(s.role))
              : speakers;
            return <SpeakersBlock key={key} speakers={filtered} title={block.title} />;
          }
          case "schedule":
            return <ScheduleBlock key={key} programs={programs} speakers={speakers} title={block.title} />;
          case "faq": {
            const filterCategory = block.content.filter_category as string | null | undefined;
            const filtered = filterCategory
              ? faqs.filter((f) => f.category === filterCategory)
              : faqs;
            return <FaqBlock key={key} faqs={filtered} title={block.title} />;
          }
          case "image":
            return <ImageBlock key={key} config={block.content} />;
          case "video":
            return <VideoBlock key={key} config={block.content} />;
          case "cta":
            return <CtaBlock key={key} event={event} config={block.content} />;
          default:
            return null;
        }
      })}
    </>
  );
}
