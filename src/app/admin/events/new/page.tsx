import { EventForm } from "@/features/events/event-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Gathering — BSH Admin",
};

export default async function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Gathering</h1>
      <EventForm />
    </div>
  );
}
