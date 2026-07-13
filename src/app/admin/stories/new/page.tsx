import { StoryForm } from "@/features/stories/story-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Story — BSH Admin",
};

export default async function NewStoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Story</h1>
      <StoryForm />
    </div>
  );
}
