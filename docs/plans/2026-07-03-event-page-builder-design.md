# Event Page Builder — Free-Form Drag-and-Drop

## Overview

Replace the form-based block editor with a Wix-style free-form drag-and-drop page builder using Craft.js. Admins visually compose event pages by dragging elements onto a canvas with absolute positioning. On mobile, elements auto-reflow into a vertical stack.

## Architecture

### Two-Step Flow

1. **Event Setup Form** — Collects metadata (title, slug, dates, location, status, banner, region, type). On first create, picks a starter template. Saves to `events` table. Redirects to builder.
2. **Full-Screen Builder** — Route: `/admin/events/edit/{id}/builder`. Craft.js canvas with drag-and-drop. Serialized state saved as JSON in `events.page_content` column.

### Stack

- `@craftjs/core` — Editor framework (drag-drop, serialization, node tree)
- `@tiptap/react` — Inline text editing within Craft.js text components (already installed)
- Supabase Storage — Image uploads via existing `image-upload.tsx`
- Tailwind — Styling for editor UI and rendered output

## Builder Layout

```
┌─────────────────────────────────────────────────────┐
│ ← Back   Event Title              [Save] [Publish] [Preview] │
├────────┬────────────────────────────────┬───────────┤
│ TOOLBOX│       CANVAS                   │ SETTINGS  │
│        │   (free-form positioning)      │ PANEL     │
│ Content│                                │           │
│  Text  │   Elements placed with         │ Selected: │
│  Image │   absolute X/Y coords          │ [element] │
│  Button│                                │ ───────── │
│  Video │   Fixed 1200px width           │ Props...  │
│        │   Auto-expanding height        │           │
│ Layout │                                │           │
│  Container                              │           │
│  Divider                                │           │
│        │                                │           │
│ Data   │                                │           │
│  Title │                                │           │
│  Dates │                                │           │
│  Location                               │           │
│  Register                               │           │
├────────┴────────────────────────────────┴───────────┤
│ Desktop [1200px] | Tablet [768px] | Phone [375px]   │
└─────────────────────────────────────────────────────┘
```

## Toolbox Elements

### Content

| Element | Description | Settings |
|---------|------------|----------|
| Text | Inline-editable rich text via Tiptap | Font size, color, alignment, bold/italic/underline |
| Image | Upload via Supabase Storage | Size, border radius, alt text, link |
| Button | Clickable CTA | Text, link URL, colors, border radius, size |
| Video | YouTube/Vimeo embed | URL, aspect ratio |

### Layout

| Element | Description | Settings |
|---------|------------|----------|
| Container | Groups elements, acts as inner canvas | Background color/image, padding, border radius |
| Divider | Horizontal line | Color, thickness, width |

### Event Data (dynamic)

| Element | Description | Settings |
|---------|------------|----------|
| Event Title | Renders `event.title` | Font size, color, alignment |
| Event Dates | Renders formatted `start_date – end_date` | Format, color |
| Event Location | Renders `city, country` | Color |
| Register Button | Links to `/register/{slug}`, visible only when status = `registration_open` | Colors, text |

## Data Model

New column on existing `events` table:

```sql
ALTER TABLE events ADD COLUMN page_content JSONB DEFAULT NULL;
```

- `page_content` stores the Craft.js serialized node tree
- When NULL, public page falls back to legacy layout
- Existing `event_pages` and `event_page_blocks` tables remain for backward compatibility

## Free-Form Positioning

- Elements have `x`, `y`, `width`, `height` as Craft.js node props
- Canvas: fixed 1200px width, auto-expanding height
- Drag to move, resize handles on corners/edges
- 8px snap-to-grid
- Alignment guides when near other elements

## Auto-Reflow (Mobile)

On the public page when viewport < 768px:

- Elements switch from absolute to relative positioning
- Sorted by Y position (top-to-bottom), then X (left-to-right)
- Widths become 100%
- Containers stack children vertically
- Handled in CSS/render logic, not stored separately

## Public Rendering

Route `/events/{slug}`:

- If `page_content` exists: deserialize JSON and render with view-only components (no Craft.js dependency on public page)
- If NULL: fall back to legacy layout

View components are lightweight render-only versions of editor components — same visual output, no drag handles or editor chrome.

## Admin Flow

1. Admin goes to `/admin/events` → clicks "New Event"
2. Fills setup form (title, dates, location, status)
3. Clicks "Create" → redirected to `/admin/events/edit/{id}/builder`
4. Drags elements onto canvas, edits inline
5. Clicks "Save" → serialized JSON saved to `events.page_content`
6. Clicks "Preview" → opens `/events/{slug}?preview=true` in new tab
7. Clicks "Publish" → sets event status, page goes live

## Key Files

| File | Purpose |
|------|---------|
| `src/app/admin/events/edit/[id]/builder/page.tsx` | Full-screen builder route |
| `src/features/events/builder/editor.tsx` | Craft.js Editor wrapper |
| `src/features/events/builder/toolbox.tsx` | Draggable element palette |
| `src/features/events/builder/settings-panel.tsx` | Selected element settings |
| `src/features/events/builder/viewport.tsx` | Canvas with viewport switcher |
| `src/features/events/builder/components/text.tsx` | Text element (editor + view) |
| `src/features/events/builder/components/image.tsx` | Image element (editor + view) |
| `src/features/events/builder/components/button.tsx` | Button element (editor + view) |
| `src/features/events/builder/components/video.tsx` | Video element (editor + view) |
| `src/features/events/builder/components/container.tsx` | Container element (editor + view) |
| `src/features/events/builder/components/divider.tsx` | Divider element (editor + view) |
| `src/features/events/builder/components/event-title.tsx` | Dynamic event title |
| `src/features/events/builder/components/event-dates.tsx` | Dynamic event dates |
| `src/features/events/builder/components/event-location.tsx` | Dynamic event location |
| `src/features/events/builder/components/register-button.tsx` | Dynamic register CTA |
| `src/features/events/builder/render.tsx` | Public page renderer (no Craft.js) |
| `src/app/(events)/events/[slug]/[[...pageSlug]]/page.tsx` | Updated public route |
| `supabase/migrations/012_page_content_column.sql` | Add page_content column |
