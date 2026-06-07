# Design System — Source List Kajian Sunnah Indonesia

## Product Context

- **What this is:** Open registry sumber kajian Sunnah + automated health monitoring via Telegram. Layer-1 infrastructure untuk ekosistem kajian Indonesia.
- **Who it's for:** Developer aggregator, kontributor sumber baru, komunitas kajian yang butuh data reliable.
- **Space/industry:** Islamic education infrastructure / civic community data tools
- **Project type:** Dashboard / web app (data registry + health monitoring)

---

## Aesthetic Direction

- **Direction:** Editorial/Archival — digitized Indonesian reference library. Bukan cold developer infrastructure, bukan news-site density.
- **Decoration level:** Intentional — subtle grid pattern (existing, keep), grain-level texture on Masthead. No blobs, no gradients as decoration.
- **Mood:** Scholarly warmth. Seperti katalog perpustakaan masjid yang dikurasi dengan baik — trustworthy, curated, calm. Bukan tech startup, bukan news site.
- **Design rationale:** Setiap Indonesian Islamic web tool memilih antara news density atau sterile white SaaS. Setiap developer registry tool terasa cold dan technical. Produk ini duduk di intersection yang unik — infrastructure untuk cultural community. Aesthetic "archival" distinctive di keduanya sekaligus.

---

## Typography

- **Display/Hero:** [Fraunces](https://fonts.google.com/specimen/Fraunces) — variable optical-size serif, warm, karakter editorial. Unusual untuk developer registry tool, tepat untuk knowledge archive. Gunakan di: Masthead title, section headings besar, stat values.
  - Weight: 700 untuk hero, 600 untuk section heads
  - Letter-spacing: -0.025em di size besar, -0.015em di medium
  - Font-style italic untuk accent/emphasis (pairs dengan clay color)

- **Body/UI:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — lebih warm dan rounded dari Geist Sans, less "Vercel dev tool" feel. Gunakan di: body text, labels, nav, buttons, filter chips, semua UI text.
  - 400 untuk body/descriptions
  - 500 untuk labels dan secondary UI
  - 600 untuk button text, headings level 3-4

- **Data/IDs/Technical:** Geist Mono (keep, existing) — sempurna untuk source IDs, channel IDs, JSON fields, status codes. Gunakan di: source ID display, monospace code snippets, numeric stats dalam tabular context, section numbering (01, 02, etc.).
  - `font-variant-numeric: tabular-nums` selalu untuk angka di table

- **Prose/Docs:** [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) — upgrade dari `ui-serif` fallback. Intentional serif untuk docs drawer, long-form prose, CONTRIBUTING.md rendering.
  - 400 untuk body prose
  - 600 untuk inline emphasis dalam prose
  - Italic untuk kutipan atau penekanan editorial

### Font Loading (layout.tsx)

```tsx
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
// Source Serif 4 loaded via CSS @import atau next/font untuk prose-only contexts
// Geist Mono dipertahankan dari existing setup
```

### Scale

| Level    | Size           | Font         | Weight | Use                        |
|----------|----------------|--------------|--------|----------------------------|
| Display  | clamp(40,5vw,64px) | Fraunces | 700    | Masthead hero title        |
| H1       | 36px           | Fraunces     | 700    | Section title              |
| H2       | 26px           | Fraunces     | 600    | Sub-section heading        |
| H3       | 18px           | Plus Jakarta | 600    | Card heading               |
| H4       | 13px mono      | Geist Mono   | 500    | Section label (uppercase)  |
| Body     | 15-16px        | Plus Jakarta | 400    | General text               |
| Prose    | 16px           | Source Serif | 400    | Docs / markdown content    |
| Data     | 12-13px        | Geist Mono   | 400    | IDs, codes, numbers        |
| Label/UI | 10px mono      | Geist Mono   | 400    | Section labels, meta       |

---

## Color

- **Approach:** Restrained — clay adalah satu-satunya accent yang kuat. Warna lain support dan memberi makna semantik.

### Core Palette

| Token     | Hex       | Role                                     |
|-----------|-----------|------------------------------------------|
| `--ivory` | `#FAF9F5` | Primary background — warm off-white, bukan sterile white |
| `--paper` | `#FFFFFF` | Card / elevated surface                  |
| `--slate` | `#141413` | Primary text — almost black, warm undertone |
| `--clay`  | `#D97757` | Primary accent — action, links, emphasis |
| `--clay-d`| `#B85C3E` | Clay hover/active state                  |
| `--oat`   | `#E3DACC` | Subtle border accent, dividers           |
| `--olive`  | `#788C5D` | Secondary accent — L2 in architecture diagram |

### Neutral Scale

| Token   | Hex       | Use                          |
|---------|-----------|------------------------------|
| `--g100`| `#F0EEE6` | Hover backgrounds, chip bg   |
| `--g200`| `#E6E3DA` | Hover state (darker)         |
| `--g300`| `#D1CFC5` | Borders, dividers            |
| `--g500`| `#87867F` | Muted text, section labels   |
| `--g700`| `#3D3D3A` | Secondary text               |

### Semantic Colors (new)

| Token     | Hex       | Role                                     |
|-----------|-----------|------------------------------------------|
| `--jade`  | `#4D7C5F` | Success / active status — olive-warm green, bukan harsh lime |
| `--amber` | `#C4831A` | Warning / stale status — warm amber, bukan harsh orange |
| `--rust`  | `#B84040` | Error / dead status — warm deep red      |

### Source Status Color Mapping

| Status     | Badge Color   | Dot Animation         |
|------------|---------------|-----------------------|
| `active`   | jade          | Slow pulse (2s)       |
| `stale`    | amber         | Static                |
| `dead`     | rust          | Static                |
| `checking` | clay          | Fast pulse (1.2s)     |
| `not_yet_monitored` | g300 | Static             |

### Dark Mode

Background: `#1A1916` (warm dark brown, bukan pure black). Surface: `#211F1B`. Pertahankan warm undertone — konsisten dengan archival identity. Bukan "dark mode sebagai afterthought", tapi "buku di cahaya meja malam".

Dark mode token overrides:
```css
[data-theme="dark"] {
  --ivory:  #1A1916;
  --paper:  #211F1B;
  --slate:  #F0EDE4;
  --oat:    #2E2B25;
  --g100:   #242219;
  --g200:   #2E2B25;
  --g300:   #3D3A32;
  --g500:   #8C8B83;
  --g700:   #C8C5BA;
}
```

---

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable — bukan compact (data app) tapi bukan spacious (marketing). Cukup whitespace untuk memberi kesan editorial, cukup density untuk registry table.
- **Scale:**

| Name | Value | Use                        |
|------|-------|----------------------------|
| 2xs  | 4px   | Icon gap, internal padding |
| xs   | 8px   | Tight spacing              |
| sm   | 12px  | Component internal         |
| md   | 16px  | Standard gap               |
| lg   | 24px  | Section internal gap       |
| xl   | 32px  | Section padding            |
| 2xl  | 48px  | Large section gap          |
| 3xl  | 64px  | Page section padding       |
| 4xl  | 80px  | Hero padding               |

---

## Layout

- **Approach:** Hybrid — grid-disciplined untuk data tabs (registry table, health dashboard), editorial untuk Masthead dan Docs drawer.
- **Max content width:** 1180px
- **Grid:** 12 columns, 8px base gutter
- **Horizontal padding:** 32px (mobile: 20px)
- **Sticky nav:** top-0, z-30, ivory/95 background, backdrop-blur

### Border Radius

| Name | Value | Use                        |
|------|-------|----------------------------|
| sm   | 4px   | Badge, small chip          |
| md   | 8px   | Button, input              |
| lg   | 12px  | Card                       |
| xl   | 14px  | Shell / large card         |
| full | 9999px| Status badge dot, pill     |

---

## Motion

- **Approach:** Intentional — motion hanya untuk state yang bermakna. Bukan animasi dekoratif.
- **Easing:** enter: `ease-out` / exit: `ease-in` / move: `ease-in-out`

### Duration Scale

| Name  | Duration | Use                                    |
|-------|----------|----------------------------------------|
| micro | 100ms    | Row hover background, button state     |
| short | 150ms    | Tab crossfade, chip toggle             |
| medium| 250ms    | Drawer slide, panel entrance           |
| long  | 400ms    | Modal, full-page transition            |

### Specific Patterns

- **Tab switch:** 150ms opacity crossfade. No slide, no translateX — mencegah layout shift di data tables.
- **Panel entrance:** fade + `translateY(10px → 0)`, 200ms ease-out, 50ms stagger per row kalau ada list.
- **Row hover:** 100ms background fill ke `--g100`. No transform — alignment tetap stabil.
- **Status badge · checking:** dot pulse 1.2s infinite. Clay color. Hanya badge ini yang animated.
- **Status badge · active:** dot slow-pulse 2s infinite. Jade color. Subtle.
- **Docs drawer:** 250ms ease-out slide from right. Overlay fades separately at 200ms.
- **Masthead entrance:** existing `opacity + translateY(10px)` dengan per-element delay — keep, extend pattern ke tab panels.

### Reduced Motion

Semua animasi **harus** dihormati:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Decorative Elements

- **Grid pattern (Masthead):** `linear-gradient` 1px lines di 60px grid. Slate color, `opacity: 0.025`. Keep. Jangan ubah opacity — terlalu visible terasa dated.
- **Radial gradient blob (Masthead):** `rgba(217,119,87,0.10)` clay blob di top-right. Radius 420px. Keep tapi jangan duplikasi di tempat lain — sekali saja, di hero.
- **Grain texture:** Opsional, bisa ditambahkan ke Masthead via SVG filter atau CSS noise. Max opacity 0.03 — harus invisible kecuali zoom in.
- **No:** decorative blobs di section lain, purple gradients, icon grids dengan colored circles, centered-everything layouts.

---

## Decisions Log

| Date       | Decision                             | Rationale                                                            |
|------------|--------------------------------------|----------------------------------------------------------------------|
| 2026-06-07 | Fraunces sebagai display font        | Warm editorial serif, distinctive untuk knowledge registry. Tidak ada developer tool lain yang pakai ini. |
| 2026-06-07 | Plus Jakarta Sans ganti Geist Sans   | Softer, less "Vercel tooling", lebih fit untuk community/cultural product |
| 2026-06-07 | Geist Mono dipertahankan untuk data  | Sempurna untuk source IDs dan technical data. Tabular-nums support. |
| 2026-06-07 | Source Serif 4 untuk prose/docs      | Upgrade dari ui-serif fallback. Intentional serif untuk docs drawer. |
| 2026-06-07 | Jade/Amber/Rust sebagai semantic colors | Warm variants dari hijau/kuning/merah — konsisten dengan earthy palette. Bukan harsh primaries. |
| 2026-06-07 | Dark mode: #1A1916 bukan #000000     | Warm dark brown. Archival identity konsisten di kedua mode. |
| 2026-06-07 | Tab switch: opacity crossfade only   | No slide — mencegah layout shift di data tables. |
| 2026-06-07 | Design direction: Editorial/Archival | EUREKA: Indonesian Islamic tools = news density atau white SaaS. Developer registries = cold technical. Intersection ini kosong — archival aesthetic mengisi gap yang genuine. |
