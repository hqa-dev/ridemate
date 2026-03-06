# لیمۆ (Limo) Design System

Design tokens for the Limo carpooling app, built with Style Dictionary 4.

## 3-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│  Tier 3 — Component Tokens                      │
│  button.primary.bg, card.standard.radius, ...   │
│  (rarely change between themes)                 │
├─────────────────────────────────────────────────┤
│  Tier 2 — Semantic Tokens          ← THEME LAYER│
│  brand.primary, surface.card, text.heading, ... │
│  (this is where Bobby ↔ Newroz ↔ Christmas)     │
├─────────────────────────────────────────────────┤
│  Tier 1 — Primitive Tokens                      │
│  #E8470A, #2A7A1A, 12px, 0.5, ...              │
│  (raw values — never change)                    │
└─────────────────────────────────────────────────┘
```

## Token Categories

| File | What |
|------|------|
| `tokens/color.json` | 30+ colors: bg, text, brand, status, border, nav, icon, overlay, avatar palette, ride-specific |
| `tokens/typography.json` | Font family, 12 sizes (8–26px), 5 weights, line heights, letter spacing, text shadows |
| `tokens/spacing.json` | Full spacing scale, page/card/modal padding, nav clearance |
| `tokens/border.json` | 3 widths, 2 styles, 12 radii (5–50px) |
| `tokens/shadow.json` | 7 shadows: sm, card, pill, float, nav, viewport, profileAvatar |
| `tokens/motion.json` | Durations (150–450ms), easings (standard, bounce), nav transitions, press scale |
| `tokens/opacity.json` | 12 values from 0.06 (tint) to 0.7 (backdrop) |
| `tokens/z-index.json` | 4 layers: dropdown (10), nav (100), overlay (200), modal (300) |
| `tokens/size.json` | App, nav, button, avatar, illustration, badge, icon, modal sizes |
| `tokens/component.json` | Button (8 variants), card (4 variants), input (4 variants), toast, nav |
| `themes/default.json` | Bobby theme — semantic-to-primitive mapping |
| `themes/newroz.stub.json` | Newroz theme stub — only changed tokens |
| `themes/christmas.stub.json` | Christmas theme stub — only changed tokens |
| `i18n/ku.json` | All Kurdish strings organized by feature |

## How Themes Work

Themes live at Tier 2. They remap semantic tokens to different primitives. Components reference semantic tokens, so they never change when you switch themes.

**Bobby (default):** `brand.primary` → `#E8470A` (orange)
**Newroz:** `brand.primary` → `#2E8B57` (green)
**Christmas:** `brand.primary` → `#B22222` (red)

## How to Add a Theme in 3 Steps

1. Copy `themes/newroz.stub.json` as a starting point
2. Change only the tokens that differ from `themes/default.json`
3. Run `npm run build` — new CSS variables and TS objects are generated

## Build

```bash
cd design-system
npm install
npm run build
```

Outputs:
- `dist/web/variables.css` — CSS custom properties for Next.js
- `dist/mobile/tokens.ts` — Typed JS objects for React Native

## Migration Order

When wiring tokens into the app, migrate files in this order:

1. **`src/lib/theme.ts`** — Replace flat `T` object with CSS variable references
2. **`src/app/globals.css`** — Import generated `variables.css`, replace hardcoded values
3. **`src/app/layout.tsx`** — Wire viewport shadow and border tokens
4. **`src/components/ui/Button.tsx`** — Use button variant tokens
5. **`src/components/ui/Card.tsx`** — Use card variant tokens
6. **`src/components/layout/BottomNav.tsx`** — Use nav tokens, move inline `<style>` to CSS
7. **`src/lib/constants.ts`** — Reference status color tokens
8. **Page files** — Replace remaining hardcoded values one page at a time
9. **`src/lib/translations.ts`** → **`i18n/ku.json`** — Swap to `next-intl`
