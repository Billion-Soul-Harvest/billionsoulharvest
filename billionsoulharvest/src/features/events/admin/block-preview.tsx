"use client";

import type { Event, EventPageBlock, EventSpeaker, EventProgram, EventFaq } from "@/shared/types/database";
import { BlockRenderer } from "@/features/events/public/block-renderer";

interface Props {
  event: Event;
  blocks: EventPageBlock[];
  speakers: EventSpeaker[];
  programs: EventProgram[];
  faqs: EventFaq[];
  activeBlockId?: string | null;
}

export function BlockPreview({ event, blocks, speakers, programs, faqs }: Props) {
  const sortedBlocks = [...blocks].sort((a, b) => a.sort_order - b.sort_order);

  if (sortedBlocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Add blocks to see a live preview
      </div>
    );
  }

  return (
    <div className="bg-[#0f2744] min-h-full rounded-lg overflow-hidden">
      <BlockRenderer
        event={event}
        blocks={sortedBlocks}
        speakers={speakers}
        programs={programs}
        faqs={faqs}
      />
    </div>
  );
}
