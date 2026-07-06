# CraftFooter — Footer as a Normal Craft.js Section

## Problem

The persistent footer lives outside the Craft.js `<Frame>`, so the AI assistant can't see or edit it. When asked to "enhance the footer," the AI creates a duplicate footer inside the canvas instead of editing the existing one.

## Solution

Make the footer a real Craft.js canvas component (`CraftFooter`) inside the `<Frame>`. It's selectable, editable via the right panel, and AI-enhanceable — while remaining persistent across all pages and not deletable.

## Architecture

- `CraftFooter` is a Craft.js canvas component (like `CraftContainer`) that renders as a `<footer>`
- It lives inside the `<Frame>` as a normal node, fully visible and selectable
- It can contain any child nodes (CraftText, CraftRow, CraftImage, CraftSocialLinks, etc.)
- Craft.js `rules` prevent deletion and moving
- Registered in `craft-schema.ts` so the AI knows about it and can edit/enhance it

### Cross-page persistence

Footer content is stored separately from page content:
- `site_settings` key `footer_content` stores the Craft.js JSON subtree for the footer
- On builder load: footer subtree is injected into the canvas as the last ROOT child
- On builder save: footer subtree is extracted from the canvas, saved to `site_settings`, and removed from `page_content`
- `page_content` in `site_pages` never contains the footer

### Default footer template

3-column layout matching the approved design:

```
CraftFooter (canvas, bg: #0a1e38, padding: 48)
  └─ CraftRow (gap: 48, alignItems: flex-start)
       ├─ CraftColumn (40%)
       │    ├─ CraftText ("Billion Soul Harvest" — bold, white, 22px)
       │    ├─ CraftText (description — gray-400, 14px)
       │    └─ CraftSocialLinks (facebook, instagram, x, youtube — gray icons)
       ├─ CraftColumn (25%)
       │    ├─ CraftText ("Quick Links" — bold, white, 14px)
       │    └─ CraftText (link list — gray-400, 14px, one per line)
       └─ CraftColumn (35%)
            ├─ CraftText ("Connect" — bold, white, 14px)
            ├─ CraftText (contact description — gray-400, 14px)
            └─ CraftText (email link — cyan, 14px)
  └─ CraftDivider (white/10, thin)
  └─ CraftRow (justifyContent: space-between)
       ├─ CraftText (© 2025 Billion Soul Harvest... — gray-500, 12px)
       └─ CraftText (Privacy Policy  Terms of Use  Contact — gray-500, 12px)
```

### Public site rendering

- Add `CraftFooter` case in `render.tsx` — renders as `<footer>` with children
- Update `PublicFooter` to fetch `footer_content` (Craft.js JSON) from `site_settings` and render via `CraftPageRenderer`
- If no `footer_content` exists, render nothing

### System prompt

- Add `CraftFooter` to the AI system prompt schema
- Add instruction: "A CraftFooter node already exists in the canvas. To modify the footer, use edit_node on the existing CraftFooter and its children. Do NOT create new footer sections."
