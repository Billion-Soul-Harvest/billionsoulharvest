"use client";

import { createContext, useContext } from "react";
import type { Event } from "@/shared/types/database";

const EventContext = createContext<Event | null>(null);

export const EventProvider = EventContext.Provider;

export function useEventData(): Event {
  const event = useContext(EventContext);
  if (!event) throw new Error("useEventData must be used within EventProvider");
  return event;
}
