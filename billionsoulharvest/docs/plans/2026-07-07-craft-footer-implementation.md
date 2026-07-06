# CraftFooter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static PersistentFooter with a real Craft.js canvas component (`CraftFooter`) that's selectable, editable via the right panel, and AI-enhanceable — while persisting across all pages.

**Architecture:** `CraftFooter` is a Craft.js canvas component (like `CraftContainer`) rendered inside the `<Frame>`. Its subtree is stored in `site_settings.footer_content` separately from page content. On builder load, the footer JSON is injected as the last ROOT child. On save, it's extracted and saved back to `site_settings`. The public site renders the footer from this stored JSON via `CraftPageRenderer`.

**Tech Stack:** Craft.js, React, Next.js, Supabase (site_settings table)

---

### Task 1: Create CraftFooter component

**Files:**
- Create: `src/features/events/builder/components/craft-footer.tsx`

**Step 1: Create the component file**

Model it after `CraftContainer` (`src/features/events/builder/components/craft-container.tsx`) but:
- Renders as `<footer>` instead of `<div>`
- Has `craft.rules` that prevent deletion and dragging:
  ```ts
  rules: {
    canDrag: () => false,
    canMoveIn: () => true,
    canMoveOut: () => false,
  }
  ```
- displayName: `"Footer"`
- Default props: `backgroundColor: "#0a1e38"`, `padding: 48`, `minHeight: 100`, `width: 1200`, `borderTopColor: "rgba(255,255,255,0.1)"`, `borderTopWidth: 1`

```tsx
"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FooterProps {
  backgroundColor?: string;
  padding?: number;
  width?: number;
  minHeight?: number;
  borderTopColor?: string;
  borderTopWidth?: number;
  children?: React.ReactNode;
}

export const CraftFooter: UserComponent<FooterProps> = ({
  backgroundColor = "#0a1e38",
  padding = 48,
  width = 1200,
  minHeight = 100,
  borderTopColor = "rgba(255,255,255,0.1)",
  borderTopWidth = 1,
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <footer
      ref={craftRef(connect, drag)}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        width: `${width}px`,
        maxWidth: "100%",
        minHeight: `${minHeight}px`,
        borderTop: borderTopWidth > 0 ? `${borderTopWidth}px solid ${borderTopColor}` : "none",
        outline: selected ? "2px solid #D4A843" : "none",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {children}
    </footer>
  );
};

function FooterSettings() {
  const {
    actions: { setProp },
    backgroundColor,
    padding,
    minHeight,
    borderTopColor,
    borderTopWidth,
  } = useNode((node) => ({
    backgroundColor: node.data.props.backgroundColor as string,
    padding: node.data.props.padding as number,
    minHeight: node.data.props.minHeight as number,
    borderTopColor: node.data.props.borderTopColor as string,
    borderTopWidth: node.data.props.borderTopWidth as number,
  }));

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
        <p className="text-[10px] text-amber-700">This footer appears on all pages. Edit its children to change content.</p>
      </div>

      <div>
        <Label htmlFor="footer-bg">Background Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setProp((p: FooterProps) => { p.backgroundColor = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
          />
          <Input
            id="footer-bg"
            type="text"
            value={backgroundColor}
            onChange={(e) => setProp((p: FooterProps) => { p.backgroundColor = e.target.value; })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="footer-padding">Padding</Label>
        <Input
          id="footer-padding"
          type="number"
          value={padding}
          min={0}
          onChange={(e) => setProp((p: FooterProps) => { p.padding = Number(e.target.value); })}
        />
      </div>

      <div>
        <Label htmlFor="footer-minheight">Min Height</Label>
        <Input
          id="footer-minheight"
          type="number"
          value={minHeight}
          min={0}
          onChange={(e) => setProp((p: FooterProps) => { p.minHeight = Number(e.target.value); })}
        />
      </div>

      <div>
        <Label htmlFor="footer-border-color">Border Top Color</Label>
        <Input
          id="footer-border-color"
          type="text"
          value={borderTopColor}
          onChange={(e) => setProp((p: FooterProps) => { p.borderTopColor = e.target.value; })}
        />
      </div>

      <div>
        <Label htmlFor="footer-border-width">Border Top Width</Label>
        <Input
          id="footer-border-width"
          type="number"
          value={borderTopWidth}
          min={0}
          onChange={(e) => setProp((p: FooterProps) => { p.borderTopWidth = Number(e.target.value); })}
        />
      </div>
    </div>
  );
}

CraftFooter.craft = {
  displayName: "Footer",
  props: {
    backgroundColor: "#0a1e38",
    padding: 48,
    width: 1200,
    minHeight: 100,
    borderTopColor: "rgba(255,255,255,0.1)",
    borderTopWidth: 1,
  },
  related: {
    settings: FooterSettings,
  },
  rules: {
    canDrag: () => false,
    canMoveIn: () => true,
    canMoveOut: () => false,
  },
};
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: add CraftFooter Craft.js canvas component
```

---

### Task 2: Register CraftFooter in resolvers and schema

**Files:**
- Modify: `src/features/website/builder/site-page-builder.tsx` — add to resolver
- Modify: `src/features/events/builder/ai/craft-schema.ts` — add schema entry

**Step 1: Add CraftFooter import and resolver entry in `site-page-builder.tsx`**

Add import:
```tsx
import { CraftFooter } from "@/features/events/builder/components/craft-footer";
```

Add to the `resolver` object:
```tsx
CraftFooter,
```

**Step 2: Add schema entry in `craft-schema.ts`**

Add to the `componentSchemas` array (after `CraftHeader`):

```ts
{
  resolvedName: "CraftFooter",
  isCanvas: true,
  description: "Site footer section. Persistent across all pages. Cannot be deleted. Contains child nodes for footer content (text, links, social icons, etc.).",
  props: [
    { name: "backgroundColor", type: "string (hex/rgba)", default: "#0a1e38" },
    { name: "padding", type: "number", default: 48 },
    { name: "width", type: "number", default: 1200 },
    { name: "minHeight", type: "number", default: 100 },
    { name: "borderTopColor", type: "string (hex/rgba)", default: "rgba(255,255,255,0.1)" },
    { name: "borderTopWidth", type: "number", default: 1 },
  ],
},
```

**Step 3: Verify**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```
feat: register CraftFooter in resolver and AI schema
```

---

### Task 3: Add CraftFooter to the public site renderer

**Files:**
- Modify: `src/features/events/builder/render.tsx`

**Step 1: Add CraftFooter case in the switch statement**

In `render.tsx`, in the `RenderNode` function's switch statement, after the `CraftHeader` case (around line 237), add:

```tsx
case "CraftFooter": {
  const footerBg = (props.backgroundColor as string) ?? "#0a1e38";
  const footerPad = (props.padding as number) ?? 48;
  const footerBorderColor = (props.borderTopColor as string) ?? "rgba(255,255,255,0.1)";
  const footerBorderWidth = (props.borderTopWidth as number) ?? 1;
  return (
    <footer
      style={{
        backgroundColor: footerBg,
        padding: `${footerPad}px`,
        width: "100%",
        maxWidth: "100%",
        borderTop: footerBorderWidth > 0 ? `${footerBorderWidth}px solid ${footerBorderColor}` : "none",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {children}
    </footer>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: add CraftFooter rendering case in public site renderer
```

---

### Task 4: Build the default footer JSON template

**Files:**
- Create: `src/features/events/builder/default-footer.ts`

**Step 1: Create the default footer template**

This file exports a function that returns the Craft.js JSON subtree for the default footer matching the approved design (3-column: brand+social, quick links, connect + bottom copyright bar).

```ts
/**
 * Returns the default footer Craft.js JSON subtree.
 * The returned object has a "FOOTER" root node and all its children.
 * Node IDs are prefixed with "footer-" to avoid collisions with page content.
 */
export function buildDefaultFooterJson(): Record<string, unknown> {
  return {
    "footer-root": {
      type: { resolvedName: "CraftFooter" },
      isCanvas: true,
      props: {
        backgroundColor: "#0a1e38",
        padding: 48,
        width: 1200,
        minHeight: 100,
        borderTopColor: "rgba(255,255,255,0.1)",
        borderTopWidth: 1,
      },
      nodes: ["footer-main-row", "footer-divider", "footer-bottom-row"],
      linkedNodes: {},
      parent: "ROOT",
    },
    "footer-main-row": {
      type: { resolvedName: "CraftRow" },
      isCanvas: true,
      props: { gap: 48, alignItems: "flex-start", flexWrap: "wrap", padding: 0, backgroundColor: "transparent", minHeight: 60 },
      nodes: ["footer-col-brand", "footer-col-links", "footer-col-connect"],
      linkedNodes: {},
      parent: "footer-root",
    },
    "footer-col-brand": {
      type: { resolvedName: "CraftColumn" },
      isCanvas: true,
      props: { width: "40%", minWidth: 200, padding: 0, backgroundColor: "transparent", alignItems: "flex-start", justifyContent: "flex-start", gap: 16 },
      nodes: ["footer-brand-title", "footer-brand-desc", "footer-brand-social"],
      linkedNodes: {},
      parent: "footer-main-row",
    },
    "footer-brand-title": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: { text: "<p><strong>Billion Soul Harvest</strong></p>", fontSize: 22, color: "#ffffff", textAlign: "left", width: 400, height: 40 },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-brand",
    },
    "footer-brand-desc": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: {
        text: "<p>Uniting the global Church to catalyze the greatest harvest of souls in history — reaching 1 billion people with the Gospel by 2033.</p>",
        fontSize: 14,
        color: "#9ca3af",
        textAlign: "left",
        width: 400,
        height: 80,
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-brand",
    },
    "footer-brand-social": {
      type: { resolvedName: "CraftSocialLinks" },
      isCanvas: true,
      props: {
        links: [
          { platform: "facebook", url: "#" },
          { platform: "instagram", url: "#" },
          { platform: "x", url: "#" },
          { platform: "youtube", url: "#" },
        ],
        iconSize: 20,
        iconColor: "#9ca3af",
        gap: 16,
        alignment: "left",
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-brand",
    },
    "footer-col-links": {
      type: { resolvedName: "CraftColumn" },
      isCanvas: true,
      props: { width: "25%", minWidth: 150, padding: 0, backgroundColor: "transparent", alignItems: "flex-start", justifyContent: "flex-start", gap: 8 },
      nodes: ["footer-links-title", "footer-links-list"],
      linkedNodes: {},
      parent: "footer-main-row",
    },
    "footer-links-title": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: { text: "<p><strong>Quick Links</strong></p>", fontSize: 14, color: "#ffffff", textAlign: "left", width: 200, height: 30 },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-links",
    },
    "footer-links-list": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: {
        text: "<p>About BSH</p><p>Global Gatherings</p><p>2033 Vision</p><p>Partner With Us</p>",
        fontSize: 14,
        color: "#9ca3af",
        textAlign: "left",
        width: 200,
        height: 120,
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-links",
    },
    "footer-col-connect": {
      type: { resolvedName: "CraftColumn" },
      isCanvas: true,
      props: { width: "35%", minWidth: 200, padding: 0, backgroundColor: "transparent", alignItems: "flex-start", justifyContent: "flex-start", gap: 8 },
      nodes: ["footer-connect-title", "footer-connect-desc", "footer-connect-email"],
      linkedNodes: {},
      parent: "footer-main-row",
    },
    "footer-connect-title": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: { text: "<p><strong>Connect</strong></p>", fontSize: 14, color: "#ffffff", textAlign: "left", width: 300, height: 30 },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-connect",
    },
    "footer-connect-desc": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: {
        text: "<p>Have questions or want to partner with the movement? We'd love to hear from you.</p>",
        fontSize: 14,
        color: "#9ca3af",
        textAlign: "left",
        width: 300,
        height: 60,
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-connect",
    },
    "footer-connect-email": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: {
        text: '<p><a href="mailto:info@billionsoulharvest.org" style="color: #06b6d4;">info@billionsoulharvest.org</a></p>',
        fontSize: 14,
        color: "#06b6d4",
        textAlign: "left",
        width: 300,
        height: 30,
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-col-connect",
    },
    "footer-divider": {
      type: { resolvedName: "CraftDivider" },
      isCanvas: true,
      props: { color: "rgba(255,255,255,0.1)", thickness: 1, widthPercent: 100, marginY: 8 },
      nodes: [],
      linkedNodes: {},
      parent: "footer-root",
    },
    "footer-bottom-row": {
      type: { resolvedName: "CraftRow" },
      isCanvas: true,
      props: { gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", padding: 0, backgroundColor: "transparent", minHeight: 30 },
      nodes: ["footer-copyright", "footer-legal-links"],
      linkedNodes: {},
      parent: "footer-root",
    },
    "footer-copyright": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: {
        text: `<p>© ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.</p>`,
        fontSize: 12,
        color: "#6b7280",
        textAlign: "left",
        width: 400,
        height: 24,
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-bottom-row",
    },
    "footer-legal-links": {
      type: { resolvedName: "CraftText" },
      isCanvas: true,
      props: {
        text: '<p><a href="/privacy" style="color: #6b7280;">Privacy Policy</a>  <a href="/terms" style="color: #6b7280;">Terms of Use</a>  <a href="/connect" style="color: #6b7280;">Contact</a></p>',
        fontSize: 12,
        color: "#6b7280",
        textAlign: "right",
        width: 400,
        height: 24,
      },
      nodes: [],
      linkedNodes: {},
      parent: "footer-bottom-row",
    },
  };
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: add default footer JSON template
```

---

### Task 5: Footer injection/extraction in the site page builder

This is the core wiring task. The site page builder must:
- On load: fetch `footer_content` from `site_settings`, inject it into the canvas JSON as the last ROOT child
- On save: extract the footer subtree from canvas, save it to `site_settings`, and remove it from `page_content`

**Files:**
- Modify: `src/app/admin/website/[id]/builder/page.tsx` — fetch footer_content and pass to builder
- Modify: `src/features/website/builder/site-page-builder.tsx` — inject/extract footer on load/save

**Step 1: Update the server page to fetch footer_content**

In `src/app/admin/website/[id]/builder/page.tsx`, change the `site_settings` query to fetch `footer_content` instead of `footer_config`:

```tsx
const [{ data: allPages, error }, { data: footerRow }] = await Promise.all([
  supabase
    .from("site_pages")
    .select("*")
    .order("sort_order"),
  supabase
    .from("site_settings")
    .select("value")
    .eq("key", "footer_content")
    .single(),
]);
```

Change the prop name and type:

```tsx
const footerJson = footerRow
  ? (footerRow.value as unknown as Record<string, unknown>)
  : null;
```

Pass as `footerJson` instead of `footerConfig`:

```tsx
<SitePageBuilder
  pages={allPages as unknown as SitePage[]}
  initialPageId={id}
  footerJson={footerJson}
/>
```

Remove the `FooterConfig` import (no longer needed here). Import nothing extra for types.

**Step 2: Update SitePageBuilder to accept footerJson and inject/extract**

In `src/features/website/builder/site-page-builder.tsx`:

Remove the `FooterConfig` import. Add:

```tsx
import { buildDefaultFooterJson } from "@/features/events/builder/default-footer";
import { CraftFooter } from "@/features/events/builder/components/craft-footer";
```

Change Props interface:

```tsx
interface Props {
  pages: SitePage[];
  initialPageId: string;
  footerJson?: Record<string, unknown> | null;
}
```

Update `SitePageBuilder` to pass `footerJson`:

```tsx
export function SitePageBuilder({ pages: initialPages, initialPageId, footerJson }: Props) {
  return (
    <EventProvider value={dummyEvent}>
      <Editor resolver={resolver}>
        <SiteEditorLayout initialPages={initialPages} initialPageId={initialPageId} footerJson={footerJson} />
      </Editor>
    </EventProvider>
  );
}
```

Update `SiteEditorLayout` signature:

```tsx
function SiteEditorLayout({ initialPages, initialPageId, footerJson }: {
  initialPages: SitePage[];
  initialPageId: string;
  footerJson?: Record<string, unknown> | null;
}) {
```

**Step 3: Add helper functions for footer injection/extraction**

Add these functions before `SiteEditorLayout`:

```tsx
/** Find the footer node ID in a parsed canvas JSON object */
function findFooterNodeId(canvasObj: Record<string, unknown>): string | null {
  for (const [id, node] of Object.entries(canvasObj)) {
    const n = node as Record<string, unknown>;
    const type = n.type as Record<string, string> | undefined;
    if (type?.resolvedName === "CraftFooter") return id;
  }
  return null;
}

/** Inject footer JSON into canvas JSON. Adds footer-root as last child of ROOT. */
function injectFooter(canvasJson: string, footerNodes: Record<string, unknown>): string {
  const canvas = JSON.parse(canvasJson);
  // Remove any existing footer first
  const existingFooterId = findFooterNodeId(canvas);
  if (existingFooterId) {
    removeFooterSubtree(canvas, existingFooterId);
  }
  // Add all footer nodes to the canvas
  for (const [id, node] of Object.entries(footerNodes)) {
    canvas[id] = node;
  }
  // Add footer-root as last child of ROOT
  const root = canvas.ROOT as Record<string, unknown>;
  const rootNodes = (root.nodes as string[]) || [];
  rootNodes.push("footer-root");
  root.nodes = rootNodes;
  return JSON.stringify(canvas);
}

/** Extract footer subtree from canvas JSON. Returns {pageJson, footerJson}. */
function extractFooter(canvasJson: string): { pageJson: string; footerJson: Record<string, unknown> | null } {
  const canvas = JSON.parse(canvasJson);
  const footerId = findFooterNodeId(canvas);
  if (!footerId) return { pageJson: canvasJson, footerJson: null };

  // Collect all footer node IDs (footer-root and all descendants)
  const footerNodes: Record<string, unknown> = {};
  collectSubtree(canvas, footerId, footerNodes);

  // Remove footer nodes from canvas
  removeFooterSubtree(canvas, footerId);

  return { pageJson: JSON.stringify(canvas), footerJson: footerNodes };
}

function collectSubtree(canvas: Record<string, unknown>, nodeId: string, result: Record<string, unknown>) {
  const node = canvas[nodeId] as Record<string, unknown> | undefined;
  if (!node) return;
  result[nodeId] = node;
  const children = (node.nodes as string[]) || [];
  for (const childId of children) {
    collectSubtree(canvas, childId, result);
  }
}

function removeFooterSubtree(canvas: Record<string, unknown>, footerId: string) {
  // Remove from ROOT's children
  const root = canvas.ROOT as Record<string, unknown>;
  const rootNodes = (root.nodes as string[]) || [];
  root.nodes = rootNodes.filter((id) => id !== footerId);

  // Collect and delete all footer nodes
  const toDelete: string[] = [];
  const collectIds = (id: string) => {
    toDelete.push(id);
    const node = canvas[id] as Record<string, unknown> | undefined;
    if (!node) return;
    const children = (node.nodes as string[]) || [];
    for (const childId of children) collectIds(childId);
  };
  collectIds(footerId);
  for (const id of toDelete) delete canvas[id];
}
```

**Step 4: Inject footer into initial content**

In `SiteEditorLayout`, update the `initialContent` computation to inject the footer:

```tsx
const rawContent = activePage?.page_content
  ? JSON.stringify(activePage.page_content)
  : EMPTY_CANVAS;

const footerToInject = footerJson ?? buildDefaultFooterJson();
const initialContent = injectFooter(rawContent, footerToInject as Record<string, unknown>);
```

**Step 5: Inject footer when switching pages**

In the `switchPage` callback, after deserializing the new page content, inject the footer. Update the `switchPage` function:

Where it currently does `actions.deserialize(stored)` or `actions.deserialize(JSON.stringify(page.page_content))` or `actions.deserialize(EMPTY_CANVAS)`, instead extract the current footer first, then inject it into the new page:

```tsx
const switchPage = useCallback((newPageId: string | null) => {
  if (!newPageId || newPageId === activePageIdRef.current) return;

  // Extract footer from current canvas before storing
  const currentJson = query.serialize();
  const { pageJson, footerJson: currentFooter } = extractFooter(currentJson);
  pageContentsRef.current[activePageIdRef.current] = pageJson;

  // Determine the footer to inject (use current footer or the initial one)
  const footer = currentFooter ?? footerJsonRef.current ?? buildDefaultFooterJson();

  // Load new page content
  const stored = pageContentsRef.current[newPageId];
  let newPageJson: string;
  if (stored) {
    newPageJson = stored;
  } else {
    const page = pages.find((p) => p.id === newPageId);
    newPageJson = page?.page_content ? JSON.stringify(page.page_content) : EMPTY_CANVAS;
  }

  // Inject footer and deserialize
  const withFooter = injectFooter(newPageJson, footer as Record<string, unknown>);
  actions.deserialize(withFooter);

  setActivePageId(newPageId);
}, [query, actions, pages]);
```

Add a ref for the initial footer JSON:

```tsx
const footerJsonRef = useRef(footerJson ?? buildDefaultFooterJson());
```

**Step 6: Extract footer on save, save to site_settings**

Update `handleSave` to extract the footer and save it separately:

```tsx
const handleSave = useCallback(async () => {
  setSaving(true);
  setSaved(false);

  // Serialize current canvas and extract footer
  const currentJson = query.serialize();
  const { pageJson, footerJson: extractedFooter } = extractFooter(currentJson);
  pageContentsRef.current[activePageId] = pageJson;

  const supabase = createClient();
  const promises: PromiseLike<unknown>[] = [];

  // Save all pages that have been edited (stored in ref) — WITHOUT footer
  for (const page of pages) {
    const content = pageContentsRef.current[page.id];
    if (content) {
      promises.push(
        supabase
          .from("site_pages")
          .update({ page_content: JSON.parse(content) })
          .eq("id", page.id)
          .then()
      );
    }
  }

  // Save footer to site_settings
  if (extractedFooter) {
    promises.push(
      supabase
        .from("site_settings")
        .upsert(
          { key: "footer_content", value: extractedFooter },
          { onConflict: "key" }
        )
        .then()
    );
  }

  await Promise.all(promises);
  setSaving(false);
  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
}, [query, activePageId, pages]);
```

**Step 7: Remove the old `footerConfig` prop from `Viewport`**

In the `<Viewport>` usage, remove the `footerConfig` prop:

```tsx
<Viewport
  initialContent={initialContent}
  canvasWidth={viewports[activeViewport].width}
  hideHeader
/>
```

**Step 8: Verify**

Run: `npx tsc --noEmit`

**Step 9: Commit**

```
feat: wire footer injection/extraction in site page builder
```

---

### Task 6: Clean up viewport.tsx — remove PersistentFooter

**Files:**
- Modify: `src/features/events/builder/viewport.tsx`

**Step 1: Remove PersistentFooter and related code**

Remove:
- The `PersistentFooter` function (the entire component, ~100 lines with edit form)
- The `footerConfig` state: `const [footerConfig, setFooterConfig] = useState(initialFooterConfig);`
- The `FooterConfig` import
- The `footerConfig?: FooterConfig | null` from the `Props` interface
- The `footerConfig && <PersistentFooter ...>` render line
- Change the Viewport destructuring back: `{ initialContent, canvasWidth, hideHeader }`

Keep the `PersistentHeader` — it's only used in the event builder (when `hideHeader` is false).

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
refactor: remove PersistentFooter from viewport (replaced by CraftFooter)
```

---

### Task 7: Update PublicFooter to render from Craft.js JSON

**Files:**
- Modify: `src/shared/components/public-footer.tsx`

**Step 1: Rewrite PublicFooter to render footer_content via CraftPageRenderer**

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { CraftPageRenderer } from "@/features/events/builder/render";

export async function PublicFooter() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "footer_content")
    .single();

  if (!settings) return null;

  const footerNodes = settings.value as unknown as Record<string, unknown>;

  // The footer JSON has "footer-root" as its root node.
  // We need to render it using CraftPageRenderer which expects a ROOT-keyed object.
  // Instead, render the footer-root's children directly.

  // Build a minimal event object for the renderer
  const dummyEvent = {
    id: "",
    title: "",
    slug: "",
    status: "published",
    start_date: null,
    end_date: null,
    location: null,
    city: null,
    country: null,
    registration_config: null,
  };

  // Rename footer-root to ROOT for CraftPageRenderer compatibility
  const renderable: Record<string, unknown> = {};
  for (const [id, node] of Object.entries(footerNodes)) {
    if (id === "footer-root") {
      // Make footer-root act as ROOT for the renderer — but wrap in footer tag
      const footerNode = node as Record<string, unknown>;
      renderable[id] = footerNode;
    } else {
      renderable[id] = node;
    }
  }

  // Use the render.tsx RenderNode logic by creating a custom wrapper
  // Since CraftPageRenderer expects ROOT, we'll render via the footer-root directly
  return (
    <CraftPageRenderer
      content={{ ROOT: { ...(footerNodes["footer-root"] as object), nodes: (footerNodes["footer-root"] as Record<string, unknown>).nodes }, ...footerNodes } as any}
      event={dummyEvent as any}
    />
  );
}
```

Wait — this is awkward because `CraftPageRenderer` iterates `rootNode.nodes` and wraps in a flex div. Better approach: render the footer node directly. Let me simplify.

Actually, the cleanest approach is: make `CraftPageRenderer` work with the footer by passing the footer-root's children. But the footer node itself needs to render as `<footer>`. Since we added a `CraftFooter` case in `render.tsx` (Task 3), we just need to make footer-root a child of a synthetic ROOT.

**Revised Step 1:**

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { CraftPageRenderer } from "@/features/events/builder/render";

export async function PublicFooter() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "footer_content")
    .single();

  if (!settings) return null;

  const footerNodes = settings.value as unknown as Record<string, unknown>;
  if (!footerNodes["footer-root"]) return null;

  // Build a synthetic ROOT that contains footer-root as its only child
  const content = {
    ROOT: {
      type: { resolvedName: "CraftContainer" },
      isCanvas: true,
      props: { backgroundColor: "transparent", padding: 0, width: 1200, minHeight: 0, borderRadius: 0, borderColor: "transparent", borderWidth: 0, backgroundImage: "", alignItems: "center", gap: 0 },
      nodes: ["footer-root"],
      linkedNodes: {},
    },
    ...footerNodes,
  };

  const dummyEvent = {
    id: "", title: "", slug: "", status: "published",
    start_date: null, end_date: null, location: null,
    city: null, country: null, registration_config: null,
  };

  return (
    <CraftPageRenderer
      content={content as any}
      event={dummyEvent as any}
    />
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: update PublicFooter to render Craft.js JSON from site_settings
```

---

### Task 8: Add AI system prompt instruction about CraftFooter

**Files:**
- Modify: `src/shared/utils/ai/system-prompt.ts`

**Step 1: Add CraftFooter constraint to the Important Constraints section**

After the existing constraints (around line 29), add:

```
- A CraftFooter node already exists in the canvas as the last child of ROOT. To modify the footer, use edit_node on the CraftFooter and its children (footer-brand-title, footer-brand-desc, footer-links-list, footer-connect-email, etc.). Do NOT create new footer sections with CraftContainer — use the existing CraftFooter.
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: add CraftFooter instruction to AI system prompt
```

---

### Task 9: Seed footer_content and clean up old footer_config

**Step 1: Seed the default footer into site_settings**

Run locally:

```bash
npx supabase db query "DELETE FROM site_settings WHERE key = 'footer_config';"
```

The default footer will be auto-created by the builder (via `buildDefaultFooterJson()`) on first load and saved when the user clicks Save. No explicit seeding needed — but we delete the old `footer_config` key.

**Step 2: Clean up FooterSettings admin component**

Delete `src/features/website/admin/footer-settings.tsx` — the footer is now edited in the builder.

Update `src/app/admin/website/page.tsx` — remove the `FooterSettings` import and usage, remove the `footer_config` fetch from `Promise.all`, remove the `footerConfig` variable, and remove `<FooterSettings>` from the JSX.

The page should go back to just rendering `WebsitePageList`:

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { WebsitePageList } from "@/features/website/admin/website-page-list";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

export default async function WebsitePagesAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_pages")
    .select("*")
    .order("sort_order");

  if (error) console.error("site_pages fetch error:", error);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and edit your public website pages
          </p>
        </div>
      </div>
      <WebsitePageList initialPages={(data ?? []) as unknown as SitePage[]} />
    </div>
  );
}
```

**Step 3: Clean up types**

In `src/shared/types/database.ts`, the `FooterConfig` interface can be removed if nothing else references it. Check first:

```bash
grep -r "FooterConfig" src/ --include="*.ts" --include="*.tsx"
```

If only the files we're modifying reference it, remove it.

**Step 4: Verify**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```
refactor: remove old FooterSettings admin UI and footer_config references
```

---

### Task 10: Verify end-to-end

**Step 1:** Start dev server (`npm run dev`)

**Step 2:** Navigate to `/admin/website`, open any page in the builder

**Step 3:** Verify the default footer appears at the bottom of the canvas as a selectable section

**Step 4:** Click the footer — verify settings panel appears in the right sidebar

**Step 5:** Edit a child element (e.g., change the brand description text) — verify it updates in real-time

**Step 6:** Click Save — verify the footer is saved

**Step 7:** Switch to another page tab — verify the same footer appears

**Step 8:** Open AI Assistant, type "Enhance the footer with a gradient background" — verify it edits the existing footer (no duplicate)

**Step 9:** Visit the public website — verify the footer renders correctly

**Step 10:** Run `npx tsc --noEmit` — clean compilation
