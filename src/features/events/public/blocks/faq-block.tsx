import type { EventFaq } from "@/shared/types/database";
import { EventFaqSection } from "../event-faq";

interface Props {
  faqs: EventFaq[];
  title: string | null;
}

export function FaqBlock({ faqs }: Props) {
  return <EventFaqSection faqs={faqs} />;
}
