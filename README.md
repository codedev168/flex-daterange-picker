# flex-daterange-picker

1. Classic Dual-Month Calendar + Presets (Most Popular & Versatile)

Show two months side-by-side (current + next) on desktop → one month + scroll on mobile
Quick presets on the left/top:
Today / Yesterday
Last 7 days / Last 30 days
This week / This month / This quarter
Last week / Last month
Custom range...
Highlight selected range with gradient fill (start → end)
Small "pill" chips above or below showing:
15 Feb 2026 – 28 Feb 2026 (12 days)
Sticky footer with Apply (primary button) + Cancel / Clear
Bonus: “Today” dot/button always visible

Best for: Analytics, reports, e-commerce orders, admin filters
2. Minimal Input + Smart Dropdown Calendar

Single field showing:
12 Jan 2026 – 19 Jan 2026
or
Jan 12 – Jan 19, 2026 (shorter)
Click → dropdown opens with calendar + presets
Allow direct typing in the field (parse smartly: "last 14d", "next month", "15-28 feb")
Auto-suggest/format while typing (very loved in 2025+ tools)
Small chevron or calendar icon on right

Best for: Clean dashboards, mobile-first apps, tight spaces
3. Two Separate Fields (From – To) + Linked Calendar

Two input boxes:
From: [15 Feb 2026]
To:   [28 Feb 2026 ▼]
Clicking either opens one shared calendar popover
First click selects start → second click selects end
Hover highlights potential range
Visual connection (line or same color) between the two fields

Best for: Booking flows (check-in / check-out), forms where users often type dates
4. Timeline / Slider Style (Modern & Visual)

Horizontal bar showing months or weeks
Two draggable handles for start & end
Background shading for selected period
Small labels/tooltips showing exact dates
Optional: zoom in/out (day → week → month view)

Best for: Gantt-like tools, performance graphs, content scheduling
5. Floating Pill + Quick Edit (Very 2025–2026 Trend)

Initial state: one rounded pill
Last 30 days ▼
Click → shows dropdown menu:
Predefined ranges
“Custom” → opens mini calendar or fields

After custom selection → pill updates to:
1 Feb – 28 Feb 2026 (pill stays compact)

Best for: Very clean SaaS dashboards (Notion-style, Linear, Vercel, etc.)
6. Mobile-Optimized Patterns

Full-screen modal calendar on tap
Big tappable days
Swipe to change months
Top bar shows selected range + “Done” button
Optional number stepper for quick ±7 days adjustment
Huge presets as big chips at top

## Installation

```bash
npm install @codedev168/flex-daterange-picker
```

## Usage

```typescript
import { } from '@codedev168/flex-daterange-picker';
```

## License

MIT
