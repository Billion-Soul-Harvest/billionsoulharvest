---
name: Global Harvest Ethos
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#171c20'
  on-tertiary-container: '#80848a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#dfe3e9'
  tertiary-fixed-dim: '#c3c7cd'
  on-tertiary-fixed: '#171c20'
  on-tertiary-fixed-variant: '#43474c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

This design system embodies a synthesis of traditional authority and modern technological precision. It is designed for institutional trust, global reach, and ethical clarity. The aesthetic combines **Corporate Modern** structure with **Minimalist** clarity, utilizing high-contrast color blocking and precise typography to convey a sense of purposeful action and archival quality.

The emotional response should be one of "Informed Confidence"—users should feel that the platform is both historically grounded and future-facing. This is achieved through the use of classical serif typography paired with a sharp, vibrant technical accent palette.

## Colors

The palette is anchored by deep, authoritative tones contrasted against high-energy technical accents.

- **Primary (Deep Navy):** `#0f172a` serves as the foundation for typography, iconography, and high-importance structural elements.
- **Secondary (Vibrant Cyan):** `#06b6d4` is used sparingly for interactive cues, success states, and progress indicators, providing a "digital spark" against the traditional base.
- **Surface & Background:** The system utilizes `#ffffff` (White) for primary content cards and `#f1f5f9` (Light Slate/Gray) for page backgrounds to provide subtle depth without heavy shadowing.
- **Accessibility:** Text must maintain a minimum 4.5:1 contrast ratio. On primary backgrounds, all auxiliary text should use the Cyan or White to ensure legibility.

## Typography

The design system uses **Source Serif 4** as its primary typeface for both headlines and body copy. This creates a literary, academic feel that reinforces the "Harvest" narrative of growth and knowledge. 

To prevent the design from feeling too antiquated, **Hanken Grotesk** is introduced as a utility font for labels, data points, and small UI metadata. This sans-serif pairing provides a functional, modern counterpoint to the serif's warmth. Headlines should utilize tighter letter spacing at larger scales to maintain a cohesive, "editorial" look.

## Layout & Spacing

The system follows a **Fixed Grid** philosophy for desktop layouts to ensure readability remains controlled and comfortable, mimicking the layout of a well-typeset journal.

- **Grid:** A 12-column grid is used for desktop (1280px max-width).
- **Rhythm:** An 8px linear scale governs all padding and margin decisions. 
- **Adaptation:** 
  - **Desktop:** Generous margins (64px) and wide gutters (24px) to promote focus.
  - **Tablet:** 8-column grid with 32px margins.
  - **Mobile:** 4-column fluid grid with 20px margins; typography scales down to prevent excessive line-breaking in headlines.

## Elevation & Depth

Hierarchy is established through **Low-contrast outlines** and **Tonal layering** rather than aggressive shadows. 

- **Surfaces:** Use a slight color shift (White on Light Gray) to distinguish between the background and interactive containers.
- **Borders:** Subtle 1px borders using `#e2e8f0` (Slate 200) are preferred over shadows to define card boundaries.
- **Active State:** Elements may gain a soft, tinted glow using the Secondary Cyan (`#06b6d4`) with low opacity (10-15%) to indicate focus or selection.

## Shapes

The design system utilizes a **Rounded** (0.5rem / 8px) shape language. This specific radius strikes a balance between the rigid professionalism of a sharp corner and the overly casual nature of a pill shape.

- **Standard Elements:** 8px radius (Buttons, Input Fields, Checkboxes).
- **Large Containers:** 16px radius (Cards, Modals).
- **Icons:** Should follow a consistent 2px stroke weight with slight terminal rounding to match the UI elements.

## Components

- **Buttons:** Primary buttons use the Deep Navy (`#0f172a`) background with White text. Secondary buttons use a Cyan outline with Cyan text.
- **Inputs:** Fields are defined by a 1px border. On focus, the border transitions to Cyan with a subtle 2px outer glow.
- **Chips:** Used for categorization, these feature a light gray background with Hanken Grotesk labels in Navy.
- **Cards:** Cards should be flat with 1px light borders. Use "Internal Padding" of 24px (3 units) to maintain the spacious editorial feel.
- **Checkboxes & Radios:** Use the Deep Navy for the "Off" state border and the Vibrant Cyan for the "On" state fill.
- **Status Indicators:** Use the Vibrant Cyan for "active" or "positive" states, and a muted Slate for "inactive" or "historical" data points.