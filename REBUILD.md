# REBUILD — yash.systems

## "THE INSTRUMENT" — a dark technical monograph

> **This document is the sole source of truth.** It replaces MASTER_PLAN.md and every earlier draft. Those files are dead for design purposes and are retained only as a source of already-verified content data (§6).
>
> **Owner:** Yash Gurjar — AI & ML Engineer · JECRC University, Jaipur · B.Tech CSE (AI & ML)
> **Domain:** https://www.yash.systems
> **Approach:** Build from scratch. Port data, never code or styles.

---

## CONTENTS

| § | Section |
|---|---|
| 0 | Why we're restarting — the failure mode being fixed |
| 1 | **Art direction** — the metaphor and why it's rare |
| 2 | **Design system** — type, colour, grid, texture, motion |
| 3 | **Banned outright** — the anti-slop list |
| 4 | Component registries (21st.dev) |
| 5 | **Document structure** — section by section |
| 6 | Content & ground truth |
| 7 | Signature details |
| 8 | **What's missing from your portfolio strategy** |
| 9 | Technical spec & budgets |
| 10 | Accessibility |
| 11 | Build order & gates |
| 12 | Definition of done |

---

## 0. WHY WE'RE RESTARTING

The previous direction failed for a diagnosable reason, and naming it precisely is what prevents repeating it.

**Cyan-on-black + particle network + glassmorphism + terminal boot sequence + glow-on-everything is not a design. It is a genre** — the single most-generated aesthetic of the last three years. Every element in it is a *signifier* of "AI" rather than a design decision. You cannot polish your way out of a genre; more craft applied to those elements produces more refined slop.

The second failure was subtler and matters more. That direction had **no content of its own**. The design was carrying the entire load, so the design had to shout. When the visual system is doing all the work, it will always look generic, because there are only so many ways to shout.

The fix is structural, not cosmetic:

**Make the work itself the visual interest.** Yash's real output — loss curves, confusion matrices, throughput benchmarks, architecture specs, honest limitations — is more visually distinctive and infinitely more credible than any particle field. Build a design system whose only job is to present that material with precision. Then the design can be quiet, and quiet is what reads as professional.

Dark, yes. But dark like a precision instrument, not dark like a sci-fi HUD.

---

## 1. ART DIRECTION

### 1.1 The metaphor

**The documentation for a precision instrument.**

A Leica manual. A synthesizer service schematic. An oscilloscope spec sheet. A watch movement diagram. A Braun product sheet. These share a specific quality: **dense, dark, exact, beautifully set, and entirely undecorated.** Every mark on the page is load-bearing. Nothing is there to impress you, which is exactly why it does.

### 1.2 Why this direction is rare and reads as professional

1. **Nobody uses it for portfolios.** Search any gallery: thousands of dark-neon sites, near-zero instrument-documentation ones.
2. **Precision reads as competence.** Glow reads as effort. A perfectly aligned hairline rule and a table of tabular figures communicate rigour in a way no animation can.
3. **It's inherently technical**, so it's on-brand for ML without a single "AI" signifier.
4. **It's dark without being sci-fi** — the specific thing you asked for.
5. **Restraint cannot be pattern-matched.** Generated design reaches for decoration. This direction's entire aesthetic *is* the absence of it, plus obsessive attention to spacing, measure, rules, and numerals.

### 1.3 What it looks like

```
┌ ─                                                              ─ ┐
   YASH GURJAR                                    REV 3.0 · 2026-08
   ─────────────────────────────────────────────────────────────
   AI & ML ENGINEER                    JECRC UNIVERSITY · JAIPUR IN
                                       AVAILABLE 2027 · REMOTE OK

   Trains neural networks and ships the systems around them.
   Currently building tokenizers, retrieval systems, and vision
   pipelines that run on hardware I actually own.


   01 /  SELECTED WORK
   ─────────────────────────────────────────────────────────────

   [1]   tokenizer                                    RUST · PYTHON
         ───────────────────────────────────────────────────────
         A 262,144-token BPE tokenizer trained on 16 GB of
         filtered text, at full parity with o200k_base.

         VOCAB          262,144
         CORPUS          16.0 GB      filtered from ~180 GB
         THROUGHPUT       1.0 GB / 28.4 s      single process
         PARITY          cl100k_base ✓    o200k_base ✓

         ┌ ─                                        ─ ┐
                  FIG. 1 — THROUGHPUT COMPARISON
              ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  this impl
              ▇▇▇▇▇▇▇▇▇▇▇▇▇▇            reference
         └ ─                                        ─ ┘

         LIMITATIONS    <verbatim from README>

         →  REPOSITORY                              ↗ github.com/…
└ ─                                                              ─ ┘
```

Note the corner ticks around the figure — registration marks, as on a technical drawing. That single detail does more for the aesthetic than any effect, and costs four `<span>`s.

---

## 2. DESIGN SYSTEM

### 2.1 Colour — warm-neutral graphite, one signal accent

Dark mode has two amateur tells: **pure black grounds** and **pure white text**. Both are harsh, both flatten depth. Use a near-black with a faint neutral warmth, and an off-white ink.

```css
/* Grounds — depth comes from layered planes + 1px rules, never shadows */
--ground:       #0E0E10;   /* page */
--plane-1:      #141416;   /* raised surfaces, tables, form fields */
--plane-2:      #1A1A1D;   /* figure grounds, code blocks */

/* Ink */
--ink:          #E8E6E1;   /* primary — warm off-white. NEVER #FFFFFF */
--ink-2:        #9A968E;   /* secondary text, captions */
--ink-3:        #8A857C;   /* metadata, labels — verify 4.5:1 before shipping */

/* Structure */
--rule:         #232326;   /* hairlines */
--rule-strong:  #33333A;   /* table headers, section dividers */

/* Signal — ONE accent */
--accent:       #FF5A1F;   /* signal orange */
--accent-dim:   #B33D12;   /* pressed / visited states */

/* Data visualisation ONLY — never UI */
--data-1:       #E8E6E1;
--data-2:       #FF5A1F;
--data-3:       #5B9A8B;   /* third series only */
```

**Why signal orange.** It is the colour of instrument markings, chronograph hands, hazard tape, and safety-critical UI. It is warm against a cool-neutral ground, it is unmistakably *not* an AI-portfolio colour, and it has enough luminance to pass AA on near-black. Cyan and violet are banned; blue is banned as an accent because blue-on-dark is the default everyone reaches for.

**Documented alternative** if orange doesn't land: **sulphur `#D8FF3E`** (acid yellow-green — sharper, more contemporary, slightly riskier) or **bone `#E8E6E1` as its own accent** with zero colour anywhere, which is the most austere option and also completely defensible.

**Accent discipline.** The accent appears on: section numbers, link hover and focus, the active TOC entry, the diagonal of a confusion matrix, and one data series. That is the entire list. **If more than ~2% of any viewport is accent-coloured, it is wrong.**

### 2.2 Typography — two families, no third

Dark grounds change the calculus: high-contrast serifs optically thin out and shimmer on dark. So the display face must be sturdy.

| Role | Face | Used for |
|---|---|---|
| Display, headings, body | **Archivo** (variable) | Name, section titles, prose, UI |
| Data, labels, metadata | **IBM Plex Mono** | Every number, table, label, caption, nav, button |

Both via `next/font/google`, `display: "swap"`, latin subset, preloaded.

**Archivo** is a sturdy grotesk with a genuine width axis. Set the name in **Archivo Expanded, weight 700**, letter-spaced tight — it reads industrial and confident, and almost nobody uses it. Body copy is regular-width Archivo at 400.

**Documented alternative** for more warmth: **Fraunces** (variable, with `SOFT` and `WONK` axes) as display only, paired with Archivo for body. Use if the grotesk feels too cold.

**Banned faces:** Inter, Space Grotesk, Poppins, Montserrat, Roboto, and anything else that reads as "I didn't pick a typeface."

#### Non-negotiable typographic rules

These are the actual difference between *typeset* and *styled*:

- **`font-variant-numeric: tabular-nums` on every number** in a table, metric, or figure. Non-negotiable. Ragged numerals in a spec table destroy the entire premise.
- Body measure capped at **68ch**. Never full-bleed prose.
- Scale: body 18px / 1.65 · sidenotes 14px / 1.5 · mono data 13px / 1.5 · labels 11px uppercase, `letter-spacing: 0.1em`.
- Display: name at `clamp(2.75rem, 7vw, 5.5rem)`, `letter-spacing: -0.03em`, `line-height: 0.95`.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Correct marks: en dash for ranges (2023–2027), em dash for asides, `×` for multiplication, `−` for minus, `·` as separator, curly quotes. **A hyphen doing a dash's job is a visible error at this level of finish.**
- Units are set in `--ink-3` at a smaller size than their value: `16.0` `GB`.
- Section numbers as `01 /` in mono, accent-coloured.

### 2.3 Grid — three tracks, and the outer one is the feature

```
│ ← margin → │ ←──────── measure (68ch) ────────→ │ ← sidenotes → │
│            │                                     │               │
│   01 /     │  SELECTED WORK                      │  Trained on a │
│            │  ─────────────────────────────────  │  single T4;   │
│  FIG. 1    │  Body text lives here at a          │  see Fig. 2   │
│            │  comfortable measure, never wider.  │  for ablation │
```

- **Left margin track** — section numbers, figure numbers, running labels, grid coordinates. Mono, 11px, `--ink-3`.
- **Centre track** — headings and prose, capped at 68ch.
- **Right sidenote track** — margin notes keyed by superscript numerals, appearing as their reference scrolls into view. This is the signature structural element; Tufte-style sidenotes are rare on the web and instantly read as *document*.
- **Figures break out** across centre + sidenote tracks. That width contrast is what makes a figure feel like a figure.

**Responsive collapse:** below `lg`, single column with sidenotes as rule-marked inline asides. Below `md`, sidenotes become tap-to-expand footnotes.

**Rules do all structural work.** Hairlines above every section, under table headers, framing figures. **No cards. No shadows. No rounded corners beyond 2px. No borders thicker than 1px** except the deliberate 2px section divider.

### 2.4 Texture — how a dark design avoids looking flat

Dark designs die from flatness, and the usual cures (glow, glass, gradients) are banned. Use these instead:

1. **Grain.** A baked 128×128 PNG tile at `opacity: 0.025`, `mix-blend-mode: overlay`, fixed, `pointer-events: none`. Bake it at build time — never a live `feTurbulence` filter, which is expensive to rasterise every paint.
2. **Layered planes.** Depth from `--plane-1` / `--plane-2` separated by 1px `--rule`, never from shadow.
3. **A faint measurement grid.** Vertical hairlines at the grid columns, `opacity: 0.03`, visible only as a suggestion of structure. Graph paper, not decoration.
4. **Registration marks.** L-shaped corner ticks on figures and the page frame. Pure geometry, zero cost, enormously distinctive.

### 2.5 Motion — structural only

Prefer native CSS scroll-driven animation (`animation-timeline: view()`) behind `@supports`; it runs on the compositor and ships zero JS. Framer Motion only where CSS can't reach.

**The complete permitted vocabulary:**

1. Headings reveal by line mask — `overflow: hidden` parent, child `y: 100% → 0`.
2. Section rules draw left to right — `scaleX: 0 → 1`, `transform-origin: left`.
3. Figures draw themselves — SVG `pathLength: 0 → 1` for curves, staggered cells for matrices, `scaleX` for bars.
4. Sidenotes fade and slide 8px on their reference entering view.
5. Links transition `text-decoration-thickness`, `text-underline-offset`, and colour to accent.
6. Registration marks draw in at figure entry.

Nothing else. No hover scale, no glow, no parallax, no tilt, no cursor, no counters counting up.

Durations 180–450ms, `cubic-bezier(0.2, 0, 0, 1)`. Under `prefers-reduced-motion`, everything resolves instantly to final state.

---

## 3. BANNED OUTRIGHT

Every item is a recognised slop signature. Violating any means the section is redone.

1. Particle networks, neural-net backgrounds, constellations, "AI wallpaper" of any kind
2. Glassmorphism, `backdrop-blur`, translucent cards
3. Glow, neon, decorative `box-shadow`, drop shadows
4. Cyan, violet, or any two-colour neon gradient
5. Gradient-filled text
6. Bento grids
7. Custom cursors
8. 3D tilt / perspective cards
9. Terminal boot loaders, fake compilation sequences, typewriter effects
10. Orbital, radar, or constellation skill visualisations
11. Inter, Space Grotesk, Poppins, Montserrat
12. Emoji as iconography
13. `rounded-2xl` card grids
14. Blue-black grounds, pure `#000000` grounds, pure `#FFFFFF` text
15. Marquees, beams, spotlights, animated borders, aurora, meteors, sparkles
16. Any loading ceremony — the page loads instantly, and that restraint *is* the statement
17. Progress bars for skill proficiency
18. Stock illustrations, 3D blobs, isometric graphics
19. Testimonials nobody gave
20. "Let's build something amazing together" or any variant of that sentence

---

## 4. COMPONENT REGISTRIES (21st.dev AND SIMILAR)

Permitted with a hard rule, because misusing them recreates exactly the problem being fixed.

**Allowed:** structural and interaction primitives with no inherent look — dialog, popover, tooltip, scroll area, tabs, table primitives, form controls, scroll-reveal behaviour. Install via the shadcn CLI, then **strip every style to zero and rebuild against §2.** If a component still resembles its registry listing, the work isn't done.

**Banned:** anything shipping its own aesthetic — gradient cards, glow buttons, beams, spotlights, animated borders, particle backgrounds, "AI"-themed components, bento layouts, 3D cards, text shimmer. These appear on thousands of sites; using them unmodified is precisely how a site becomes indistinguishable from the last one someone saw.

**Borrow behaviour. Never appearance.**

---

## 5. DOCUMENT STRUCTURE

One page, numbered sections, with a persistent margin table of contents that tracks scroll position.

### Masthead
Set as a spec-sheet header, not a hero. **No image, no CTA row, no scroll hint.** Real content sits above the fold.

```
YASH GURJAR                                        REV 3.0 · 2026-08
────────────────────────────────────────────────────────────────────
AI & ML ENGINEER              JECRC UNIVERSITY · JAIPUR, IN
                              AVAILABLE FROM 2027 · REMOTE
```

Name in Archivo Expanded 700. Everything else mono, 11px, uppercase, `--ink-3`. One hairline. Registration ticks at the page corners.

### Summary
Three or four sentences in first person, 18px, capped at 68ch. **Not a bio** — a positioning statement. What he builds, what he's after, what he's looking for next. This paragraph is the highest-leverage text on the entire site; write it last, when the rest of the document has told you what it should say.

### 01 / SELECTED WORK
The core of the document. Each project is a **numbered entry, not a card**:

- Index `[1]`, title, and primary languages on one rule-terminated line
- Two-sentence description at measure
- **Spec table** in mono with tabular figures — architecture, dataset, hardware, throughput, metrics. Labels in `--ink-3`, values in `--ink`, units smaller.
- **Figures** with registration marks, continuous numbering, and captions in the margin that *interpret* rather than label: `FIG. 2 — Validation accuracy across 60 epochs. Plateau from ~48; the remaining gain is noise.`
- **`LIMITATIONS`** — a required field, verbatim from the repo. This is the single most credible element on the site. A portfolio that states its own failure modes was unmistakably written by a practitioner.
- Links as mono, arrow-prefixed, underline on hover

Featured order: **tokenizer · object detection + segmentation · local RAG**, then the rest.

### 02 / METHODS
Skills as a dense typographic table grouped by category. No badges, no pills, no bars, no orbits.

```
LANGUAGES         Python · Rust · TypeScript · C++ · JavaScript
FRAMEWORKS        PyTorch · TensorFlow · scikit-learn · React · Next.js
INFRASTRUCTURE    Docker · Google Cloud · CUDA / cuDNN · MySQL
TOOLING           Git · Figma · Matplotlib
```

Reference material, not a showcase. Keep it quiet and let it be short.

### 03 / BACKGROUND
Education and trajectory as a compact rule-separated table. Degree, institution, dates, one line of note. No progress bars, no icons, no timeline graphics.

### 04 / NOTES
**New section — see §8.1.** Short technical write-ups. Even two or three change the site's character completely.

### 05 / CORRESPONDENCE
A short line, then a plainly set form: name, email, message. Hairline-underlined inputs on `--plane-1`, mono labels, accent focus ring, mono submit button.

Backend: **Resend + Next.js Route Handler** at `app/api/contact/route.ts`. Server-side zod re-validation, in-memory rate limit (3 per 10 min per IP), honeypot field, `replyTo` set to sender. Never leak the key or a stack trace.

Direct contact facts below the form as a mono block — some people will not use a form, and forcing them to is a lost conversation.

### NOTES & REFERENCES
Footnotes collected at the bottom, numbered, mono marks, linking back to their in-text references.

### COLOPHON
The footer, and a detail people remember:

```
COLOPHON
Set in Archivo and IBM Plex Mono. Built with Next.js, deployed on
Vercel. Figures rendered as inline SVG from measured data. No
analytics beyond page counts. Source on GitHub.

LAST REVISED 2026-08-07 · REV 3.0        [ CITE ]  [ PRINT ]  [ ↑ ]
```

Colophons are a print convention and virtually nonexistent on the web. It costs nothing and signals that a person who cares about documents made this.

---

## 6. CONTENT & GROUND TRUTH

**Do not re-research this. Do not invent anything.** The previous build's `src/data/config.ts` at commit `33b0a6d` holds GitHub-API-verified project data, README-sourced metrics, and approved limitations lines. That work is **fact, not design** — port it forward. Restructure the types for the new document model; every number survives unchanged.

Rules that carry over:

- Every metric traces to a repo README or code. If unverifiable, **omit the field** — never estimate.
- **ResNet18's F1 of 98.62% stays excluded.** It is arithmetically impossible from its own precision and recall.
- Star and fork counts are all zero — **omit them entirely** rather than printing zeros.
- Seven projects: tokenizer · object detection + segmentation · local RAG · ResNet18-CIFAR10 · Computer-Vision (described honestly as integration work around pretrained models) · Sorting_Visualizer · this website.
- Canonical links: `github.com/Yash4616` · `linkedin.com/in/yashgurjar9` · `x.com/Yash_9724` · `yashgurjar9714@gmail.com` · `https://www.yash.systems`

**Zero hardcoded user-facing content in components.** Everything in `src/data/config.ts`, fully typed, no `any`. Validate the config with a **zod schema at build time** so a malformed entry fails the build instead of shipping.

**Still needed from Yash** — build components that degrade cleanly when absent:

- ResNet18 confusion matrix: a 10×10 `number[][]` from running eval on the saved model.
- Training curves: downsampled loss / val-accuracy arrays, ≤48 points each, from training logs.

---

## 7. SIGNATURE DETAILS

Small, cheap, disproportionately memorable. Build all of them.

1. **Registration marks** — L-shaped corner ticks on figures and page corners. The single most distinctive element in the system.
2. **Margin table of contents** — persistent, `IntersectionObserver`-driven, accent-marks the current section. How a long document behaves.
3. **Interpretive figure captions** — captions that say what the figure *means*, not what it is.
4. **Sidenotes** — outer-track asides keyed by superscript numerals.
5. **Cite button** — copies a real BibTeX entry:
   ```bibtex
   @misc{gurjar2026,
     author = {Gurjar, Yash},
     title  = {Yash Gurjar — AI \& ML Engineer},
     year   = {2026},
     url    = {https://www.yash.systems}
   }
   ```
   Nobody has this. It is funny and completely sincere at once.
6. **Print stylesheet** — a real `@media print` block: inverts to ink-on-paper, sidenotes become true footnotes, links expand to show URLs, figures stay legible, navigation drops away. A document you can actually print.
7. **`/llms.txt`** — a route generated from `siteConfig` returning clean plain text, for the growing share of first-pass screening done by an LLM. Linked via `<link rel="alternate" type="text/plain">`.
8. **Keyboard navigation** — `j`/`k` between sections, `g` then `h` to top. Undocumented except in the colophon.
9. **Real revision line** — `LAST REVISED <date>`, generated at build.
10. **On-brand 404** — set as an error code in the document's own language, with a link back. Not a joke, not an illustration.

---

## 8. WHAT'S MISSING FROM YOUR PORTFOLIO STRATEGY

You asked what you might be overlooking. These are not design items — several matter more than the design does.

### 8.1 Writing. This is the biggest gap.

**A portfolio of seven repos and no prose reads as a list. Two or three short technical write-ups change what kind of person the reader thinks you are.** They demonstrate the thing employers actually screen for — can you explain a decision — and they're the only part of the site that earns organic search traffic.

Suggested first three, each 800–1500 words:

- **"Training a 262k-vocab BPE tokenizer in Rust"** — why Rust, what the corpus filtering discarded and why, how parity was verified. You already did this work; the post is transcription, not new effort.
- **"What my CIFAR-10 confusion matrix actually says"** — cat↔dog confusion at 32×32, why texture cues dominate, what you'd change. Short, specific, and it turns a weak number into evidence of insight.
- **"Retrieval that runs on 6 GB of VRAM"** — the dense→BM25→RRF→rerank pipeline, why each stage exists, what the recall numbers cost.

Add `05 / NOTES` as a section, with per-post routes at `/notes/[slug]`, MDX, and proper `Article` JSON-LD.

### 8.2 Depth on one project beats breadth across seven

Seven shallow entries are worth less than one deep case study plus six short ones. Pick **tokenizer** — it's the rarest work — and give it a full `/projects/tokenizer` page: the problem, the approaches you rejected, what broke, the measurements, what you'd do differently. That single page is what gets forwarded internally.

### 8.3 State what you want

Nowhere does the site say what Yash is looking for. A recruiter who can't tell whether you want a 2027 new-grad role, a research internship, or freelance work will move on rather than guess. **One line in the masthead:** `AVAILABLE FROM 2027 · RESEARCH OR APPLIED ML · REMOTE OR JAIPUR`. Adjust to the truth.

### 8.4 Email on your own domain

You own `yash.systems` and are sending people to `yashgurjar9714@gmail.com`. `yash@yash.systems` costs almost nothing to set up and is a real professionalism signal — and since Resend is already in the stack for the contact form, domain verification is largely the same work.

### 8.5 The GitHub profile is half the impression

Anyone who reads the site clicks through to `github.com/Yash4616`. The profile README should carry the same positioning as the masthead, and repos should be pinned in the same featured order. **A polished site next to an empty profile reads as a website, not an engineer.** Also fix the ResNet18 README F1 error at the source — an impossible number in your own repo is worse than one on your site.

### 8.6 Résumé parity

The PDF and the site must state the same facts, the same dates, the same project names. Recruiters cross-check, and a mismatch reads as carelessness. Regenerate the PDF from `config.ts` if practical, so drift is impossible.

### 8.7 Per-project OG images

Project pages get shared as individual links. Each needs its own `opengraph-image.tsx` rendering title, one metric, and the wordmark. Generic OG on a shared project link wastes the share.

### 8.8 Build-time link checking

A dead GitHub link on a portfolio is a small disaster and completely preventable. Add a script that resolves every URL in `config.ts` and fails the build on a non-200. Run it in the gate.

### 8.9 Accessibility as a differentiator, not a chore

An ML engineer whose site is flawlessly keyboard-navigable and screen-reader-clean is signalling rigour. Hold it to **Lighthouse 100 and zero axe violations**, and mention it in the colophon. Almost no portfolio can claim that.

### 8.10 Know what people read

Vercel Analytics or Plausible — page views and referrers only, nothing invasive, disclosed in the colophon. Without it you're guessing about which project to deepen next.

---

## 9. TECHNICAL SPEC

- **Next.js 15**, App Router, TypeScript strict. Zero `any`, zero `@ts-ignore`.
- **RSC by default.** `"use client"` only at interactive leaves. Most of this document is static and should ship no JS at all.
- **Tailwind**, all tokens from §2.1 in `globals.css`, mapped in config. No arbitrary values where a token exists.
- **No WebGL. No Three.js. No OGL. No canvas.** Every figure is inline SVG generated from data.
- **Framer Motion** only where native CSS scroll-driven animation can't reach.
- **Routes:** `/` · `/projects/[slug]` (static, `generateStaticParams`, per-page metadata + `SoftwareSourceCode` JSON-LD + own OG image) · `/notes` and `/notes/[slug]` (MDX, `Article` JSON-LD) · `/llms.txt` · `/api/contact` · `robots.ts` · `sitemap.ts` · `not-found.tsx`
- **Fonts** via `next/font/google`, preloaded, `display: "swap"`.
- **OG image** via `next/og` `ImageResponse` from `siteConfig` — set in Archivo on `--ground`, matching the site.
- **Config validated by zod at build.** Malformed content fails the build.
- **Security headers** — CSP, `X-Content-Type-Options`, `Referrer-Policy`. Add Resend to `connect-src`.

### Budgets — strict, because this direction is cheap

| Metric | Target |
|---|---|
| First Load JS (gzipped) | **< 110 KB** |
| Lighthouse Performance | **100** |
| Lighthouse Accessibility | **100** |
| Lighthouse Best Practices | **100** |
| Lighthouse SEO | **100** |
| LCP | < 1.2 s |
| CLS | **0** |

No 3D, no loader, almost no client JS — these are achievable. If you're over, find out why before continuing.

---

## 10. ACCESSIBILITY

Easier in this direction than the last, so hold it higher.

- Semantic structure: one `<h1>`, `<section aria-labelledby>` per section, `<article>` per project and note, real `<table>` for tabular data, `<figure>` / `<figcaption>` for every figure.
- Every figure carries a text alternative stating **what it shows**, not that it exists. `"Validation accuracy rises steeply through epoch 20, then plateaus near 88% from epoch 48."`
- **Verify contrast on the dark ground before shipping.** `--ink-3` (`#8A857C`) sits near the 4.5:1 line — measure it, and darken the ground or lighten the ink until it clears. Do not ship an untested value.
- Support `prefers-contrast: more` by raising `--ink-2` / `--ink-3` and `--rule` to `--rule-strong`.
- Full keyboard pass: visible accent focus rings, logical order, no traps, skip-to-content link.
- Sidenotes readable in source order by a screen reader.
- `prefers-reduced-motion` honoured everywhere; verify by launching Chrome with `--force-prefers-reduced-motion=reduce`.

---

## 11. BUILD ORDER & GATES

One stage at a time. Run the gate after each and paste real output. Do not begin the next stage without approval.

| Stage | Deliverable |
|---|---|
| **1** | Fresh scaffold. Fonts, colour tokens, three-track grid, grain tile, registration-mark component, `config.ts` ported from `33b0a6d` + zod schema, types. **Ends with a typographic specimen page.** |
| **2** | Page shell: masthead, summary, margin TOC, section-header pattern, sidenote system, footnote system. |
| **3** | `01 / SELECTED WORK` — project entries, spec tables, `/projects/[slug]` pages with per-page OG. No figures yet. |
| **4** | Figure system — SVG curve, bar, and matrix components with registration marks, continuous numbering, interpretive captions, scroll-draw, clean degradation when data is absent. Wire into `01 /`. |
| **5** | `02 / METHODS`, `03 / BACKGROUND`. |
| **6** | `04 / NOTES` — MDX pipeline, `/notes/[slug]`, `Article` JSON-LD. Ship with placeholder frontmatter if posts aren't written yet; the *system* is the deliverable. |
| **7** | `05 / CORRESPONDENCE` + Resend route handler + rate limit + honeypot. |
| **8** | Notes & references, colophon, cite button, print stylesheet, `/llms.txt`, keyboard nav, 404, sitemap, robots, root OG image. |
| **9** | Performance, accessibility, SEO, cross-browser, mobile at 375px, link checker. Meet every §9 budget. |

**Gate after every stage:**

```bash
npx tsc --noEmit      # zero errors
npm run lint          # zero errors
npm run build         # succeeds; report First Load JS
npm run check:links   # every URL in config.ts resolves 200
npm run dev           # zero console errors or warnings
```

Plus: renders at 375px, keyboard-navigable with visible focus, zero layout shift, zero hardcoded user-facing strings.

> **Stage 1 carries an extra gate.** The typographic specimen must be reviewed and approved before any content is built on it. Type, colour, and grid *are* the aesthetic here — if they're wrong, everything built on top is wrong, and discovering that at Stage 6 is expensive. The specimen must show: the full type scale, the 68ch measure, both rule weights, tabular figures in a spec table, the sidenote track, a section header, registration marks, and the grain at real opacity.

---

## 12. DEFINITION OF DONE

1. It reads as a document someone **typeset**, not a page someone styled.
2. Nothing on it appears on the §3 banned list.
3. Every number is real and traceable to a repository.
4. The loss curves, confusion matrices, and spec tables **are** the visual interest — no decorative element is carrying the design.
5. At least the `NOTES` system ships, even if the posts follow.
6. It states plainly what Yash is looking for.
7. It prints cleanly.
8. Lighthouse 100 across all four categories, under 110 KB of JS, zero axe violations.
9. Yash can add a project or a note by editing one file.
10. **The test:** show it to a working ML engineer for thirty seconds. *"Nice site"* is a failure. *"Who set this?"* or *"is that your actual confusion matrix?"* is the target.