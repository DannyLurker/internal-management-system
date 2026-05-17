---
name: Ochre Harbor
colors:
  surface: "#f8f9ff"
  surface-dim: "#d1dbec"
  surface-bright: "#f8f9ff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#eef4ff"
  surface-container: "#e5eeff"
  surface-container-high: "#dfe9fa"
  surface-container-highest: "#d9e3f4"
  on-surface: "#121c28"
  on-surface-variant: "#524439"
  inverse-surface: "#27313e"
  inverse-on-surface: "#eaf1ff"
  outline: "#857467"
  outline-variant: "#d8c3b4"
  surface-tint: "#8c4f10"
  primary: "#894d0d"
  on-primary: "#ffffff"
  primary-container: "#a76526"
  on-primary-container: "#fffbff"
  inverse-primary: "#ffb77b"
  secondary: "#565e74"
  on-secondary: "#ffffff"
  secondary-container: "#dae2fd"
  on-secondary-container: "#5c647a"
  tertiary: "#5d5c58"
  on-tertiary: "#ffffff"
  tertiary-container: "#767471"
  on-tertiary-container: "#fcffe3"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdcc2"
  primary-fixed-dim: "#ffb77b"
  on-primary-fixed: "#2e1500"
  on-primary-fixed-variant: "#6d3a00"
  secondary-fixed: "#dae2fd"
  secondary-fixed-dim: "#bec6e0"
  on-secondary-fixed: "#131b2e"
  on-secondary-fixed-variant: "#3f465c"
  tertiary-fixed: "#e5e2dd"
  tertiary-fixed-dim: "#c9c6c2"
  on-tertiary-fixed: "#1c1c19"
  on-tertiary-fixed-variant: "#474743"
  background: "#f8f9ff"
  on-background: "#121c28"
  surface-variant: "#d9e3f4"
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: "500"
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: "500"
    lineHeight: 56px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: "500"
    lineHeight: 40px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: "500"
    lineHeight: 44px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built for the high-end hospitality sector, evoking the serenity of a coastal retreat combined with the structured professionalism of a luxury concierge. The aesthetic is **Modern Corporate with a Tactile twist**, leaning heavily on a "Warm Minimalism" philosophy.

The goal is to instill a sense of calm and reliability. We achieve this through generous whitespace (breathing room), a balanced editorial layout, and subtle depth cues that suggest physical quality without clutter. The interface should feel like a high-quality linen paper—textured, substantial, yet impeccably clean. Use rhythmic alignment and purposeful imagery to ground the user in a premium service environment.

## Colors

The palette is anchored by the interplay between earth and sea.

- **Primary (Rich Ochre):** Used for key actions, brand moments, and subtle accents. It provides warmth and a premium, sun-drenched feel.
- **Secondary (Deep Navy):** Provides high-contrast grounding. Use this for navigation backgrounds, footers, and primary headings to establish authority.
- **Surface (Warm Sandy Neutrals):** The canvas of the design system. Instead of pure white, use `#F5F2ED` for main backgrounds to reduce eye strain and enhance the "hospitality" feel.
- **Functional Neutrals:** A range of slate grays are used for secondary text and borders to maintain legibility without the harshness of true black.

## Typography

This design system utilizes a classic serif/sans-serif pairing to communicate both heritage and modern efficiency.

- **Headings:** **EB Garamond** brings a literary, sophisticated quality. Use it for all major headlines. For Display styles, use a slight negative letter-spacing to create a tighter, more "designed" editorial appearance.
- **Body & Interface:** **Hanken Grotesk** is used for its exceptional legibility and clean, contemporary geometry. It balances the traditional feel of the serif with a sense of modern precision.
- **Labels:** Use Hanken Grotesk in All Caps with increased letter-spacing for micro-copy, category tags, and navigation items to ensure they are distinct from body prose.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach for desktop to maintain an editorial feel, transitioning to a fluid model for smaller devices.

- **Desktop:** 12-column grid with a maximum width of 1280px. Use wide 64px margins to emphasize exclusivity and focus.
- **Mobile:** 4-column grid with 20px margins.
- **Rhythm:** We utilize an 8px linear scale. For luxury hospitality, "more is more" when it comes to vertical spacing. Use `stack-lg` (48px) or even `stack-xl` (80px) between major sections to allow the eye to rest and digest imagery. Avoid cramped clusters of information.

## Elevation & Depth

To maintain the "Sophisticated" brand pillar, we avoid heavy, muddy shadows. Instead, we use **Ambient, Tinted Shadows** and **Tonal Layering**.

- **Shadow Character:** Shadows should be extremely diffused (large blur radius) and low opacity (5-8%). Tint the shadow with a hint of the Secondary Navy (`#0F172A`) rather than pure black to keep the UI feeling "rich."
- **Surfaces:** Use subtle shifts in background color (e.g., from `#F5F2ED` to a slightly cooler neutral) to define containers.
- **Interactive Depth:** On hover, elements should lift slightly (3-5px) with an increased shadow spread, creating a tactile "click-worthy" response.

## Shapes

The shape language is **Soft and Architectural**. We avoid the playfulness of fully rounded "pill" shapes and the harshness of sharp corners.

- **Base Radius:** A subtle 4px (`0.25rem`) radius is the standard for buttons and inputs.
- **Container Radius:** Larger cards and modal windows use an 8px or 12px radius to feel substantial yet approachable.
- **Buttons:** Rectangular with soft corners suggest a more formal, high-end experience than rounded buttons.
- **Imagery:** Photos should always have the standard 4px radius; sharp-edged photos can appear too aggressive for this design system.

## Components

- **Buttons:** Primary buttons use the Ochre background with white text. Ghost buttons use the Navy for text/border. Maintain a generous internal padding (16px top/bottom, 32px left/right) for a premium feel.
- **Input Fields:** Use "Float-label" style with a 1px bottom border or a very light gray stroke. Backgrounds should be slightly lighter or darker than the page surface to provide a clear target.
- **Cards:** Cards should have no border, but a very subtle ambient shadow and a 4px corner radius. High-quality lifestyle photography should dominate the card's real estate.
- **Chips/Tags:** Use the Navy background with white text in the Label-md typography style for a high-contrast, "label-maker" look.
- **Lists:** Use generous 16px vertical padding between list items and 1px dividers in a very faint neutral hex.
- **Signature Component (The Booking Bar):** A persistent, slim bar (often fixed to the bottom on mobile or top on desktop) using a Navy background and Ochre accents, providing immediate access to the primary conversion path.
