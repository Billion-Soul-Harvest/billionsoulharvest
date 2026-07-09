import type { EventProgram, EventSpeaker } from "@/shared/types/database";
import { EventProgramSchedule } from "../event-program";

interface Props {
  programs: EventProgram[];
  speakers: EventSpeaker[];
  title: string | null;
}

export function ScheduleBlock({ programs, speakers }: Props) {
  return <EventProgramSchedule programs={programs} speakers={speakers} />;
}
