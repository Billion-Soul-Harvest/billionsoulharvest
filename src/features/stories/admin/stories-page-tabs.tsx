"use client";

import { useState } from "react";
import { StoriesList } from "./stories-list";
import { StoryDisplayOrderList } from "./story-display-order-list";

interface StoryRow {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  author: string | null;
  published_at: string | null;
  content_html: string | null;
  gallery_images: { url: string }[] | null;
}

interface DisplayOrderStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  banner_url: string | null;
  published_at: string | null;
  display_order: number | null;
}

interface Props {
  stories: StoryRow[];
  displayOrderStories: DisplayOrderStory[];
}

export function StoriesPageTabs({ stories, displayOrderStories }: Props) {
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
          All Stories
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
        <StoriesList stories={stories} />
      ) : (
        <StoryDisplayOrderList stories={displayOrderStories} />
      )}
    </div>
  );
}
