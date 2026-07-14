"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/shared/utils/supabase/client";

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
  stories: DisplayOrderStory[];
}

function SortableStoryCard({ story, isDragOverlay }: { story: DisplayOrderStory; isDragOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing ${
        isDragOverlay ? "shadow-2xl ring-2 ring-blue-400" : "hover:shadow-lg"
      } transition-shadow`}
    >
      {story.banner_url ? (
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={story.banner_url}
            alt={story.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-[#0d223f] to-[#29BDD6] flex items-center justify-center">
          <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      )}
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {story.title}
        </h2>
        {story.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{story.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {story.author && <span>{story.author}</span>}
          {story.author && story.published_at && <span>&middot;</span>}
          {story.published_at && (
            <span>{new Date(story.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function StoryDisplayOrderList({ stories: initialStories }: Props) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [activeStory, setActiveStory] = useState<DisplayOrderStory | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveStory(stories.find((s) => s.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveStory(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setStories((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setHasChanges(true);
  }

  async function saveOrder() {
    setSaving(true);
    const supabase = createClient();

    for (let i = 0; i < stories.length; i++) {
      const { error } = await supabase
        .from("stories")
        .update({ display_order: i + 1 })
        .eq("id", stories[i].id);
      if (error) {
        alert(`Failed to save order: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    setHasChanges(false);
    setSaving(false);
    router.refresh();
  }

  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p className="text-lg text-gray-500">
          No published stories to order. Publish stories to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Drag and drop to reorder how stories appear on the public site.
        </p>
        <button
          onClick={saveOrder}
          disabled={!hasChanges || saving}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasChanges
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Order"}
        </button>
      </div>

      <div className="bg-[#f9f9ff] rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-[#0d223f] tracking-[-0.02em] mb-8">
          Stories
        </h2>

        <DndContext
          id="story-display-order-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={stories.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <SortableStoryCard key={story.id} story={story} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeStory ? (
              <SortableStoryCard story={activeStory} isDragOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
