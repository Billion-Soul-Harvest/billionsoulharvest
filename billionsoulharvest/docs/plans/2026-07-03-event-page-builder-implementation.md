# Free-Form Event Page Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the form-based block editor with a Wix-style free-form drag-and-drop page builder using Craft.js.

**Architecture:** Full-screen Craft.js editor at `/admin/events/edit/{id}/builder` with toolbox (left), canvas (center), settings panel (right). Event metadata collected via setup form before entering builder. Serialized JSON stored in `events.page_content`. Public page renders from JSON without Craft.js dependency. Auto-reflow on mobile.

**Tech Stack:** @craftjs/core, @tiptap/react (already installed), Supabase, Next.js 16, Tailwind CSS

---

### Task 1: Install Craft.js and add DB migration

**Files:**
- Modify: `package.json`
- Create: `supabase/migrations/012_page_content_column.sql`

**Step 1: Install @craftjs/core**

Run: `npm install @craftjs/core`

**Step 2: Create migration**

Create `supabase/migrations/012_page_content_column.sql`:

```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT NULL;
```

**Step 3: Apply migration**

Run: `npx supabase migration up --local`
Expected: Migration applied successfully

**Step 4: Verify**

Run: `npx supabase db query --local "SELECT column_name FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'page_content'"`
Expected: Returns `page_content` row

---

### Task 2: Create Craft.js builder components — Text

**Files:**
- Create: `src/features/events/builder/components/craft-text.tsx`

**Step 1: Create the Text component**

This is both the editor component (with inline Tiptap editing) and the settings panel. Uses `useNode` for Craft.js integration.

```tsx
"use client";

import { useNode } from "@craftjs/core";
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TextProps {
  text: string;
  fontSize: number;
  textAlign: "left" | "center" | "right";
  color: string;
  width: number;
  height: number;
}

export const CraftText = ({ text, fontSize, textAlign, color, width, height }: TextProps) => {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: text,
    editable: selected,
    onUpdate: ({ editor: e }) => {
      setProp((props: TextProps) => { props.text = e.getHTML(); }, 500);
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(selected);
  }, [selected, editor]);

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      style={{
        fontSize: `${fontSize}px`,
        textAlign,
        color,
        width: `${width}px`,
        minHeight: `${height}px`,
        cursor: selected ? "text" : "grab",
      }}
      className="prose prose-sm max-w-none [&_.tiptap]:outline-none"
    >
      {editor ? <EditorContent editor={editor} /> : <div dangerouslySetInnerHTML={{ __html: text }} />}
    </div>
  );
};

const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TextProps,
  }));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Font Size</Label>
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) => setProp((p: TextProps) => { p.fontSize = parseInt(e.target.value) || 16; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Color</Label>
        <Input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: TextProps) => { p.color = e.target.value; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Text Align</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((align) => (
            <Button
              key={align}
              size="sm"
              variant={props.textAlign === align ? "default" : "outline"}
              onClick={() => setProp((p: TextProps) => { p.textAlign = align; })}
              className="flex-1 capitalize"
            >
              {align}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>Width</Label>
          <Input
            type="number"
            value={props.width}
            onChange={(e) => setProp((p: TextProps) => { p.width = parseInt(e.target.value) || 300; })}
          />
        </div>
        <div className="space-y-1">
          <Label>Height</Label>
          <Input
            type="number"
            value={props.height}
            onChange={(e) => setProp((p: TextProps) => { p.height = parseInt(e.target.value) || 40; })}
          />
        </div>
      </div>
    </div>
  );
};

CraftText.craft = {
  displayName: "Text",
  props: {
    text: "<p>Edit this text</p>",
    fontSize: 16,
    textAlign: "left" as const,
    color: "#ffffff",
    width: 400,
    height: 40,
  },
  related: {
    settings: TextSettings,
  },
};
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds (component not yet imported anywhere)

---

### Task 3: Create builder components — Image, Button, Video

**Files:**
- Create: `src/features/events/builder/components/craft-image.tsx`
- Create: `src/features/events/builder/components/craft-button.tsx`
- Create: `src/features/events/builder/components/craft-video.tsx`

Each component follows the same pattern: render with `useNode` + `connect(drag())`, export a `.craft` config with `displayName`, `props`, and `related.settings`.

**Image component** — uses existing `ImageUpload` for the settings panel, renders `<img>` on canvas.

**Button component** — renders a styled button, settings for text, link URL, background color, text color, border radius.

**Video component** — extracts YouTube/Vimeo embed URL, renders iframe, settings for URL and aspect ratio.

---

### Task 4: Create builder components — Container, Divider

**Files:**
- Create: `src/features/events/builder/components/craft-container.tsx`
- Create: `src/features/events/builder/components/craft-divider.tsx`

**Container** is special — it uses `<Element canvas>` so it can accept dropped children. Settings: background color, background image, padding, border radius.

**Divider** — simple `<hr>` with settings for color, thickness, width percentage.

---

### Task 5: Create builder components — Event Data (dynamic)

**Files:**
- Create: `src/features/events/builder/components/event-data.tsx`

Four components that read from an event context:
- `CraftEventTitle` — renders `event.title` with font/color settings
- `CraftEventDates` — renders formatted date range
- `CraftEventLocation` — renders city/country
- `CraftRegisterButton` — links to `/register/{slug}`, conditionally visible

These share an `EventDataContext` that the builder wraps around the canvas with the current event data.

**Step 1: Create event data context**

Create `src/features/events/builder/event-context.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";
import type { Event } from "@/shared/types/database";

const EventContext = createContext<Event | null>(null);

export const EventProvider = EventContext.Provider;

export function useEventData() {
  const event = useContext(EventContext);
  if (!event) throw new Error("useEventData must be used within EventProvider");
  return event;
}
```

**Step 2: Create the four event data components in `event-data.tsx`**

Each uses `useEventData()` to pull live event fields and `useNode()` for Craft.js integration.

---

### Task 6: Create Toolbox panel

**Files:**
- Create: `src/features/events/builder/toolbox.tsx`

The left sidebar with draggable elements. Uses `useEditor().connectors.create` to make each item draggable onto the canvas.

```tsx
"use client";

import { useEditor, Element } from "@craftjs/core";
import { CraftText } from "./components/craft-text";
import { CraftImage } from "./components/craft-image";
import { CraftButton } from "./components/craft-button";
import { CraftVideo } from "./components/craft-video";
import { CraftContainer } from "./components/craft-container";
import { CraftDivider } from "./components/craft-divider";
import { CraftEventTitle, CraftEventDates, CraftEventLocation, CraftRegisterButton } from "./components/event-data";

const toolboxItems = [
  { label: "Content", items: [
    { name: "Text", icon: "T", element: <CraftText /> },
    { name: "Image", icon: "img", element: <CraftImage /> },
    { name: "Button", icon: "btn", element: <CraftButton /> },
    { name: "Video", icon: "vid", element: <CraftVideo /> },
  ]},
  { label: "Layout", items: [
    { name: "Container", icon: "[ ]", element: <Element is={CraftContainer} canvas /> },
    { name: "Divider", icon: "—", element: <CraftDivider /> },
  ]},
  { label: "Event Data", items: [
    { name: "Title", icon: "Tt", element: <CraftEventTitle /> },
    { name: "Dates", icon: "cal", element: <CraftEventDates /> },
    { name: "Location", icon: "pin", element: <CraftEventLocation /> },
    { name: "Register", icon: "→", element: <CraftRegisterButton /> },
  ]},
];

export function Toolbox() {
  const { connectors } = useEditor();

  return (
    <div className="w-56 bg-white border-r overflow-y-auto p-3 space-y-4">
      {toolboxItems.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((item) => (
              <div
                key={item.name}
                ref={(ref) => ref && connectors.create(ref, item.element)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-gray-200 cursor-grab hover:border-[#29BDD6] hover:bg-[#29BDD6]/5 transition-colors text-center"
              >
                <span className="text-sm font-mono text-gray-500">{item.icon}</span>
                <span className="text-[11px] text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### Task 7: Create Settings panel

**Files:**
- Create: `src/features/events/builder/settings-panel.tsx`

The right sidebar that shows the selected component's settings. Uses `useEditor()` to get the selected node and renders its `related.settings` component.

```tsx
"use client";

import { useEditor } from "@craftjs/core";
import { Button } from "@/components/ui/button";

export function SettingsPanel() {
  const { selected, actions } = useEditor((state, query) => {
    const currentNodeId = query.getEvent("selected").last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.displayName,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return { selected };
  });

  if (!selected) {
    return (
      <div className="w-64 bg-white border-l p-4">
        <p className="text-sm text-gray-400 text-center mt-8">
          Click an element on the canvas to edit its settings
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-l overflow-y-auto">
      <div className="p-4 border-b">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {selected.name}
        </p>
      </div>
      <div className="p-4">
        {selected.settings && React.createElement(selected.settings)}
      </div>
      {selected.isDeletable && (
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => actions.delete(selected.id)}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

### Task 8: Create the Canvas / Viewport

**Files:**
- Create: `src/features/events/builder/viewport.tsx`

The center area with the Craft.js `<Frame>`. Includes viewport width switcher (Desktop/Tablet/Phone).

The canvas is a scrollable area with a dark background. The Frame renders inside a centered container with the selected viewport width.

---

### Task 9: Create the main Editor page

**Files:**
- Create: `src/features/events/builder/editor.tsx`
- Create: `src/app/admin/events/edit/[id]/builder/page.tsx`

**Step 1: Create `editor.tsx`**

The main editor component that wraps everything in Craft.js `<Editor>`. Includes:
- Top bar: Back button, event title, Save/Publish/Preview buttons
- Body: Toolbox (left) | Canvas (center) | Settings (right)
- Save handler: `query.serialize()` → save to `events.page_content`
- `EventProvider` wrapping the canvas with current event data

**Step 2: Create the route page**

`src/app/admin/events/edit/[id]/builder/page.tsx` — Server component that fetches event data from Supabase and passes to the client-side Editor.

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/features/events/builder/editor";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  return <PageBuilder event={event} />;
}
```

---

### Task 10: Update Event Form to redirect to builder

**Files:**
- Modify: `src/features/events/event-form.tsx`

On create, after saving the event, redirect to `/admin/events/edit/{id}/builder` instead of the edit page.

On the admin event edit page, add a "Open Builder" button that links to the builder route.

---

### Task 11: Update admin event edit page

**Files:**
- Modify: `src/app/admin/events/edit/[id]/page.tsx`

Replace the tabbed interface (Details, Speakers, Program, FAQ, Sections, Pages) with:
- Event metadata form (simplified — title, slug, dates, location, status, banner)
- "Open Page Builder" button linking to `/admin/events/edit/{id}/builder`

---

### Task 12: Create public page renderer (no Craft.js)

**Files:**
- Create: `src/features/events/builder/render.tsx`
- Modify: `src/app/(events)/events/[slug]/[[...pageSlug]]/page.tsx`

**Step 1: Create `render.tsx`**

A standalone renderer that takes the serialized Craft.js JSON and renders it without importing `@craftjs/core`. This keeps the public bundle small.

The renderer:
1. Parses the JSON node tree
2. Maps each node type to a lightweight view component
3. Renders with absolute positioning on desktop
4. Auto-reflows on mobile (sorted by Y then X, stacked vertically)

**Step 2: Update public event page**

In the event page route, check `event.page_content`:
- If present → render with `PageRenderer`
- If null → fall back to legacy layout (existing behavior)

---

### Task 13: Build verification

**Step 1: Run full build**

Run: `npx next build`
Expected: Build succeeds with no type errors

**Step 2: Visual verification**

1. Navigate to admin → Events → edit an event → Open Builder
2. Drag Text element onto canvas
3. Type text inline
4. Drag Image, set upload
5. Save → verify JSON stored in `events.page_content`
6. Open public event page → verify rendered correctly
7. Resize browser to mobile → verify auto-reflow

---

## Implementation Order

```
Task 1:  Install + migration           (foundation)
Task 2:  CraftText component           (core element)
Task 3:  CraftImage, CraftButton, CraftVideo  (content elements)
Task 4:  CraftContainer, CraftDivider  (layout elements)
Task 5:  Event data components          (dynamic elements)
Task 6:  Toolbox panel                  (left sidebar)
Task 7:  Settings panel                 (right sidebar)
Task 8:  Canvas / Viewport             (center area)
Task 9:  Main editor page              (assembles everything)
Task 10: Update event form             (redirect to builder)
Task 11: Update admin edit page        (add builder button)
Task 12: Public renderer               (view-only, no Craft.js)
Task 13: Build verification            (end-to-end test)
```
