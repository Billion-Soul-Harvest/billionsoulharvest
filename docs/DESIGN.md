---
name: Billion Soul Harvest Design System
colors:
  # Core palette
  primary-navy: '#0d223f'
  primary-navy-deep: '#000b20'
  accent-cyan: '#00b8d4'
  accent-cyan-hover: '#006879'
  accent-cyan-light: '#65e2fe'
  accent-cyan-pale: '#a9edff'

  # Surfaces
  surface: '#f9f9ff'
  surface-white: '#ffffff'
  surface-light: '#f0f3ff'

  # Text
  text-heading: '#0d223f'
  text-heading-alt: '#000b20'
  text-body: '#44474d'
  text-body-dark: '#0a1c34'
  text-muted: '#76777d'

  # On dark backgrounds
  text-on-dark: '#ffffff'
  text-on-dark-muted: 'rgba(255,255,255,0.7)'
  text-on-dark-subtle: 'rgba(255,255,255,0.5)'

  # Borders
  border-default: '#b4c7ec'
  border-light: 'rgba(180,199,236,0.2)'
  border-card: 'rgba(180,199,236,0.3)'

typography:
  heading:
    fontFamily: Plus Jakarta Sans
    cssVar: var(--font-jakarta)
    fontWeight: '700'
    letterSpacing: -0.02em
  body:
    fontFamily: Plus Jakarta Sans
    cssVar: var(--font-jakarta)
    fontWeight: '400'
    lineHeight: 1.7
  label:
    fontFamily: Inter (Geist Sans)
    cssVar: var(--font-geist-sans)
    fontWeight: '600'
    letterSpacing: 0.01em
    textTransform: uppercase
  display:
    fontSize: 48px (desktop) / 36px (mobile)
    lineHeight: 56px / 44px
  headline:
    fontSize: 32px (desktop) / 28px (mobile)
    lineHeight: 40px / 36px
  body-md:
    fontSize: 16px
    lineHeight: 24px
  label-sm:
    fontSize: 12px
    lineHeight: 16px
    letterSpacing: 0.05em

rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px

spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  section-padding: 80px-120px (py-20 md:py-[120px])
  margin-desktop: 32px (px-8)
  margin-mobile: 16px (px-4)
---

## Brand & Style

The Billion Soul Harvest design system combines institutional trust with modern clarity. It uses a deep navy palette anchored by vibrant cyan accents to convey purposeful action and global reach. The aesthetic balances editorial authority (strong headings, generous whitespace) with clean, accessible UI patterns.

## Colors

### Core Palette

- **Primary Navy (`#0d223f`):** Foundation color for dark sections, hero overlays, headings, and the footer. A warmer navy than pure dark blue.
- **Accent Cyan (`#00b8d4`):** Primary interactive color for buttons, links, labels, hover states, and accent elements. Used sparingly for maximum impact.
- **Accent Cyan Hover (`#006879`):** Darker cyan for hover/active states on buttons and links.
- **Accent Cyan Light (`#65e2fe`):** Used for badges/chips on dark backgrounds (e.g., hero section tags).
- **Accent Cyan Pale (`#a9edff`):** Used for subtle text accents on dark backgrounds (dates, labels).

### Surfaces

- **Surface (`#f9f9ff`):** Primary page background — a very light blue-white that prevents stark white fatigue.
- **White (`#ffffff`):** Card backgrounds, content sections that alternate with the surface color.
- **Light Blue (`#f0f3ff`):** Secondary surface for hover states and subtle differentiation.

### Text

- **Heading text (`#0d223f` / `#000b20`):** Dark navy for all headings on light backgrounds.
- **Body text (`#44474d`):** Medium gray for paragraph text, providing comfortable reading contrast.
- **On dark (`white`, `white/80`, `white/70`):** White with varying opacity for text on navy backgrounds.

### Borders

- **Default (`#b4c7ec`):** Soft blue-gray for card borders, dividers. Used at 20-30% opacity (`border-[#b4c7ec]/20`).

## Typography

The system uses **Plus Jakarta Sans** as the primary typeface for both headings and body copy. This geometric sans-serif provides a clean, modern, and trustworthy feel appropriate for a global ministry platform.

**Inter (Geist Sans)** serves as the utility font for navigation labels, section eyebrow labels, UI metadata, and small caps text. Its geometric precision provides functional clarity.

### Usage Patterns

- **Hero headings:** Jakarta, bold, 48px desktop / 36px mobile, `tracking-[-0.02em]`
- **Section headings:** Jakarta, semibold/bold, 28-40px, navy color
- **Section eyebrow labels:** Geist Sans, semibold, 12px, uppercase, `tracking-widest`, cyan color (`#00b8d4`)
- **Body text:** Jakarta, regular, 16-17px, `leading-7`, gray (`#44474d`)
- **Navigation links:** Geist Sans, medium, 14px, `tracking-[0.01em]`

## Layout & Spacing

- **Max width:** 1280px container
- **Desktop padding:** `px-8` (32px)
- **Mobile padding:** `px-4` (16px)
- **Section vertical spacing:** `py-20 md:py-[100px]` to `py-20 md:py-[120px]`
- **Grid:** Responsive 1-2-3 column grid with `gap-6` (24px)

## Hero Sections

Hero sections use a full-width background image with a navy gradient overlay:

```css
/* Top-to-bottom gradient (homepage, event pages) */
linear-gradient(to bottom, rgba(13,34,63,0.7), rgba(13,34,63,0.92))

/* Content is left-aligned within max-w-2xl on homepage */
/* Content is centered on event pages (page builder) */
```

- **Background color:** `#0d223f` with varying opacity
- **Min height:** 700px-800px (homepage), 560px (event pages)
- **Text shadow:** `0 2px 4px rgba(0,0,0,0.3)` for readability

## Header (Navigation)

- **Background:** `#f9f9ff` with 90-95% opacity + `backdrop-blur-md`
- **Position:** `sticky top-0`
- **Border:** `border-b border-[#b4c7ec]/20`
- **Shadow on scroll:** `shadow-lg` when scrolled past threshold
- **Active link:** `text-[#006879] font-bold border-b-2 border-[#006879]`
- **Link hover:** `text-[#00b8d4]`

## Footer

- **Background:** `#0d223f` (primary navy)
- **Section labels:** Geist Sans, uppercase, `tracking-widest`, white
- **Body links:** Geist Sans, `text-white/60`, hover `text-[#00b8d4]`
- **Copyright:** `text-white/40`
- **Social icons:** `text-white/50`, hover `text-[#00b8d4]`

## Cards & Elevation

Hierarchy uses low-contrast borders and tonal layering over aggressive shadows:

- **Cards:** White background, `rounded-2xl`, `border border-[#b4c7ec]/30`
- **Card hover:** `hover:shadow-lg hover:border-[#00b8d4]/30`
- **Elevation:** Minimal — prefer border differentiation over shadows
- **Active/focus:** Subtle cyan glow using `#00b8d4` at 10-15% opacity

## Buttons

- **Primary:** `bg-[#00b8d4] text-white rounded-lg` — used for main CTAs
- **Primary hover:** `bg-[#006879]`
- **Secondary/Ghost:** `bg-white/10 backdrop-blur border border-white/30 text-white rounded-lg` — on dark backgrounds
- **Padding:** `px-10 py-4` (large), `px-4 py-2` (small)
- **Font:** Geist Sans, semibold, 14px

## Event Page Builder Defaults

The page builder uses the same design tokens. Default template sections:

- **Hero:** Navy overlay gradient on background image, centered title, cyan dates (`#a9edff`), white/80 body text
- **Light sections:** White (`#ffffff`) bg, navy headings (`#0d223f`), gray body text (`#44474d`), cyan labels (`#00b8d4`)
- **Dark sections:** Navy (`#0d223f`) bg, white headings, white/70 body text, cyan labels (`#00b8d4`)
- **CTA sections:** Navy bg, white text, cyan register button
- **Footer:** Navy bg, white/50 copyright text

## Iconography

- **Style:** Outline stroke, 1.5-2px weight
- **Size:** 20-24px standard, 32px for feature icons
- **Color:** Matches text context — cyan on light backgrounds, white on dark
- **Feature icons:** Cyan icon on `#00b8d4/10` background, rounded-lg container
