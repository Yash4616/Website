# REBUILD — yash.systems as a research artifact

> **This document replaces MASTER_PLAN.md entirely.** Everything in that file about neural canvases, glassmorphism, boot loaders, custom cursors, orbital radars, and cyan/violet gradients is **dead**. Do not read it for design guidance. It is retained only as a source of verified content data (§3).
>
> **Owner:** Yash Gurjar — AI & ML Engineer, JECRC University, Jaipur
> **Domain:** https://www.yash.systems
> **Build from scratch.** New Next.js scaffold. Port data, not code.

---

## 0. WHY WE'RE RESTARTING

The previous direction failed for a specific, diagnosable reason: **cyan-on-black + particle network + glassmorphism + terminal boot + glow-on-everything is the single most-generated portfolio aesthetic in existence.** Those elements don't signal "cutting-edge AI" — they signal *costume*. Any viewer who has seen a generated site recognizes them instantly. More polish makes it more polished slop.

The replacement direction is the opposite move.

**The site is a research artifact.** A paper. A lab notebook. A technical document set with real typographic care. Numbered sections, figures with captions, margin notes, tabular data, footnotes, a colophon. Warm paper, ink-black type, one accent used sparingly.

Why this works where the other failed:

1. **It is unfakeable by pattern-matching.** Generated design reaches for decoration. This direction's entire aesthetic is *restraint* — correct measure, real hierarchy, tabular figures, generous whitespace. Those are choices, not effects.
2. **It is the most on-brand possible look for an ML engineer.** Yash's actual work product is papers, notebooks, plots, and metrics. The site should look like the thing he makes, not like a sci-fi film's idea of it.
3. **His real content becomes the visual language.** Loss curves, confusion matrices, and benchmark tables stop being widgets bolted onto a design and become *the figures of the document*. The credibility and the aesthetics become the same thing.
4. **It is genuinely rare.** Search any portfolio gallery: thousands of dark-neon sites, almost no editorial-technical ones.
5. **It is fast by construction.** Removing WebGL removes the entire reason the last build was heavy. The performance target goes *up* while the work goes down.

---

## 1. ART DIRECTION

### 1.1 The one-line brief

**A well-set technical document that happens to be a website.**

Every decision resolves against that. If a treatment would look out of place in a beautifully typeset paper, it doesn't ship.

### 1.2 Typography — the primary lever

Two families. No third. Both via `next/font/google`, `display: "swap"`, latin subset.

| Role | Face | Used for |
|---|---|---|
| Prose & display | **Newsreader** (variable, has optical sizing) | Name, section titles, body copy, abstract, captions |
| Data & UI | **IBM Plex Mono** | All numbers, tables, labels, nav, buttons, metadata, footnote marks |

Acceptable substitutes if Newsreader renders poorly: **Source Serif 4** or **Literata**. Do not substitute anything geometric or "modern sans." **Inter is banned** — it is the typeface of not having chosen a typeface.

**Non-negotiable typographic details.** These are what separate typeset from styled:

- `font-variant-numeric: tabular-nums` on **every** number that appears in a table, metric, or figure. Non-negotiable.
- Body measure capped at **68ch**. Never full-bleed prose.
- Body size **19px**, line-height **1.6**. Sidenotes 14px / 1.45. Mono data 14px.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Real typography: en dash for ranges (2023–2027), em dash for asides, `×` for multiplication, `−` for minus, proper curly quotes. Never a hyphen doing a dash's job.
- Labels in mono, uppercase, `letter-spacing: 0.08em`, at 12px.
- Section numbers as `§ 01`, `§ 02` — set in mono, in the accent colour.
- Footnote references as superscript mono numerals.
- Hanging punctuation via `hanging-punctuation: first` where supported.

### 1.3 Colour — paper, ink, one accent

**Light mode. Warm paper, not white. Warm black, not blue-black.**

```css
--paper:        #FBFAF8;   /* page */
--paper-sunk:   #F3F1EC;   /* figure and table backgrounds */
--ink:          #1A1917;   /* body text — warm near-black */
--ink-2:        #55524C;   /* secondary text, captions */
--ink-3:        #8A867E;   /* metadata, muted labels */
--rule:         #DFDBD2;   /* hairlines, table rules, borders */
--accent:       #C1440E;   /* vermillion — section marks, links, active state */
--data-a:       #1A1917;   /* chart series 1 */
--data-b:       #2B4C7E;   /* chart series 2 — muted blue, DATA ONLY */
```

**Accent discipline.** Vermillion appears on: `§` section numbers, link hover, footnote marks, the active nav item, and the single diagonal in a confusion matrix. That's the complete list. If more than ~2% of the viewport is accent-coloured, it's wrong.

`--data-b` exists so charts can have two series. It is **never** used for UI.

> **The one call to reverse if you disagree:** light mode. If Yash wants dark, the correct dark is *warm* — `--paper: #14130F`, `--ink: #EDEAE3`, same vermillion, same everything else. Do not go back to blue-black. Do not add a toggle.

### 1.4 Grid & layout — the margin is the feature

A three-track page grid, and the outer track is what makes this look like a document rather than a blog:

```
│  ← margin ─→ │ ←──── measure (68ch) ────→ │ ←─ sidenotes ─→ │
│              │                             │                 │
│   § 01       │  Selected Work              │  Trained on a   │
│              │                             │  single T4;     │
│              │  Body text lives here at    │  see Fig. 2 for │
│              │  a comfortable measure…     │  the ablation.  │
```

- **Left margin track:** section numbers, figure numbers, running labels. Mono, small, muted.
- **Centre track:** prose and headings, capped at 68ch.
- **Right sidenote track:** margin notes, keyed to the text with superscript numerals. This is the signature element — Tufte-style sidenotes are rare on the web and instantly read as "document."
- **Figures may break out** of the measure and span centre + sidenote tracks. That contrast is what makes figures feel like figures.
- Below `lg`: collapse to a single column; sidenotes become inline, indented, rule-marked asides. Below `md`: sidenotes collapse to tap-to-expand footnotes.

**Rules (hairlines) do the structural work.** 1px `--rule` above every section, under table headers, around figures. No cards. No shadows. No rounded corners beyond 2px.

### 1.5 Motion — structural only

Framer Motion is permitted but should barely be used. Prefer native CSS scroll-driven animation (`animation-timeline: view()`) behind `@supports`, which is free.

**The complete permitted motion vocabulary:**

1. Headings reveal by line mask — `overflow: hidden` parent, child `y: 100% → 0`.
2. Section rules draw left-to-right on enter (`scaleX: 0 → 1`, `transform-origin: left`).
3. Figures draw themselves — SVG `pathLength: 0 → 1` for curves; cells stagger in for matrices.
4. Sidenotes fade and slide 8px as their reference enters the viewport.
5. Links: `text-decoration-thickness` and `text-underline-offset` transition, colour → accent.

Nothing else. No hover scale, no glow, no parallax, no tilt, no particles, no cursor. Durations 200–500ms, `cubic-bezier(0.2, 0, 0, 1)`.

Under `prefers-reduced-motion`, everything resolves instantly to its final state.

### 1.6 Banned outright

Violating any of these means the section gets redone. This list exists because every item on it is a slop signature.

1. Particle networks, neural-net backgrounds, constellation effects, "AI wallpaper" of any kind
2. Glassmorphism, `backdrop-blur`, translucent cards
3. Glow, neon, `box-shadow` used decoratively
4. Cyan/violet — or any two-colour neon gradient
5. Gradient-filled text
6. Bento grids
7. Custom cursors
8. 3D tilt / perspective cards
9. Terminal boot loaders, fake compilation sequences, typewriter effects
10. Orbital / radar / constellation skill visualizations
11. Inter, Space Grotesk, or any other default-feeling sans
12. Emoji used as iconography
13. `rounded-2xl` card grids
14. Dark blue-black backgrounds
15. Marquees, beams, spotlights, animated borders, aurora, meteors, sparkles
16. Any loading ceremony at all — the page loads instantly, and that restraint *is* the statement

### 1.7 On 21st.dev

Permitted, with a hard rule, because misusing it will reproduce exactly the problem we're fixing.

**Allowed:** structural and interaction primitives with no inherent look — dialog, popover, scroll area, tabs, text-reveal-on-scroll, table primitives, form controls. Install via the shadcn CLI from the registry, then **strip every style down to zero and rebuild against §1.2–1.4.** If the component still looks like it did on 21st.dev, you haven't finished.

**Banned:** anything with a built-in aesthetic — gradient cards, glow buttons, beams, spotlights, animated borders, particle backgrounds, "AI"-themed anything, bento layouts, 3D cards. These are used on thousands of sites; shipping them is how a site becomes indistinguishable.

The same rule applies to any component registry. Borrow behaviour, never appearance.

---

## 2. DOCUMENT STRUCTURE

The site is one page. Sections are numbered like a paper's. A margin table of contents tracks scroll position.

### Title block
Set like a paper's header, not a hero.

```
YASH GURJAR                                    v3.0 · rev. 2026-08-07
AI & ML Engineer
JECRC University, Jaipur · B.Tech CSE (AI & ML)
─────────────────────────────────────────────────────────────────────
```

Name in Newsreader at ~4rem, tight. Metadata in mono, muted. A hairline. No image, no CTA row, no scroll hint. The next thing on screen is the abstract — real content above the fold.

### Abstract
The bio, set as an actual abstract: slightly inset, 17px, `--ink-2`. Two short paragraphs. Label it `ABSTRACT` in mono small caps.

### § 01 — Selected Work
The core of the document and where most effort goes. Each project is a numbered entry, **not a card**:

```
[1]  tokenizer                                        Rust · Python
─────────────────────────────────────────────────────────────────────
     A 262,144-token BPE tokenizer trained on 16 GB of filtered text,
     reaching full parity with cl100k_base and o200k_base.

     ARCHITECTURE   Byte-level BPE, Rust core
     CORPUS         16 GB (filtered from ~180 GB)
     THROUGHPUT     ~1 GB prose / 28 s, single process
     PARITY         cl100k_base ✓   o200k_base ✓

     Fig. 1 — Throughput vs. reference implementations
     [bar figure]

     LIMITATIONS    <verbatim from README>

     → repository                                    ↗ github.com/…
```

Rules, not borders. Spec tables in mono with tabular figures. Figures numbered continuously across the document and captioned in the margin. `LIMITATIONS` is a required field and is the most credible thing on the page — a portfolio that states its own failure modes is unmistakably written by a practitioner.

Featured order stays: **tokenizer, object detection + segmentation, local RAG**, then the rest.

### § 02 — Methods
Skills, set as a dense typographic table grouped by category. No orbits, no badges, no pills.

```
LANGUAGES        Python · Rust · TypeScript · C++ · JavaScript
FRAMEWORKS       PyTorch · TensorFlow · scikit-learn · React · Next.js
INFRASTRUCTURE   Docker · Google Cloud · CUDA / cuDNN · MySQL
TOOLING          Git · Figma · Matplotlib
```

Optionally a small right-aligned mono column indicating depth. Keep it quiet — this section is reference material, not a showcase.

### § 03 — Background
Education and trajectory as a compact table with real dates. Degree, institution, dates, one line of note. A hairline-separated row per entry. No progress bars, no icons.

### § 04 — Correspondence
A short paragraph, then a plain, well-set form: name, email, message. Serif labels, hairline-underlined inputs, a mono submit button. Real `<label>`s, real validation, real focus states.

Backend: **Resend + Next.js Route Handler** at `app/api/contact/route.ts`. Server-side zod re-validation, an in-memory rate limit (3 per 10 min per IP), a honeypot field, `replyTo` set to the sender. Never leak the key or a stack trace.

Contact facts below the form as a small mono block: email, location, availability.

### Notes & References
Footnotes collected at the bottom, numbered, mono marks, linking back to their references in the text.

### Colophon
The footer, and one of the details that will be remembered:

```
COLOPHON
Set in Newsreader and IBM Plex Mono. Built with Next.js and
deployed on Vercel. Figures rendered as inline SVG from measured
data. Source available on GitHub.

Last revised 2026-08-07 · v3.0            [ Cite ]  [ Print ]  [ ↑ ]
```

Colophons are a print convention and virtually nonexistent on the web. It costs nothing and signals that someone who cares about documents made this.

---

## 3. CONTENT — GROUND TRUTH

**Do not re-research this and do not invent anything.** The previous build's `src/data/config.ts` (commit `33b0a6d`) contains GitHub-API-verified project data, real README-sourced metrics, and approved limitations lines. That work is fact, not design — **port it forward.** Restructure the types for the new document model, but every number must survive unchanged.

Rules that carry over unchanged:

- Every metric traces to a repo README or code. Nothing fabricated. If unverifiable, omit the field.
- **The ResNet18 F1 of 98.62% stays excluded** — it is arithmetically impossible from its own precision and recall.
- Star and fork counts are all zero; **omit them entirely** rather than printing zeros.
- Seven projects: tokenizer, object detection + segmentation, local RAG, ResNet18-CIFAR10, Computer-Vision (described honestly as integration work around pretrained models), Sorting_Visualizer, and this website.
- Canonical links: github.com/Yash4616 · linkedin.com/in/yashgurjar9 · x.com/Yash_9724 · yashgurjar9714@gmail.com · https://www.yash.systems

**Zero hardcoded user-facing content in components.** Everything lives in `src/data/config.ts`, fully typed, no `any`.

**Figures still needed from Yash** (build the components to degrade cleanly when data is absent):

- ResNet18 confusion matrix — a 10×10 `number[][]` from running eval on the saved model.
- Training curves — downsampled loss / val-accuracy arrays, ≤48 points each, from training logs.

---

## 4. SIGNATURE DETAILS

Small, cheap, and disproportionately memorable. Build all of them.

1. **Margin table of contents** — a persistent left-margin TOC that highlights the current section via `IntersectionObserver`. Exactly how a long paper behaves.
2. **Figures with real captions** — `Fig. 3 — Validation accuracy across 60 epochs; plateau at ~48.` Numbered continuously, set in the margin. Captions that *interpret* the figure, not just label it.
3. **Sidenotes** — asides in the outer track, keyed by superscript numerals, appearing as their reference scrolls into view.
4. **Cite button** — copies a real BibTeX entry for the portfolio to the clipboard:
   ```bibtex
   @misc{gurjar2026,
     author = {Gurjar, Yash},
     title  = {Yash Gurjar — AI \& ML Engineer},
     year   = {2026},
     url    = {https://www.yash.systems}
   }
   ```
   Nobody has this. It is funny and completely sincere at the same time.
5. **Print stylesheet** — a real `@media print` block that renders the page as a clean printable document: sidenotes become true footnotes, links expand to show their URLs, figures stay legible, navigation drops away. A paper you can actually print.
6. **`/llms.txt`** — a route generated from `siteConfig` returning a clean plain-text version of the document, for the increasing share of first-pass screening done by an LLM. Linked via `<link rel="alternate" type="text/plain">`.
7. **Revision line** — `Last revised <date> · v3.0`, generated at build time.
8. **Keyboard navigation** — `j`/`k` or arrows to move between sections, `/` to focus search-free jump. Quiet, undocumented except in the colophon.

---

## 5. TECHNICAL SPEC

- **Next.js 15**, App Router, TypeScript strict. Zero `any`, zero `@ts-ignore`.
- **React Server Components by default.** `"use client"` only at leaves that need interactivity. Most of this document is static — the vast majority of it should ship zero JS.
- **Tailwind** with all tokens from §1.3 declared in `globals.css` and mapped in config. No arbitrary values where a token exists.
- **No WebGL. No Three.js. No OGL. No canvas.** All figures are inline SVG generated from data.
- **Framer Motion** only where native CSS scroll-driven animation can't reach.
- **Routes:** single page `/`, plus `/projects/[slug]` static pages per project (`generateStaticParams` over `siteConfig.projects`, shared figure components, per-page metadata and `SoftwareSourceCode` JSON-LD), plus `/llms.txt` and `/api/contact`.
- **Fonts** via `next/font/google`, preloaded, `display: "swap"`.
- **OG image** via `next/og` `ImageResponse`, generated from `siteConfig` at build time — set in Newsreader on paper, matching the site.

### Budgets — raised, because this direction is cheap

| Metric | Target |
|---|---|
| First Load JS (gzipped) | **< 120 KB** |
| Lighthouse Performance | **100** |
| Lighthouse Accessibility | **100** |
| Lighthouse Best Practices | **100** |
| Lighthouse SEO | **100** |
| LCP | < 1.2 s |
| CLS | **0** |

These are strict, and they are achievable — there is no 3D, no loader, and almost no client JS. If you're over, find out why before continuing.

### Accessibility

Easier here than in the previous direction; hold it to a higher standard accordingly.

- Semantic document structure: one `<h1>`, `<section aria-labelledby>` per section, `<article>` per project, real `<table>` for tabular data, `<figure>`/`<figcaption>` for every figure.
- Every figure has a text alternative that states what it shows, not that it exists.
- Contrast: verify `--ink-3` (#8A867E) on `--paper` — it sits near the 4.5:1 line. Restrict it to non-essential metadata or darken it.
- Full keyboard pass, visible focus rings in the accent colour, logical order, no traps.
- Sidenotes must be reachable and readable in source order by a screen reader.

---

## 6. BUILD ORDER

One stage at a time. After each, run the gate and paste real output. Do not start the next stage without approval.

| Stage | Deliverable |
|---|---|
| **1** | Fresh scaffold. Fonts, colour tokens, grid system, `config.ts` ported from `33b0a6d`, types, `lib/utils.ts`. A typographic specimen page proving the type scale, measure, rules, tabular figures, and sidenote track before any content is built. |
| **2** | Page shell: title block, abstract, margin TOC, section-header pattern, sidenote component, footnote system. |
| **3** | § 01 Selected Work — project entries, spec tables, `/projects/[slug]` pages. No figures yet. |
| **4** | Figure system — SVG curve, bar, and matrix components with numbering, captions, scroll-draw, and clean degradation when data is missing. Wire into § 01. |
| **5** | § 02 Methods, § 03 Background. |
| **6** | § 04 Correspondence + Resend route handler. |
| **7** | Notes & References, colophon, cite button, print stylesheet, `/llms.txt`, keyboard nav, OG image. |
| **8** | Performance, accessibility, SEO, cross-browser, mobile at 375px. Meet every §5 budget. |

**Gate after every stage:**

```bash
npx tsc --noEmit      # zero errors
npm run lint          # zero errors
npm run build         # succeeds; report First Load JS
npm run dev           # zero console errors or warnings
```

Plus: renders correctly at 375px, keyboard-navigable with visible focus, zero layout shift, zero hardcoded user-facing strings.

**Stage 1 has an extra gate:** the typographic specimen must be reviewed and approved before any real content is built. Type and grid are the entire aesthetic here — if they're wrong, everything built on them is wrong, and finding that out at Stage 6 is expensive.

---

## 7. DEFINITION OF DONE

1. It reads as a document someone typeset, not a page someone styled.
2. Nothing on it appears on the §1.6 banned list.
3. Every number is real and traceable to a repository.
4. The loss curves, confusion matrix, and benchmark tables are the visual interest — there is no decorative element carrying the design.
5. It prints cleanly.
6. Lighthouse 100 across all four categories, under 120 KB of JS.
7. Yash can add a project by editing one object in one file.
8. **The test:** show it to a working ML engineer for thirty seconds. "Nice site" is a failure. *"Who set this?"* or *"is that your actual confusion matrix?"* is the target.
