# DESIGN — LearnML Platform

## Identity

Platform interaktif latihan interview Machine Learning, Deep Learning, dan LLM Engineer.
Audience utama: kandidat ML/AI Engineer, Data Scientist, AI Research Engineer.
Tone: **Teknis, langsung, tanpa basa-basi**. Fokus pada akurasi materi dan efisiensi belajar.

**Personality**
- Teknis & kredibel (materi dikurasi ketat, jawaban presisi)
- Efisien (tanpa hambatan akses, tanpa login, tanpa paywall)
- Modern developer tooling aesthetic (dark-first, monospace metrics, sharp borders)

## Palette

- **Base Background:** `#0D1117` (near-black, GitHub-inspired)
- **Surface / Card:** `#151B23`
- **Surface Muted:** `#1C212B`
- **Border / Divider:** `#262C36`
- **Border Strong:** `#363D4A`
- **Primary Text:** `#E6E8EB`
- **Secondary Text:** `#8B93A1`
- **Tertiary Text:** `#636B78`

- **Primary Accent (Active/Interactive):** `#6E56CF` (Violet)
- **Secondary Accent (Insight/Highlight):** `#E8A33D` (Amber)
- **Domain Blue (Classical ML):** `#3B82F6`

- **Badge Easy:** bg `rgba(59,130,246,0.12)` / fg `#60A5FA` / border `rgba(59,130,246,0.3)`
- **Badge Medium:** bg `rgba(232,163,61,0.12)` / fg `#FBBF24` / border `rgba(232,163,61,0.3)`
- **Badge Hard:** bg `rgba(239,68,68,0.12)` / fg `#F87171` / border `rgba(239,68,68,0.3)`

Both palettes live as CSS tokens in `globals.css`: dark values in `:root`, light
values in `[data-theme="light"]`. Dark is the default for a developer-tooling
context; the toggle writes `theme` to localStorage and an inline script in
`<head>` applies it before first paint.

Accent values are split in two per palette. `--accent` fills buttons and active
borders, `--accent-text` is the same hue lightened or darkened until it clears
WCAG AA as link text on that theme's background. Using one value for both fails
contrast in at least one mode.

Badge and domain colors have their own text tokens (`--badge-*-fg`,
`--domain-*-text`) for the same reason.

- **Tertiary Text (dark):** `#7C8494` (was `#636B78`, which was 3.6:1 on `#0D1117`)

## Typography

- **Headings (h1–h6):** Space Grotesk — technical, geometric, distinctive
- **Body & UI:** IBM Plex Sans — readable, neutral, wide language support
- **Code / Math / Live Metrics:** IBM Plex Mono — strictly for code, math notation, live numbers

Line length < 80 chars. One confident weight per role (400/500/600).

## Spacing & Radius

- **Controls (input, button, badge):** `rounded` (4px) — sharp, deliberate
- **Cards / Panels:** `rounded` (4px) — no large radius, no pill shapes
- **Chips:** `rounded-full` (9999px) — inline pills only
- **Domain Cards:** thin left border 3px (no radius override)
- Spacing scale: `gap-2`~`gap-6`, section `py-12`~`py-16`, content max-width `1400px`

Rationale: crisp, no floating shadows, hierarchy via borders not elevation.

## Dials

| Dial | Value | Reason |
|------|-------|--------|
| ENERGY | 2 | Functional tool, not marketing showcase. Serious but not sterile. |
| RHYTHM | 2 | Sections vary by content type (hero viz, feature grid, domain cards, pricing single, FAQ). |
| MOTION | 1 | Static default. Only motion: answer expand/collapse and page-enter fade-up (350ms). No scroll animations, no looping visuals. |

## Identity Motifs

1. **Role-coded left borders** on question cards (ML/MLOps=Blue, AI Engineer=Amber, everything else=Violet) — instant visual taxonomy at a glance. Border color maps to the role badge, so the two never disagree.
2. **Monospace for machine values only:** topic counts, difficulty levels, question positions in a session. Prose never goes mono.
3. **Single accent (Violet)** for all interactive states (focus, hover, active tabs, primary buttons) — one deliberate accent.
4. **Sharp 1px borders everywhere** — no shadows, no glass, no glow. Crisp boundaries.

## Key Design Decisions (R-31)

- **Dark + light toggle, dark by default:** Developer/AI tooling context justifies the dark default, but people read long markdown answers in bright rooms too. Toggle is required, not optional.
- **No hero illustration:** The hero is the question count, the topic count, and two actions. A decorative visual would compete with the catalog for attention without helping anyone decide whether to start.
- **No stats without a source:** Hero numbers come from the database. No fake "10K+ users", no invented engine status, no pricing card for a product that costs nothing.
- **No "Trusted By" logo bar, no fake stats, no testimonials:** Evidence over claims (C-5). Real content: question count, domain coverage, free access.
- **Single pricing card (Free/Community Tier):** No fake tiers, no "Most Popular" badge. Honest pricing.
- **Top navbar (fixed) + scrollable main:** Replaced left sidebar. Admin hidden from nav (URL-only access at `/admin`).
- **Smooth scroll + page-enter animation:** 350ms fade-up on load, staggered section reveals. Respects `prefers-reduced-motion`.
- **Custom dark scrollbar:** Thin, matching palette.
- **Copy:** Active voice, no em-dashes, no buzzwords. "Uji pemahaman..." not "Platform yang memungkinkan Anda menguji..."

## Future Considerations

- Progress tracking / spaced repetition (local-first)
- Timer mode for interview simulation
- Export bookmarked questions to markdown
- Public API for question data