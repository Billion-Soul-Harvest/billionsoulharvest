"use client";

import { useState } from "react";
import { EventsList } from "./events-list";
import { DisplayOrderList } from "./display-order-list";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  event_type: string | null;
  start_date: string | null;
  city: string | null;
  country: string | null;
  external_url: string | null;
}

interface DisplayOrderEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  country: string | null;
  banner_url: string | null;
  status: string;
  is_external: boolean;
  external_url: string | null;
  display_order: number | null;
}

interface Props {
  events: EventRow[];
  displayOrderEvents: DisplayOrderEvent[];
  registrationCounts: Record<string, number>;
}

export function EventsPageTabs({ events, displayOrderEvents, registrationCounts }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "display-order">("all");

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setActiveTab("display-order")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "display-order"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Display Order
        </button>
      </div>

      {activeTab === "all" ? (
        <EventsList events={events} registrationCounts={registrationCounts} />
      ) : (
        <DisplayOrderList events={displayOrderEvents} />
      )}
    </div>
  );
}
