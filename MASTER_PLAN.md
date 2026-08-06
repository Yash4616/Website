# MASTER PLAN — yash.systems Rebuild

> **Repo:** `C:\Dev\Build\Website`
> **Live:** https://www.yash.systems
> **Owner:** Yash Gurjar — AI & ML Engineer, JECRC University (2023–2027), Jaipur
> **Status:** Single source of truth. Supersedes all prior prompts, plans, and drafts.
> **Version:** 3.1 — Final, conflict-resolved, execution-ready

---

## AMENDMENT LOG

Amendments are owner-approved changes to this document made during execution. They carry the
same authority as the original text. Each one is applied inline in the section named.

### v3.1 — 2026-08-06 (approved at the Stage 1 pre-flight audit)

| # | Section(s) amended | Change | Rationale |
|---|---|---|---|
| A1 | §3.2 | Tailwind stays at **3.3.3**. Tokens in `:root`, mapped in `tailwind.config.ts`. No v4 migration. | The repo runs v3 with a custom fluid-type scale and ~60 shadcn components. §4.1 already permitted the `:root` path. A v4 migration is churn with no user-visible gain. |
| A2 | §3.1, §7/Stage 1, §9.4 | Stay on **React 18.2 + Next 15.5.15 stable**. **`experimental.ppr` is dropped.** Every other §9.4 item stands. | PPR is Next-canary-only and requires React 19. Shipping a portfolio off canary is a bad trade for one streaming optimization. |
| A3 | §6.1, §6.2 | Delete `/about`, `/contact`, `/projects` (index) — they duplicate the single-page anchors. **Keep `/projects/[slug]`**, rewired to `config.ts` via `generateStaticParams()`. | Per-project permalinks are shareable and give real SEO surface for the cost of one `generateStaticParams`. |
| A4 | §6.1, §7/Stage 6, §8.1/S1 | The model card is built once as `src/components/features/model-card.tsx` and rendered on **two surfaces**: the Stage 6 dialog and the `/projects/[slug]` page. | One component, one source of truth. Prevents the dialog and the permalink page from drifting. |
| A5 | §8.1/S5 (partial), §7/Stage 1 | Per-slug `metadata` + `SoftwareSourceCode` JSON-LD land **early**, with the slug page. | S5's JSON-LD half is free once the slug route exists. `/llms.txt` still lands in Stage 8. |
| A6 | D2, §6.2 | **Remove `lenis`** — delete `src/lib/useLenis.ts`, unwire from `ClientWrapper`, uninstall. Native smooth scroll only. | Not a bundle argument: lenis hijacks native scroll, which fights `content-visibility: auto` (§9.3) and makes the native `animation-timeline: view()` path (§8.1/S7) unusable. |
| A7 | D9, §6.2 | **Remove `next-themes`** — delete `ui/theme-toggle.tsx` and `providers/theme-provider.tsx`, put `className="dark"` directly on `<html>`. | Dark-only is locked; a theme runtime for a site with one theme is dead weight. **See the Stage 1 report for the `ui/sonner.tsx` blocker.** |
| A8 | §6.1 | `next.config.js` → **`next.config.ts`**, with the analyzer folded in behind `ANALYZE=true` and the existing CSP block preserved verbatim. | One config file, typed. |
| A9 | §6.1 | The navbar file is **`layout/Navigation.tsx`**, not `Navbar.tsx`. | D10 wins — keep the existing structure. |
| A10 | §3.1 | `tsconfig.json` target → **ES2020**. | `es5` downlevelling inflates output and fights typed-array/iterator code in the OGL loops. |
| A11 | §5.3, §11.2, sitemap | Canonical origin is **`https://www.yash.systems`** everywhere. | One origin, no redirect hop, no split SEO signal. |
| A12 | §7/Stage 1, §7/Stage 8 | **`app/opengraph-image.tsx` moves to Stage 1** (generated from `siteConfig` via `next/og`). Removed from Stage 8. | `layout.tsx` already advertises `/og-image.png`, which **404s today**. `siteConfig` lands in Stage 1, so the generator can too — closing a live bug instead of carrying it through eight stages. |
| A13 | §7/Stage 6 | The star/fork row is **hidden per card when `stars === 0 && forks === 0`.** | Every eligible repo currently has 0/0. Rendering "⭐ 0" on every card reads worse than rendering nothing. |
| A14 | §5.5 | **Rust** added to Orbit 2 (Advanced). Skill total 23 → **24**; §7/Stage 5 gate updated. | The tokenizer's engine is Rust. Omitting it understated the roster. |
| A15 | D8, project data | ResNet18's README F1 of **98.62 % is arithmetically impossible** from its own Precision 91.16 % / Recall 85.35 % (true F1 ≈ 88.16 %). **F1 is omitted**; Accuracy / Precision / Recall / Loss are published. | D8 and AP-12. A number a recruiter can disprove with a calculator is worse than no number. |
| A16 | §7/Stage 6 | **Featured three: `tokenizer`, `Object_Detection_Semantic_Segmentation`, `Rag`.** ResNet18 stays in the grid (with its confusion matrix) but is **not** featured. | ResNet18-on-CIFAR-10 is the most common student project there is, and 88.22 % sits below the ~94–95 % ResNet18 baseline — featuring it invites that comparison. A Rust BPE tokenizer at parity with `o200k_base` and a local RAG with real recall@k are work most students never attempt. Lead with the rare thing. |

---

## CONTENTS

| § | Section | Read when |
|---|---|---|
| 0 | How to use this document | First, always |
| 1 | **Locked decisions** | First, always |
| 2 | Mission & design philosophy | Before Stage 1 |
| 3 | Tech stack constraints | Before Stage 1 |
| 4 | Design system — "Neural Dark" | Before Stage 1 |
| 5 | Data layer + canonical facts | Before Stage 1 |
| 6 | File structure | Before Stage 1 |
| 7 | **Phase 1 build — Stages 1–8** | The main event |
| 8 | **Signature differentiators** | Before Stages 6, 7, 8 |
| 9 | **Performance engineering** | Before Stage 1; re-read at Stage 8 |
| 10 | Phase 2 — legendary extras | After Phase 1 deploys |
| 11 | Performance / SEO / a11y targets | Stage 1 and Stage 8 |
| 12 | Mobile matrix | Every stage |
| 13 | Quality gates | End of every stage |
| 14 | **Anti-patterns** | First, always |
| 15 | Success criteria | The definition of done |

---

## 0. HOW TO USE THIS DOCUMENT

Save this file at the repo root as `MASTER_PLAN.md`. Then drive the build one stage at a time:

```
Read MASTER_PLAN.md in full. Confirm you understand §1 (Locked Decisions)
and §14 (Anti-Patterns) by listing them back to me in one line each.
Then execute STAGE 1 only. Stop at the Stage 1 quality gate and report.
```

After each stage passes its gate:

```
Stage N passed. Execute STAGE N+1 only. Re-read §1 and §14 first.
Stop at the gate and report.
```

**Rules of engagement for the agent:**

1. Execute **one stage at a time**. Never start a stage before the previous stage's quality gate is green.
2. After every stage, run the gate commands in §13.1 and paste the real output. Do not claim a gate passed without running it.
3. If a spec in this document conflicts with something you find in the codebase, **stop and ask**. Do not silently improvise.
4. If something in this document is genuinely impossible or a bad idea, say so before building it. Do not build it badly and move on.
5. Never delete a file that isn't explicitly listed for deletion in §6.3.
6. Commit at each stage boundary with a message `feat(stage-N): <summary>`.

---

## 1. LOCKED DECISIONS — DO NOT RE-LITIGATE

These resolve every conflict across the earlier drafts. They are final.

| # | Decision | Locked Choice | Rationale |
|---|----------|---------------|-----------|
| D1 | **WebGL engine** | **OGL only.** Already installed (~15 KB), already powers the existing Aurora. | Three.js + R3F + drei + postprocessing is 150 KB+ gzipped and would blow the <300 KB JS budget and the Lighthouse ≥90 target. Every "R3F" reference in earlier drafts is **void** — see §7 for OGL recipes. |
| D2 | **Do NOT install** | `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`, `locomotive-scroll`, `lenis`. | Bundle discipline. Bloom is faked in a shader; smooth scroll is `scroll-behavior: smooth`. |
| D3 | **Sans font** | **Keep Inter** (already configured via `next/font/google`). | Zero churn, already loaded, excellent at display sizes. "Geist Sans" in earlier drafts is void. |
| D4 | **Mono font** | **Add JetBrains Mono** via `next/font/google`, exposed as `--font-mono`. | Better readability at 12–14px than Geist Mono; critical for the loader and terminal, which are the two highest-stakes surfaces. |
| D5 | **Scope** | **Phase 1 = Stages 1–8** (§7) **+ the Tier-1 differentiators in §8.1**, which are folded into those stages. **Phase 2 = §10**, only after Phase 1 ships and deploys clean. | Building everything in one pass guarantees a broken mid-state. But the §8.1 items are cheap and are the actual differentiation — they are not optional extras. |
| D6 | **Contact backend** | **Resend + Next.js Route Handler** at `app/api/contact/route.ts`. | Free tier, real delivery to `yashgurjar9714@gmail.com`, and full control over the terminal submission animation. `mailto:` and Formspree are void. |
| D7 | **Project data** | Fetched from the **real GitHub API at build-plan time** (Stage 1, Step 0). Never invent repos, stars, or forks. | Earlier drafts disagreed on 3 vs 7 projects. Ground truth wins. |
| D8 | **ML metrics** | Only include `metrics` for a project if the number is **verifiable from that repo's README or code**. Otherwise `metrics: null`. | Fabricated accuracy figures on a portfolio are a credibility bomb. A recruiter will check. |
| D9 | **Theme** | Dark mode only. No toggle. No `light:` variants. | Design intent. |
| D10 | **Component paths** | Keep the **existing** structure (`src/components/sections/`, `src/components/features/`, `src/components/layout/`). | The idealized tree in the older draft would mean renaming every file for no benefit. See §6 for the real tree. |

---

## 2. MISSION & DESIGN PHILOSOPHY

### 2.1 The one-sentence brief

Rebuild the portfolio so that a stranger who lands on it for eight seconds walks away thinking *"this person builds systems, not websites."*

### 2.2 Persona for the agent

You are a **Staff Frontend Architect** who has shipped Awwwards Site of the Day work, combined with a **dark-UI product designer** who thinks in dashboards and telemetry, plus a **real-time graphics engineer** comfortable writing raw GLSL. You know Next.js 15 App Router internals cold, you write Framer Motion like a native language, and you profile before you ship.

### 2.3 Aesthetic north star

- **Mission control, not portfolio.** Think the deck of a spacecraft, a model-training dashboard at 3am, the UI language of *Westworld* and *Minority Report* — translated to the web.
- **Alive, never static.** Something is always subtly in motion: particles drifting, an orbit rotating, a cursor breathing, a progress bar filling.
- **Restraint is what makes it expensive.** Two accent colours. Glow only on hover. Grain, not gradients-everywhere. The difference between "cutting-edge" and "tacky" is knowing when to stop.
- **Technical honesty.** Real metrics, real repos, real architecture names. The credibility comes from specificity.

### 2.4 What we are fixing

| Problem | Current | Target |
|---|---|---|
| Hero is flat | Static text + gradient blob | Full-viewport OGL neural particle field with mouse attraction and parallax |
| About is a text wall | 3 paragraphs + side photo | Asymmetric bento grid with a live globe and cycling strengths |
| Skills are boring | Tabbed list + badges | Orbital tech radar, three proficiency orbits, hover tooltips |
| Projects lack impact | Basic cards + tags | 3D tilt cards with architecture, ML metrics, live star counts |
| Contact is generic | Two info cards, no form | Interactive terminal CLI form that actually sends mail |
| No arrival moment | Instant, ceremony-free load | AI boot-up compilation sequence with split-reveal exit |
| No cursor personality | OS default | Dual-element magnetic cursor |
| Data is hardcoded | Strings inside components | Everything in `src/data/config.ts` |
| No depth | Flat glassmorphism | Noise grain, vignette, scan lines, layered z |

---

## 3. TECH STACK — HARD CONSTRAINTS

### 3.1 Framework

- **Next.js 15.5.15 stable (App Router) on React 18.2.** *(A2)* Not canary, not React 19 —
  which means **`experimental.ppr` is off the table** and is dropped from the Stage 1
  deliverables. Every other §9.4 delivery optimization still applies.
- **`tsconfig.json` targets ES2020.** *(A10)*
- **Server Components by default.** Add `"use client"` *only* when the file needs: browser APIs (`window`, `document`, `navigator`), React hooks, event handlers, Framer Motion, or a WebGL canvas.
- Push `"use client"` to the **leaves**. A section wrapper should stay a Server Component and render a client child, not the other way round.
- **TypeScript strict.** Zero `any`. Zero `@ts-ignore`. If you need an escape hatch, use `unknown` + a type guard.

### 3.2 Styling

- **Tailwind CSS 3.3.3** *(A2 — v4 migration explicitly rejected)* with `tailwind-merge` + `clsx` via the existing `cn()` helper in `src/lib/utils.ts`.
- Every design token is declared as a CSS custom property under `:root` in `globals.css` and mapped in `tailwind.config.ts`. **No arbitrary values inline** when a token exists. There is no `@theme` block — that is v4 syntax.
- Inline `style` is permitted **only** for values coming from `useMotionValue` / `useTransform`.

### 3.3 Components

- **shadcn/ui** (Radix primitives) for anything with real accessibility semantics: Tooltip, Dialog, Popover. Restyle to the design system — do not ship default shadcn look.
- Everything bespoke (tilt card, orbit system, terminal, loader, cursor) is hand-built.

### 3.4 Animation

**Framer Motion v11+.** Define these in `src/lib/motion.ts` and import them everywhere — no ad-hoc spring numbers scattered through the codebase:

```ts
export const SPRING_SMOOTH = { type: "spring", stiffness: 100, damping: 30 } as const;
export const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 40 } as const;
export const SPRING_GENTLE = { type: "spring", stiffness:  50, damping: 20 } as const;
export const SPRING_CURSOR_DOT  = { type: "spring", stiffness: 1000, damping: 50 } as const;
export const SPRING_CURSOR_RING = { type: "spring", stiffness:  200, damping: 30 } as const;

export const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: SPRING_SMOOTH },
};

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const VIEWPORT = { once: true, margin: "-100px" } as const;
```

**Never use linear easing.** Spring physics or a custom cubic-bezier only. Duration range 300–800 ms.

### 3.5 WebGL — OGL only

- Every canvas component is loaded via `next/dynamic` with `{ ssr: false }` and wrapped in `<Suspense>` with a styled skeleton.
- Cap DPR: `Math.min(window.devicePixelRatio, 1.5)`.
- **Pause when off-screen.** Every canvas uses an `IntersectionObserver`; when not intersecting, `cancelAnimationFrame` and stop.
- **Clean up.** Every `useEffect` returns a teardown that cancels the RAF, removes listeners, and calls `gl.getExtension('WEBGL_lose_context')?.loseContext()`.
- Every canvas is `aria-hidden="true"` with an `sr-only` sibling describing it.
- Respect `prefers-reduced-motion`: render a single static frame instead of animating.

### 3.6 Icons & type

- **Lucide React** for UI icons.
- **Inline SVG paths** for tech logos (Python, TensorFlow, PyTorch, React, Docker…). Store them as React components in `src/components/icons/`. Do **not** pull in a logo package.
- Fonts via `next/font/google` with `display: "swap"`, `subsets: ["latin"]`, exposed as `--font-sans` and `--font-mono`.

---

## 4. DESIGN SYSTEM — "NEURAL DARK"

### 4.1 Tokens

Declare in `globals.css` under `@theme` (Tailwind v4) or `:root`, then map in `tailwind.config.ts`.

```css
:root {
  /* Surfaces */
  --bg-void:      #030303;  /* body, loader */
  --bg-primary:   #050505;  /* main sections */
  --bg-elevated:  #0A0A0A;  /* cards, terminal */
  --bg-surface:   #111111;  /* inputs, inner wells */
  --bg-overlay:   rgba(255,255,255,0.03);

  /* Text */
  --text-primary:   #FAFAFA;
  --text-secondary: #A0A0A0;
  --text-muted:     #555555;
  --text-inverse:   #050505;

  /* Accents */
  --accent-cyan:   #00F0FF;
  --accent-violet: #8A2BE2;
  --accent-amber:  #FFB800;  /* proficient tier only */

  /* Borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default:rgba(255,255,255,0.10);
  --border-hover:  rgba(255,255,255,0.20);
  --border-accent: rgba(0,240,255,0.30);

  /* Composites */
  --glow-cyan:   0 0 20px rgba(0,240,255,0.40), 0 0 60px rgba(0,240,255,0.10);
  --glow-violet: 0 0 20px rgba(138,43,226,0.40), 0 0 60px rgba(138,43,226,0.10);
  --gradient-accent: linear-gradient(135deg, #00F0FF, #8A2BE2);
}
```

**Accent discipline:** cyan is the primary — links, focus rings, primary CTA, terminal text. Violet is strictly secondary — gradient endpoints, the "Advanced" tier, hover accents. Amber appears only on "Proficient" skill badges. No fourth colour anywhere.

### 4.2 Texture & depth

**Noise grain** — `::before` on `<body>`. Use the SVG below to *generate* the texture, then **bake it to a tiled 128×128 PNG** and reference that instead — a full-viewport `feTurbulence` is expensive to rasterize on every paint (§9.1, item 3):

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**Vignette** — `::after` on `<body>`, `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)`, `pointer-events: none`, `z-index: 1`.

**Utilities to define in `globals.css`:**

- `.dot-grid` — `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)` at `24px 24px`.
- `.line-grid` — crossed linear gradients at `40px`, 5 % opacity. Used behind the About bio card.
- `.scan-lines` — `repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px)` at `opacity: 0.02`. Terminal and loader only.
- `.glass` — `backdrop-blur-md bg-white/[0.03] border border-white/[0.08] rounded-2xl`.

**Glow rule:** glow appears on **hover and focus only**. Never on a resting element. The one exception is the Skills centre node, which pulses gently — that's the point of it.

### 4.3 Layout

- Max content width **1400 px**, padding `px-6` mobile / `px-8` desktop.
- Major section spacing `py-32`; sub-sections `py-20`.
- Radii: cards `rounded-2xl` (16px), inner elements `rounded-xl` (12px), pills/badges `rounded-full`.
- **Never a uniform vertical list for a content section.** Bento, orbit, or grid.

### 4.4 Section header pattern (used by every section)

```
01 — ABOUT            ← mono, cyan, text-xs, uppercase, tracking-[0.3em]
About Me              ← Inter, text-4xl md:text-5xl, font-bold, --text-primary
A CS student from…    ← text-lg, --text-secondary, max-w-2xl
```

Build this once as `src/components/ui/section-header.tsx` with props `{ index, label, title, subtitle }`. Every section imports it. Numbers: `01 ABOUT`, `02 SKILLS`, `03 PROJECTS`, `04 CONTACT`.

### 4.5 Motion principles

- Entrances: `whileInView` + `staggerContainer` / `fadeUp`, `viewport={VIEWPORT}`.
- Every interactive element gets a distinct hover state — scale, glow, border shift, or background change. No exceptions.
- Parallax on hero background and section headers via `useScroll` + `useTransform`.
- **`prefers-reduced-motion`:** build `useReducedMotion` (Framer Motion's own hook) into a `useMotionSafe()` wrapper. When reduced, animations resolve instantly to their final state, particles render one static frame, orbits stop rotating, the loader shortens to 600 ms.

---

## 5. DATA LAYER — ZERO HARDCODED CONTENT

### 5.1 The rule

**No user-facing string, URL, number, or array literal may live inside a component file.** Every one comes from `src/data/config.ts`. The test: Yash should be able to add a project, change his bio, or swap a social link by editing exactly one file, never touching animation or WebGL code.

Permitted exceptions: `aria-label` text, `alt` text, and purely structural strings (CSS class names, HTML). Everything a visitor reads comes from config.

### 5.2 Types — `src/types/index.ts`

```ts
export type Proficiency = "Expert" | "Advanced" | "Proficient";
export type SkillCategory = "Language" | "Framework" | "Tool" | "Cloud" | "Soft Skill";
export type ProjectCategory = "machine-learning" | "computer-vision" | "nlp" | "web-development";

export interface SkillNode {
  name: string;
  category: SkillCategory;
  level: Proficiency;
  orbit: 1 | 2 | 3;          // 1 = inner/Expert, 2 = middle/Advanced, 3 = outer/Proficient
  icon: string;               // key into the icon registry
  blurb: string;              // one line shown in the hover tooltip
}

export interface ProjectMetric { label: string; value: string; }

export interface Project {
  id: string;
  title: string;
  description: string;          // 2–3 lines max
  category: ProjectCategory;
  tags: string[];
  stack: string[];
  architecture: string | null;  // e.g. "ResNet-18"
  metrics: ProjectMetric[] | null;  // null for non-ML; never fabricate — see D8
  language: string | null;      // primary GitHub language
  stars: number;
  forks: number;
  featured: boolean;
  links: { github: string; demo?: string };
  image: string | null;
}

export interface LoaderStep { at: number; text: string; progress?: number; done?: boolean; }
export interface Strength { title: string; description: string; icon: string; }
export interface Education {
  degree: string; institution: string; start: number; end: number; note?: string;
}
export interface ContactInfo { email: string; location: string; availability: string; }
export interface SocialLink { label: string; href: string; icon: string; }

export interface SiteConfig {
  meta: { title: string; description: string; keywords: string[]; url: string; ogImage: string };
  hero: {
    name: string; title: string; typewriterPrefix: string; typewriterWords: string[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    scrollHint: string;
  };
  about: { bio: string[]; avatar: string; education: Education[]; strengths: Strength[];
           location: { label: string; sub: string; lat: number; lng: number } };
  skills: SkillNode[];
  projects: Project[];
  contact: ContactInfo;
  social: SocialLink[];
  loader: LoaderStep[];
  footer: { tagline: string; copyright: string; quickLinks: { label: string; href: string }[] };
  resumeUrl: string;
}
```

### 5.3 Canonical facts — use verbatim, never guess

| Field | Value |
|---|---|
| Full name | Yash Gurjar |
| Site | https://www.yash.systems |
| Email | yashgurjar9714@gmail.com |
| GitHub | https://github.com/Yash4616 |
| LinkedIn | https://linkedin.com/in/yashgurjar9 |
| X / Twitter | https://x.com/Yash_9724 |
| Resume | `/assets/pdfs/Yash_Resume.pdf` |
| University | JECRC University, Jaipur |
| Degree | B.Tech — CSE (AI & ML specialization, IBM) |
| Duration | 2023 — 2027 |
| High school | Alwar Public School (2009 — 2022) |
| Location | Jaipur, Rajasthan, India (26.9°N, 75.8°E) |
| Focus | Computer Vision, Neural Networks, Deep Learning, TensorFlow, PyTorch |

### 5.4 Bio copy (condensed — use this, don't rewrite it long)

> I'm a Computer Science student from Jaipur with a deep fascination for how machines learn and adapt. I spend my time training neural networks, building web applications, and exploring the vast landscape of AI — constantly moving between theory and hands-on experimentation.

> What drives me is the creative problem-solving side of ML engineering — that moment when a model finally converges, when complex data reveals its patterns. I learn best by building, breaking things, and iterating until they work better than before.

### 5.5 Skills roster

**Orbit 1 — Expert:** Python, TensorFlow, Git, Problem Solving, Research, Team Collaboration

**Orbit 2 — Advanced:** JavaScript, TypeScript, C++, **Rust** *(A14)*, PyTorch, Scikit-learn, Matplotlib, React, Next.js, Docker, Figma, MySQL, Google Cloud, CSS, Technical Writing, Project Management

**Orbit 3 — Proficient:** Flutter, CUDA & cuDNN

**Total: 24 skills** (6 Expert · 16 Advanced · 2 Proficient).

Each node needs a one-line `blurb` for its tooltip — write something specific and technical, not "used for web development."

### 5.6 Loader sequence

```
[0.0s]  > Initializing system...
[0.3s]  > Loading neural weights... ████████░░ 80%
[0.6s]  > Loading neural weights... ██████████ 100% ✓
[0.9s]  > Allocating GPU memory... 24GB VRAM ✓
[1.2s]  > Initializing tensor cores... ✓
[1.5s]  > Loading model architecture... ResNet-152 ✓
[1.8s]  > Compiling computation graph...
[2.2s]  > Optimizing inference pipeline... ✓
[2.5s]  > Running validation... accuracy: 99.2% ✓
[2.8s]  > System ready.
[3.0s]  > Deploying yash.systems...
[3.3s]  █████████████████████████████████████████ DEPLOYED
```

Exit at 3.5 s. Mobile: compress to 2.0 s by scaling all timestamps by 0.57.

---

## 6. FILE STRUCTURE

### 6.1 Target tree (respects the existing repo — see D10)

```
src/
├── app/
│   ├── layout.tsx              [MODIFY] fonts, metadata, JSON-LD, noise overlay
│   ├── page.tsx                [MODIFY] loader gate + cursor + section assembly
│   ├── globals.css             [MODIFY] Neural Dark tokens, textures, utilities
│   ├── opengraph-image.tsx     [NEW]    next/og ImageResponse from siteConfig (A12)
│   ├── projects/[slug]/
│   │   ├── page.tsx            [MODIFY] rewired to config.ts + generateStaticParams (A3)
│   │   └── loading.tsx         [KEEP]
│   └── api/contact/route.ts    [NEW]    Resend handler
├── components/
│   ├── icons/
│   │   └── tech.tsx            [NEW]    inline SVG logo components + registry
│   ├── ui/
│   │   ├── section-header.tsx  [NEW]
│   │   ├── tooltip.tsx         [NEW]    restyled Radix
│   │   └── … existing shadcn
│   ├── features/
│   │   ├── loader.tsx          [NEW]
│   │   ├── cursor.tsx          [NEW]
│   │   ├── neural-canvas.tsx   [NEW]    OGL — replaces/absorbs Aurora.tsx
│   │   ├── globe.tsx           [NEW]    OGL wireframe sphere
│   │   ├── tilt-card.tsx       [NEW]
│   │   ├── model-card.tsx      [NEW]    ONE component, TWO surfaces (A4):
│   │   │                                the Stage 6 dialog + /projects/[slug]
│   │   ├── terminal-form.tsx   [NEW]
│   │   ├── orbit-system.tsx    [NEW]
│   │   └── strengths-cycle.tsx [NEW]
│   ├── sections/
│   │   ├── Hero.tsx            [MODIFY]
│   │   ├── About.tsx           [MODIFY]
│   │   ├── Skills.tsx          [MODIFY]
│   │   ├── Projects.tsx        [MODIFY]
│   │   └── Contact.tsx         [MODIFY]
│   └── layout/
│       ├── Navigation.tsx      [MODIFY] (A9 — NOT "Navbar.tsx"; D10 wins)
│       └── Footer.tsx          [MODIFY]
├── data/
│   └── config.ts               [NEW]    all content
├── hooks/
│   ├── use-typewriter.ts       [NEW]
│   ├── use-media-query.ts      [NEW]
│   ├── use-motion-safe.ts      [NEW]
│   └── use-in-view-raf.ts      [NEW]    IntersectionObserver → RAF gate
├── lib/
│   ├── utils.ts                [MODIFY] keep cn()
│   └── motion.ts               [NEW]    spring constants + variants
└── types/
    └── index.ts                [MODIFY] full type set from §5.2
```

### 6.2 Files to delete

- `src/data/projects.ts` — superseded by `config.ts`.
- `src/components/features/Aurora.tsx` — absorbed into `neural-canvas.tsx`. **Delete only after** the neural canvas renders correctly.
- Any commented-out imports in `page.tsx` (Experience, Testimonials).

**Added by A3 — duplicate routes (Stage 1).** These are thin wrappers that render the same
section components already anchored on the single page:

- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/projects/page.tsx` *(the index only — **`projects/[slug]/` stays**)*

**Added by A6 — lenis (Stage 1).**

- `src/lib/useLenis.ts`, and the `useLenis()` call in `src/providers/ClientWrapper.tsx`.
- `npm uninstall lenis`.

**Added by A7 — theming (Stage 1).**

- `src/components/ui/theme-toggle.tsx`
- `src/providers/theme-provider.tsx`
- `npm uninstall next-themes` — **blocked while `src/components/ui/sonner.tsx` imports
  `useTheme`.** See the Stage 1 report; requires owner sign-off before removal.

**Added by A8 — config (Stage 1).**

- `next.config.js` and `next.config.analyzer.js`, both replaced by `next.config.ts`.

### 6.3 Nothing else gets deleted. If you think something else should go, ask first.

---

## 7. PHASE 1 — THE BUILD (STAGES 1–8)

---

### STAGE 1 — Foundation: real data, types, design system

**Step 0 — Ground truth first.** Before writing any config, fetch the real repo list:

```bash
curl -s "https://api.github.com/users/Yash4616/repos?sort=updated&per_page=100" \
  | jq -r '.[] | select(.fork==false) | "\(.name)\t\(.stargazers_count)\t\(.forks_count)\t\(.language)\t\(.description)"'
```

Then, for each repo you intend to feature, fetch its README and read it:

```bash
curl -s "https://api.github.com/repos/Yash4616/<REPO>/readme" -H "Accept: application/vnd.github.raw"
```

Build `projects[]` from what you actually find. Star and fork counts are snapshots — annotate them with a `// as of YYYY-MM-DD` comment. Populate `metrics` **only** where a README states a real number (per D8). Assign `featured: true` to at most 3.

**Deliverables**

1. `src/data/config.ts` — the complete `siteConfig` object typed as `SiteConfig`. Every section of §5 populated.
2. `src/types/index.ts` — the full type set from §5.2.
3. `src/lib/motion.ts` — spring constants and shared variants from §3.4.
4. `src/app/globals.css` — Neural Dark tokens, noise `::before`, vignette `::after`, `.dot-grid` / `.line-grid` / `.scan-lines` / `.glass` utilities, `cursor: none` on `html, body, *` guarded by `@media (hover: hover) and (pointer: fine)`, cyan focus-visible ring at 2px offset.
5. `tailwind.config.ts` — colour tokens mapped to the CSS variables; keyframes `orbit`, `pulse-glow`, `blink`, `fade-up`, `scan`; `boxShadow` entries `glow-cyan` / `glow-violet`; `fontFamily.sans` → `var(--font-sans)`, `fontFamily.mono` → `var(--font-mono)`.
6. `src/app/layout.tsx` — add JetBrains Mono, wire both font variables onto `<html>`, full metadata block (§11.2), JSON-LD `Person` script.
7. `src/hooks/use-media-query.ts`, `use-motion-safe.ts`.
8. **Delete** `src/data/projects.ts` and update every import that referenced it.
9. `next.config.ts` — `optimizePackageImports`, AVIF/WebP formats, bundle analyzer behind `ANALYZE=true` (§9.1, §9.4, §9.5). **No `experimental.ppr`** *(A2)*. Preserve the existing CSP header block verbatim.
10. `npm run perf:budget` script that fails when First Load JS exceeds 300 KB (§9.5). Wire it into the gate from this stage onward.
11. Bake the noise grain to a tiled **128×128 PNG** rather than the inline `feTurbulence` data URI — see §9.1, item 3.
12. *(A12)* `src/app/opengraph-image.tsx` — 1200×630 generated from `siteConfig` with `next/og` `ImageResponse`. This closes the live 404 on the `/og-image.png` that `layout.tsx` already advertises. **Moved here from Stage 8.**
13. *(A3)* Delete `/about`, `/contact`, `/projects` (index). Rewire `/projects/[slug]` to `config.ts` with `generateStaticParams()`, per-slug `metadata`, and `SoftwareSourceCode` JSON-LD *(A5)*.
14. *(A6, A7, A8, A10)* Remove lenis; remove the theme runtime; `next.config.js` → `next.config.ts`; tsconfig target → ES2020.

> **Scope boundary for the model card.** Stage 1 creates `features/model-card.tsx` only because
> the rewired `/projects/[slug]` page needs a surface to render *(A4)*. It ships the spec table
> and metrics grid. The **sparklines (S2)** and **confusion matrix (S3)** are Stage 6 — they are
> added to this same component, not to a second one.

**Gate:** `npx tsc --noEmit` clean · `npm run lint` clean · `npm run build` clean · `npm run perf:budget` passes · existing pages still render · `config.ts` type-checks against `SiteConfig` with no casts.

---

### STAGE 2 — Boot-up loader + custom cursor

**`src/components/features/loader.tsx`** (`"use client"`)

- Full-viewport `bg-[--bg-void]`, JetBrains Mono, `text-[--accent-cyan]`, `.scan-lines` overlay, left-aligned output.
- Drive lines from `siteConfig.loader` — a single `setTimeout` chain or one `requestAnimationFrame` clock reading `step.at`. Do **not** hardcode strings here.
- Progress bars render as block characters; the final DEPLOYED bar fills width-proportionally.
- `aria-live="polite"` on the output container so screen readers get the sequence.
- **Exit at 3.5 s:** two `motion.div` halves — top animates `y: "-100%"`, bottom `y: "100%"`, `SPRING_SMOOTH`, revealing the hero beneath. Unmount on animation complete.
- **Skip:** any click or keypress sets `isLoaded = true` immediately. Show a `text-white/25 text-xs` hint at the bottom: "press any key to skip".
- **Session persistence:** on mount, read `sessionStorage.getItem("yash:booted")`. If present, skip entirely (render nothing, `isLoaded` true on first paint — guard with a mounted check so there's no SSR flash). Set the key on completion.
- **Reduced motion:** show the final frame for 600 ms, then exit with a fade.
- **Mobile:** scale all `step.at` values by 0.57 (→ ~2.0 s).

**`src/components/features/cursor.tsx`** (`"use client"`)

- Two `motion.div`s at `z-[99999]`, `pointer-events-none`, positioned with `style={{ x, y }}` from `useMotionValue` — **never** `left`/`top`.
- Dot: 8 px, `bg-white`, `SPRING_CURSOR_DOT`.
- Ring: 40 px, `border-2 border-white/50`, `SPRING_CURSOR_RING`.
- Hover over `a`, `button`, `[data-cursor="pointer"]` → ring scales to 1.5, fill `rgba(0,240,255,0.1)`, border cyan.
- `[data-cursor="magnetic"]` → ring animates its width/height/border-radius to the element's bounding box + 8 px padding.
- Over `input`/`textarea` → ring collapses to a 2 px × 24 px vertical bar.
- Detect hover targets with a single delegated `mousemove` on `document` using `e.target.closest(...)` — do not attach listeners per element.
- Disabled entirely when `matchMedia("(hover: none)")` matches. Return `null` — do not render and hide.
- Cursor mounts only after `isLoaded`.

**`src/app/page.tsx`** — loader gate: `{!isLoaded && <Loader onDone={…} />}`, content wrapped so it's present in the DOM (for SEO and no CLS) but visually revealed by the loader exit. Mount `<Cursor />` at root. Remove dead commented imports.

**Gate:** loader plays once per session · skip works on click and keypress · no SSR flash of unstyled loader · cursor tracks at 60 fps with no re-renders (verify with React DevTools Profiler — the cursor component should render once) · cursor absent on a touch-emulated viewport · keyboard Tab still shows focus rings.

---

### STAGE 3 — Navbar + Hero neural canvas

#### 3a. Navbar (`src/components/layout/Navbar.tsx`)

- Fixed, full-width, `z-50`. Transparent at top → `backdrop-blur-xl bg-[--bg-primary]/80 border-b border-[--border-subtle]` past `scrollY > 100`.
- Left: `<YG />` monogram SVG, 32 px, cyan. Centre: Home · About · Skills · Projects · Contact. Right: GitHub / LinkedIn / X icons + outlined cyan "Resume" button.
- Active section via `IntersectionObserver` (threshold 0.4); the active link gets a `motion.span` underline with `layoutId="navIndicator"`.
- Mobile: hamburger → full-screen overlay, staggered link entrance, body scroll lock while open, Escape closes, focus trapped.

#### 3b. Neural canvas (`src/components/features/neural-canvas.tsx`) — **OGL**

This replaces the R3F spec entirely. Reference implementation:

```ts
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from "ogl";

const COUNT = 220;                 // desktop; 90 on mobile
const LINK_DIST = 1.5;             // world units
const LINK_DIST_SQ = LINK_DIST ** 2;
const MAX_LINKS = 900;             // hard cap on line segments

const renderer = new Renderer({ alpha: true, dpr: Math.min(devicePixelRatio, 1.5), antialias: false });
const gl = renderer.gl;
const camera = new Camera(gl, { fov: 75, near: 0.1, far: 100 });
camera.position.set(0, 0, 5);
const scene = new Transform();

// --- particles: gl.POINTS ---
const positions = new Float32Array(COUNT * 3);   // live, mutated each frame
const seeds     = new Float32Array(COUNT * 3);   // per-particle phase offsets
const home      = new Float32Array(COUNT * 3);   // rest positions (sphere, r=4)

const pointGeo = new Geometry(gl, {
  position: { size: 3, data: positions, usage: gl.DYNAMIC_DRAW },
});

const pointProgram = new Program(gl, {
  transparent: true,
  depthTest: false,
  vertex: /* glsl */ `
    attribute vec3 position;
    uniform mat4 modelViewMatrix, projectionMatrix;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 4.0 * (1.0 / -mv.z) * 6.0;   // perspective-scaled
      gl_Position = projectionMatrix * mv;
    }`,
  fragment: /* glsl */ `
    precision highp float;
    uniform vec3 uColor;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;                        // round points
      float core = smoothstep(0.5, 0.0, d);
      float glow = smoothstep(0.5, 0.15, d) * 0.5; // cheap fake bloom
      gl_FragColor = vec4(uColor, core * 0.6 + glow);
    }`,
  uniforms: { uColor: { value: [0, 0.94, 1] } },
});

const points = new Mesh(gl, { mode: gl.POINTS, geometry: pointGeo, program: pointProgram });
points.setParent(scene);

// --- connections: gl.LINES, dynamic buffer ---
const linePositions = new Float32Array(MAX_LINKS * 2 * 3);
const lineAlphas    = new Float32Array(MAX_LINKS * 2);
const lineGeo = new Geometry(gl, {
  position: { size: 3, data: linePositions, usage: gl.DYNAMIC_DRAW },
  alpha:    { size: 1, data: lineAlphas,    usage: gl.DYNAMIC_DRAW },
});
// vertex shader passes alpha through to a varying; fragment outputs vec4(uColor, vAlpha * 0.35)
const lines = new Mesh(gl, { mode: gl.LINES, geometry: lineGeo, program: lineProgram });
lines.setParent(scene);
```

Per-frame loop:

1. **Drift** — `positions[i] = home[i] + sin(t * speed + seeds[i]) * 0.35` on each axis. Organic, non-repeating.
2. **Mouse attraction** — project the normalized pointer to a world-space point at `z = 0`. For each particle within radius 2, lerp toward it at `0.02`. Ease the attraction strength to zero when the pointer leaves the canvas.
3. **Topology** — recompute links with **squared** distances only, and **only every 3rd frame** (topology changes slowly; positions still update every frame from the cached pair list). Break out at `MAX_LINKS`. Alpha per segment = `1 - sqrt(dSq) / LINK_DIST`.
4. **Upload** — `pointGeo.attributes.position.needsUpdate = true`, same for both line attributes; set `lineGeo.drawRange.count = usedLinks * 2`.
5. **Parallax** — `scene.rotation.y += (pointer.x * 0.1 - scene.rotation.y) * 0.05`; same for `.x` with `pointer.y * 0.06`.

**Performance requirements**

- **Run the whole renderer in a Web Worker via `OffscreenCanvas`** — see §9.2. Feature-detect and fall back to the main thread. Build the main-thread version first, verify it renders, *then* move it into the worker; debugging both at once is miserable.
- Wrap the RAF in `useInViewRaf` — stop when the hero scrolls out.
- **Zero allocations inside the loop.** Every typed array and scratch vector is preallocated at setup (§9.6).
- Mobile / `matchMedia("(max-width: 767px)")`: `COUNT = 90`, `MAX_LINKS = 300`, no mouse attraction.
- `prefers-reduced-motion`: render one frame and stop the loop.
- Teardown: cancel RAF, remove `resize`/`pointermove` listeners, `loseContext()`.
- If `getContext("webgl")` returns null, render the CSS gradient-mesh fallback instead of crashing.

#### 3c. Hero foreground (`src/components/sections/Hero.tsx`)

- Container `absolute inset-0 flex flex-col justify-center items-start px-8 lg:px-20 z-10`, canvas at `z-0`.
- **Name:** `text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight`, `background-clip: text` with `--gradient-accent`, `text-shadow: 0 0 40px rgba(0,240,255,0.15)`. Entrance: clip-mask reveal — `overflow-hidden` parent, child `motion.div` animating `y: "100%" → 0` with `SPRING_SMOOTH`.
- **Subtitle:** "AI & ML Engineer", `text-2xl text-white/80 font-light tracking-wide`, fade-up at +300 ms.
- **Typewriter:** `Specializing in ` + cycling words from config. Build `useTypewriter(words, { typeMs: 80, deleteMs: 40, pauseMs: 2000 })`. Cursor `|` with the `blink` keyframe. Mono, cyan. **Reserve the line's height** with a fixed `min-h` so cycling never causes layout shift.
- **CTAs at +600 ms:**
  - Primary "View Projects ↗" — `border-2 border-[--accent-cyan] px-8 py-4 rounded-full`, hover `bg-cyan-400/10 shadow-[var(--glow-cyan)] scale-[1.02]`, `data-cursor="magnetic"`.
  - Secondary "Download Resume" — `bg-white/5 border border-white/10 backdrop-blur-sm px-8 py-4 rounded-full`, `download` attribute, `data-cursor="magnetic"`.
- **Scroll hint:** bottom-centre chevron, `animate={{ y: [0, 8, 0] }}` infinite, label in `text-xs text-white/30 tracking-widest uppercase`.
- `<h1>` must contain the real name as text (SEO) — the gradient is CSS, not an image.

**Gate:** 60 fps on the hero at 1920×1080 (Chrome Performance panel, no long tasks >50 ms) · canvas stops when scrolled away (verify with a `console.count` in the RAF, then remove it) · no WebGL context leak after five soft navigations · zero CLS from the typewriter · Hero LCP element is the `<h1>`.

---

### STAGE 4 — About: the bento grid

**Desktop layout (`lg:grid-cols-3 lg:grid-rows-2 gap-4`):**

```
┌──────────────────────────┬───────────┐
│  BIO           (span 2)  │   GLOBE   │
├─────────────┬────────────┴───────────┤
│  EDUCATION  │   STRENGTHS  (span 2)  │
└─────────────┴────────────────────────┘
```

Mobile: single-column stack, each card full-width, in the order Bio → Education → Strengths → Globe.

**Card 1 — Bio** (`col-span-2`): `.glass` + `.line-grid` background at 5 %. 64 px circular avatar (`next/image`, explicit dimensions, `blurDataURL`) top-left. Two condensed paragraphs from `siteConfig.about.bio` (§5.4).

**Card 2 — Globe** (`src/components/features/globe.tsx`, OGL):
- Wireframe sphere. OGL has no `Sphere` wireframe mode, so build the geometry manually: generate a UV-sphere's lat/long ring vertices and draw with `gl.LINES` (16 latitude bands × 24 longitude segments is plenty).
- Colour `#00F0FF` at `opacity: 0.15`.
- Beacon: a small `gl.POINTS` mesh at Jaipur's converted coordinates —
  `x = cos(lat) * cos(lng)`, `y = sin(lat)`, `z = cos(lat) * sin(lng)`, scaled by radius; lat/lng in radians from `siteConfig.about.location`.
- Beacon pulses via a `uTime` uniform driving `gl_PointSize` and alpha.
- Auto-rotate `rotation.y += 0.003` per frame.
- Labels below: `📍 Jaipur, Rajasthan` (`text-sm text-white/60`) and `Available for remote work worldwide` (`text-xs text-white/40`).
- **Mobile / reduced-motion / no-WebGL fallback:** static SVG world outline with a CSS-pulsing cyan dot over India.

**Card 3 — Education:** `GraduationCap` icon (cyan), degree title, institution (`text-white/60 text-sm`), duration (`text-white/40 text-xs font-mono`). Progress bar computed at render: `((currentYear - start) / (end - start)) * 100`, clamped 0–100, filled with `--gradient-accent`, labelled `"NN% complete"` in mono cyan. Below a divider: Alwar Public School, 2009 — 2022, `text-xs text-white/30`. **Compute the year at runtime; never hardcode it.**

**Card 4 — Strengths** (`col-span-2`, `src/components/features/strengths-cycle.tsx`):
- Per D1, no R3F cube. Build an **animated card stack**: one strength visible at a time, auto-advancing every 3 s, exiting with `y: -20, opacity: 0` and entering with `y: 20, opacity: 0 → 1` via `AnimatePresence` `mode="wait"`.
- Dot indicators below; hovering pauses the cycle; clicking a dot jumps to that strength.
- Four strengths from config: Deep Learning Expert · Production-Ready Code · Research-Oriented · Problem Solver — each with its one-line description and a Lucide icon.
- (Optional stretch, only if everything else is green: a CSS 3D cube using `transform-style: preserve-3d` with drag-to-rotate. Do not attempt this before Stage 8.)

**Gate:** grid holds at 375 / 768 / 1280 / 1920 · globe falls back correctly with WebGL disabled · progress bar shows the correct percentage for the current year · no CLS from the strengths cycle (fixed card height).

---

### STAGE 5 — Skills: the orbital tech radar

**No list. No grid. No tabs.** (Mobile is the sole exception.)

- **Centre:** `<YG>` monogram in a glowing circle, `pulse-glow` animation. This is the one permitted resting glow.
- **Three SVG orbit rings** at increasing radii, `stroke="rgba(255,255,255,0.06)"`, `stroke-dasharray="4 8"`, with a slowly animated `stroke-dashoffset`.
- **Node positioning:** distribute evenly per orbit —
  `transform: rotate(${i * 360 / n}deg) translateX(${radius}px) rotate(${-(i * 360 / n)}deg)`.
- **Orbit rotation** (CSS keyframes on the ring container, so the browser composites it):
  - Inner: `orbit 30s linear infinite`
  - Middle: `orbit 50s linear infinite reverse`
  - Outer: `orbit 70s linear infinite`
- **Counter-rotation:** each node's icon wrapper runs the inverse animation at the same duration so logos stay upright.
- **Hover:** node scales 1.3 with a cyan glow; the parent orbit gets `animation-play-state: paused`; a restyled Radix `Tooltip` shows name (bold), a colour-coded proficiency badge (cyan / violet / amber), category, and the blurb.
- **Keyboard:** every node is a real `<button>` in tab order; focus produces the same visual state and opens the tooltip. This is non-negotiable — a mouse-only visualization fails the a11y gate.
- **Sizing:** the whole system lives in a square container sized with `min(80vw, 640px)`; radii are percentages of that so it scales.
- **Mobile (`< md`):** categorized pill grid grouped by proficiency tier, glassmorphism cards, colour-coded badges. Same data, no orbit.
- **Reduced motion:** orbits static, nodes still hoverable and focusable.

**Gate:** all **24** skills *(A14)* render and are reachable by keyboard · no node overlaps the centre or clips the container at any breakpoint · tooltips are readable and dismissible with Escape · orbit animation runs on the compositor (no layout thrash in the Performance panel).

---

### STAGE 6 — Projects: model cards with 3D tilt

> **Read §8.1 / S1–S3 before starting this stage.** Projects are presented as **model cards**, with **training-curve sparklines** and an **interactive confusion matrix**. That is the differentiating content of this section — the tilt is just the wrapper.

**Filter bar:** pills for All · Machine Learning · Computer Vision · NLP · Web. Active pill's background is a `motion.div` with `layoutId="filterPill"` so it slides between options. Inactive: `bg-white/5 border-white/10`. Filtering animates the grid with `AnimatePresence` + `layout`. Pills are `<button role="tab">` with `aria-selected`.

**Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`. Each card is an `<article>`.

**`src/components/features/tilt-card.tsx`:**

```tsx
const mouseX = useMotionValue(0.5);
const mouseY = useMotionValue(0.5);
const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
// style={{ rotateX, rotateY, transformPerspective: 1000 }}
```

- Normalize pointer position to 0–1 using `getBoundingClientRect()`; reset both to 0.5 on `pointerleave` so the card springs flat.
- Spotlight: a `radial-gradient` overlay whose centre is driven by two more `useMotionValue`s converted to `%` via `useMotionTemplate`.
- Hover: `scale: 1.02`, border → `border-white/20`, subtle glow.
- **Disable tilt entirely** on touch devices and under reduced motion — render a plain card.

**Card anatomy:**

```
┌────────────────────────────────────────┐
│ [16:9 preview — image, or gradient +   │
│  architecture-name placeholder]        │
├────────────────────────────────────────┤
│ TITLE                      [Category]  │
│ Two-to-three-line description.         │
│ ┌────────┐┌────────┐┌────────┐         │
│ │PyTorch ││ OpenCV ││ Python │         │
│ └────────┘└────────┘└────────┘         │
│ ▸ Accuracy 98.5%  ▸ Inference 15ms     │  ← only if metrics !== null
│ ⭐ 2  🍴 0        [ Code ]  [ Demo ]   │
└────────────────────────────────────────┘
```

- Metrics row renders only when `project.metrics` is non-null (D8).
- Demo button renders only when `links.demo` exists.
- Star/fork counts come from the Stage 1 snapshot. ***(A13)* The whole star/fork row is hidden when `stars === 0 && forks === 0`** — as of the Stage 1 snapshot that is every card. Rendering "⭐ 0 🍴 0" six times reads worse than rendering nothing.
- **Featured three *(A16)*:** `tokenizer`, `Object_Detection_Semantic_Segmentation`, `Rag`. ResNet18 stays in the grid — with its confusion matrix — but is not featured.
- The expanded model card is **`features/model-card.tsx`, the same component the `/projects/[slug]` page renders** *(A4)*. Stage 6 adds S2 sparklines and the S3 confusion matrix to it; both surfaces gain them at once.
- Preview: prefer a real screenshot in `/public/projects/`. If none exists, a gradient placeholder showing the architecture name in mono — **never** a stock placeholder image.

**Expanded model card:** clicking a card opens a Radix Dialog (shared `layoutId` with the card for a seamless morph) containing the full §8.1/S1 spec table, the S2 sparklines, the S3 confusion matrix where available, and the `limitations` line. Escape closes; focus returns to the originating card.

**Footer CTA:** full-width ghost button, "View All Projects on GitHub →", linking to `https://github.com/Yash4616`, hover glow.

**Gate:** every GitHub link returns 200 (verify with curl) · filters work and animate without jank · tilt is off on touch · cards keyboard-navigable and the whole card is not a nested-interactive trap (links are the only tab stops inside) · every model-card field traces to something real in the repo (D8) · dialog focus is trapped and restored.

---

### STAGE 7 — Terminal contact + footer

> **Read §8.1 / S4 before starting this stage.** The terminal is not just a themed form — it is a **real shell** with a command registry. Build the shell first, then make `contact` one of its commands.

#### 7a. Terminal form (`src/components/features/terminal-form.tsx`)

**Chrome:** `.glass` card, `bg-[--bg-elevated]`, `.scan-lines`, top bar with three decorative dots (red/yellow/green) and the title `terminal — visitor@yash.systems` in mono. Body in JetBrains Mono `text-sm text-[--accent-cyan]`.

**Flow:**

```
$ whoami
> visitor

$ ./send_message.sh
[SYSTEM] Initializing secure connection... ✓

Enter your name: █
Enter your email:
Enter payload (message):

                                    [Submit: Enter ↵]
```

1. On enter-viewport (not on mount — wait for `whileInView`), auto-type `$ whoami`, print `> visitor`.
2. Auto-type `$ ./send_message.sh`, print the SYSTEM line.
3. Reveal `Enter your name: ` with a real `<input>` — transparent background, no border, mono, caret cyan, rendered inline after the prompt. Autofocus it.
4. Enter or Tab advances to email, then to a `<textarea>` for the message.
5. **Validation with zod** (already installed). On failure, print in terminal voice: `[ERROR] Invalid email format. Try again.` in red, and keep focus on the offending field. `aria-invalid` + `aria-describedby` on the input.
6. Submit → POST to `/api/contact`.

**Submission animation** (drive from real request state, not a fake timer — if the request fails, show the failure):

```
> Encrypting payload... ██████████ ✓
> Transmitting to yash@systems... ✓
> Message delivered successfully.
> Response ETA: 12-24 hours.
```

On error: `> [FATAL] Transmission failed. Reach me directly at yashgurjar9714@gmail.com`.

**Accessibility:** the terminal is a real `<form>` with real `<label>`s (visually hidden, with the prompt text as the visible label via `aria-labelledby`). It must be completable by a screen-reader user with zero mouse. Output region is `aria-live="polite"`.

**Mobile:** simplified chrome, larger tap targets, `inputMode="email"` on the email field, an explicit Submit button (Enter-to-advance is unreliable on mobile keyboards).

#### 7b. API route (`src/app/api/contact/route.ts`)

```ts
// POST { name, email, message }
// 1. Re-validate with the SAME zod schema (never trust the client)
// 2. Rate-limit: in-memory Map keyed by IP, 3 requests / 10 min, 429 on exceed
// 3. Honeypot: a hidden field that must be empty; silently 200 if filled
// 4. Send via Resend to yashgurjar9714@gmail.com, replyTo: submitted email
// 5. Return { ok: true } or { ok: false, error } with the right status
// 6. NEVER echo the RESEND_API_KEY or stack traces into the response
```

- `npm i resend`
- `.env.local`: `RESEND_API_KEY=`, `CONTACT_TO_EMAIL=yashgurjar9714@gmail.com`, `CONTACT_FROM_EMAIL=`
- Commit a `.env.example` with the keys and empty values. **Never commit `.env.local`** — verify it's in `.gitignore`.
- Until the Resend domain is verified, use `onboarding@resend.dev` as the from-address; note this in the README.

#### 7c. Contact info + footer

Below the terminal: three small `.glass` pills — Email (click to copy, with a "Copied ✓" toast), Location, Availability. Social icon row with glow hover.

**Footer** (`src/components/layout/Footer.tsx`): `border-t border-white/5`. Three columns — monogram + tagline / quick links / resume button + socials. Bottom bar: `© 2026 Yash Gurjar. Crafted with Next.js, OGL & too much coffee.` in `text-xs text-white/20` (note: **OGL**, not Three.js — don't claim tech you didn't ship). Back-to-top `motion.button`, fixed bottom-right, fades in past the hero, smooth-scrolls to top, `aria-label="Back to top"`.

**Gate:** a real test email arrives · validation errors render in terminal style and are announced · rate limit returns 429 on the 4th request · form completable by keyboard only · no secrets in the client bundle (`grep -r "RESEND" .next/static` returns nothing).

---

### STAGE 8 — Polish, performance, accessibility, SEO

Work through this as a checklist and report results, not intentions.

**Responsive**
- Walk every section at 375 / 414 / 768 / 1024 / 1280 / 1920. Screenshot each.
- No horizontal overflow anywhere (`document.documentElement.scrollWidth === clientWidth`).
- Verify every mobile fallback from §12.2 actually triggers.

**Performance**
- `npm run build` — inspect the route bundle report. First Load JS **< 300 KB**. If over, find the offender with `@next/bundle-analyzer`.
- Lighthouse (mobile + desktop) on a production build: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
- Confirm every OGL canvas stops its RAF off-screen.
- All images through `next/image` with explicit dimensions and `blurDataURL`; hero avatar gets `priority`.

**Accessibility**
- axe DevTools: zero violations.
- Full keyboard pass: Tab through the entire page. Every interactive element reachable, visible cyan focus ring, logical order, no traps.
- Screen reader smoke test (NVDA or VoiceOver): headings form a sane outline, each section is labelled, canvases are `aria-hidden` with `sr-only` descriptions, loader and terminal announce via `aria-live`.
- Contrast: body text ≥ 4.5:1, large text ≥ 3:1. **Check `--text-muted` (#555) on `--bg-primary` — it fails at 4.5:1.** Restrict it to decorative use, or lighten it to `#6E6E6E`.
- Toggle `prefers-reduced-motion: reduce` in DevTools and re-walk the whole page.

**SEO & metadata**
- Metadata block and JSON-LD verified with Google's Rich Results Test.
- ~~`public/og-image.png` at 1200×630~~ — **moved to Stage 1 as `app/opengraph-image.tsx` *(A12)*.** Verify here that it still renders and matches `siteConfig`; do not rebuild it.
- Favicon set from the `<YG>` monogram (cyan on `#030303`): `.ico`, 32/180 px PNGs, `site.webmanifest`.
- `app/robots.ts` and `app/sitemap.ts`.
- Semantic structure: one `<h1>` (hero), `<h2>` per section, `<section aria-labelledby>`, `<article>` for project cards.

**Cross-browser:** Chrome, Firefox, Safari (WebKit is the one that will surprise you — check `backdrop-blur`, `background-clip: text`, and WebGL point sprites specifically), Edge.

**Differentiators to land in this stage** (specs in §8.1)
- **S5** — `/llms.txt` route generated from `siteConfig`, plus per-project `SoftwareSourceCode` JSON-LD.
- **S6** — telemetry HUD, off by default, toggled with `~`.
- **S7** — native `animation-timeline` scroll animations behind `@supports`, and `document.startViewTransition()` for anchor navigation.

**Cleanup**
- Delete `src/data/projects.ts` and `Aurora.tsx` if not already gone.
- Zero unused imports, zero `console.log`, zero commented-out code.
- Console Easter egg: ASCII `YG` art plus `> Curious? github.com/Yash4616` printed once on mount.
- `README.md`: stack overview, setup, env vars, "how to update content" pointing at `config.ts`, deployment notes.

**Gate:** every box above ticked with evidence pasted.

---

## 8. SIGNATURE DIFFERENTIATORS — WHAT MAKES THIS LEGENDARY

Everything in §7 makes the site *beautiful*. This section is what makes it **unmistakably the portfolio of an AI engineer** rather than a well-designed site that happens to list ML projects.

The organizing insight: **almost every "AI portfolio" is a normal portfolio with neural-network wallpaper.** The differentiation isn't more particles — it's that the *information architecture itself* speaks ML. Model cards, training curves, confusion matrices, live inference, embedding space. A recruiter who has seen 200 portfolios has never seen a real confusion matrix on one.

### 8.1 Tier 1 — Fold into Phase 1 (huge credibility, near-zero performance cost)

Build these **inside** the stages listed. They are not extras; they are the point.

---

#### S1 — Projects are **model cards**, not project cards *(Stage 6)*

Adopt the HuggingFace model-card vocabulary. This one change does more for perceived seniority than any animation on the site.

Extend the `Project` type:

```ts
export interface ModelCard {
  architecture: string;        // "ResNet-18"
  params: string;              // "11.2M"
  dataset: string;             // "CIFAR-10 · 50k train / 10k test"
  hardware: string;            // "1× T4, mixed precision"
  epochs: number;
  optimizer: string;           // "SGD + cosine annealing, lr 0.1"
  augmentation: string[];      // ["RandomCrop(32,4)", "HorizontalFlip", "Cutout"]
  metrics: ProjectMetric[];    // top-1, top-5, inference latency, model size
  limitations: string;         // one honest sentence
  trainingCurve?: { epoch: number[]; trainLoss: number[]; valAcc: number[] };
  confusion?: { labels: string[]; matrix: number[][] };
}
```

Card front stays visual. **Card flips or expands** (Framer Motion `layoutId` → a Radix Dialog) into the full model card: a spec table in mono, the metrics, and the honest limitations line.

> The `limitations` field is the flex. Stating "struggles on low-light and heavily occluded samples; not validated outside CIFAR-10 distribution" tells a reader you've actually shipped models. Nobody fakes humility about their own work.

**Rule:** every field must come from the real repo (D7/D8). If Yash didn't log the optimizer, either dig it out of the training script or omit the field. Never invent.

---

#### S2 — Training-curve sparklines *(Stage 6)*

On each ML card, render the real loss and validation-accuracy curves as inline SVG `<polyline>` sparklines, ~48 points each.

- Pull the arrays from training logs / notebook outputs in the repo. Downsample to ≤48 points. Store in `config.ts`. Total cost: **under 2 KB of JSON, zero JS libraries.**
- Loss in violet, val-accuracy in cyan, on a faint dot-grid.
- Animate `pathLength: 0 → 1` on `whileInView` — the curve draws itself.
- Hover a point → mono tooltip `epoch 23 · loss 0.187 · val 94.2%`.

A real loss curve that goes down and then plateaus is the most credible object you can put on a portfolio. It is unfakeable-looking in a way a percentage badge is not.

---

#### S3 — Interactive confusion matrix *(Stage 6, for the classifier project)*

A 10×10 grid of divs, cell opacity mapped to normalized value, diagonal in cyan and off-diagonal errors in amber. Hover a cell → `true: cat · predicted: dog · 3.1%`.

Ship the matrix as a `number[][]` in config, generated once by running eval on the saved model. Roughly 100 numbers. Renders in under a millisecond.

Pair it with one line of interpretation: *"Most residual error is cat↔dog — expected for 32×32 inputs where texture cues dominate."* That sentence is worth more than a paragraph of self-description.

---

#### S4 — The terminal is a **real shell** *(Stage 7)*

Upgrade the contact terminal from a themed form into the site's power-user interface. It already looks like a terminal — make it behave like one.

Command registry lives in `config.ts` as `terminalCommands`:

| Command | Behaviour |
|---|---|
| `help` | List all commands |
| `whoami` | `visitor` |
| `ls projects` | Table of project ids + one-liners |
| `cat <project-id>` | Prints the model card as ASCII |
| `cat about` | Prints the bio |
| `skills --tier expert` | Filtered skill list |
| `open <project-id>` | Opens the GitHub repo in a new tab |
| `resume` | Triggers the PDF download |
| `contact` | Enters the guided message flow (the Stage 7 form) |
| `neofetch` | ASCII `YG` logo + system-style stat block: uni, stack, location, repos, coffee |
| `clear` | Clears output |
| `sudo <anything>` | `Nice try. Permission denied — but I like your ambition.` |

Implementation notes: history with ↑/↓, Tab completion against the command list, unknown command → `command not found: xyz. Try 'help'.` Keep the whole parser under 120 lines — it's a `switch` over a registry, not a language.

This converts the single most decorative element on the site into the most *functional* one, and it rewards exactly the kind of visitor Yash wants (engineers who type before they scroll).

---

#### S5 — Machine-readable portfolio: `/llms.txt` *(Stage 8)*

In 2026 a meaningful share of first-pass screening is done by an LLM reading the page. Serve it a clean channel.

- `app/llms.txt/route.ts` → returns `text/plain`: a structured markdown summary of who Yash is, the model cards, the skills roster, and contact info, generated **from `siteConfig` at build time** so it can never drift from the site.
- Link it: `<link rel="alternate" type="text/plain" href="/llms.txt">`.
- Strengthen the JSON-LD beyond `Person`: add a `CreativeWork` / `SoftwareSourceCode` node per project with `programmingLanguage`, `codeRepository`, and `about`.

Cost: one route file. Benefit: an agent summarizing this portfolio gets the *curated* version instead of scraping animated DOM.

---

#### S6 — Telemetry HUD *(Stage 8)*

A small fixed readout, bottom-left, mono, `text-white/30`, toggled with `~` or from the command palette:

```
GPU   ANGLE (NVIDIA GeForce RTX ...)
FPS   60   FRAME 14.2ms
NODES 220  EDGES 731  DRAW 2
```

Real numbers from the render loop and `WEBGL_debug_renderer_info`. Off by default; discoverable.

The reason this works: it's the mission-control aesthetic *earned honestly*. Fake telemetry is cheesy. Real telemetry, showing your own frame budget in public, is a flex.

---

#### S7 — Native scroll-driven animation where supported *(Stage 8)*

For section reveals and progress bars, use CSS `animation-timeline: view()` / `scroll()` behind `@supports (animation-timeline: view())`, with the Framer Motion `whileInView` path as the fallback.

Where supported, these run **entirely on the compositor with zero JavaScript** — no scroll listeners, no main-thread work, immune to jank. Progressive enhancement in the truest sense.

Also: wrap section anchor navigation in `document.startViewTransition()` when available, for a native cross-fade at zero cost.

---

### 8.2 Tier 2 — Phase 2, highest ceiling

---

#### S8 — Live in-browser inference *(the single most impressive thing possible here)*

A visitor uploads an image or enables their webcam, and **Yash's own trained model runs in their browser** and classifies it, live, with a probability bar chart.

- **Runtime:** `onnxruntime-web` with the WASM backend, WebGPU when available. Not TensorFlow.js — ORT-web is smaller and faster for a single classifier.
- **Model:** export Yash's CIFAR-10 ResNet-18 to ONNX and quantize to int8. Target **under 15 MB**. If it exceeds that, ship MobileNetV3-Small int8 (~2.5 MB) and label it honestly as a demo model.
- **Loading discipline (non-negotiable):** the model and runtime must live in a chunk that is **never** in the initial bundle. Click-to-load only, behind `next/dynamic`. Show download progress in terminal styling: `> fetching weights... 8.2/11.4 MB`.
- **Output:** top-5 predictions as animated horizontal bars, plus real measured inference latency in ms. That latency number is the whole point — it's a live, verifiable performance claim.
- **Fallback:** no WebGPU/WASM → a pre-recorded demo video.

Nothing else on this list converts a skeptic as fast as watching a model the candidate trained run on their own photo in 40 ms.

---

#### S9 — Embedding atlas

A 2D UMAP projection of the CIFAR-10 test set (or Yash's own dataset), ~2000 points, rendered **in the OGL context already built for the hero** — the particle renderer is 90 % of the work, already done.

- Points coloured by class; hover shows the 32×32 thumbnail (sprite atlas, one texture) and the predicted vs true label.
- Misclassified points rendered in amber — the clusters where they concentrate *are* the story.
- Drag to pan, scroll to zoom.

Precompute the projection offline; ship coordinates as a `Float32Array` binary (~16 KB for 2000 points), not JSON.

This is the rarest item on the list. A latent space you can fly through says "I understand what the model learned," not "I called `.fit()`."

---

#### S10 — Semantic search over the portfolio

"Ask my portfolio anything" with **zero runtime API cost and zero LLM bill**:

- At build time, a script embeds each chunk (bio paragraphs, model cards, skills) with a small sentence-transformer and writes a `Float32Array` of vectors.
- At query time, embed the query in-browser with a quantized MiniLM (~20 MB, click-to-load) *or* — much lighter — fall back to BM25 keyword scoring in ~50 lines.
- Cosine similarity over ~40 vectors is instantaneous. Return the top 3 chunks with the matching section highlighted.

Wire it into the command palette (`⌘K`) and the terminal (`ask <question>`) so it has two front doors.

---

#### S11 — Session signature

A deterministic generative graphic seeded from the visitor's session — rendered in the footer as a small `<canvas>` with the caption `session signature · seed 0x8F2A · you are visitor #—`. Same visitor, same shape, every time. Cheap, memorable, and quietly reinforces the "everything here is generated, nothing is stock" thesis.

---

### 8.3 Priority order

If time is finite, this is the order of return on effort:

**S1 model cards → S2 sparklines → S4 real shell → S3 confusion matrix → S6 telemetry → S5 llms.txt → S7 native scroll → S8 live inference → S9 embedding atlas → S10 semantic search → S11 signature.**

S1 and S2 alone move the site from "nice portfolio" to "this person does ML for real." Build those before any Phase 2 item.

---

## 9. PERFORMANCE ENGINEERING

The budget in §11.1 is not a wish. This section is how it's actually hit. A heavy, beautiful site that stutters on a mid-range Android reads as *amateur*, no matter how good it looks on the developer's monitor.

### 9.1 The three things that will silently blow the budget

Address all three in Stage 1. They are the usual killers on exactly this kind of site.

**1. Barrel imports.** `import { Brain } from "lucide-react"` can pull hundreds of modules in dev and bloat the graph. Fix in `next.config.ts`:

```ts
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-tooltip"],
}
```

**2. `backdrop-blur` at scale.** Backdrop filters force an expensive offscreen pass and are the number-one cause of mobile scroll jank on glassmorphism sites. Rules:

- `backdrop-blur` only on surfaces smaller than ~40 % of the viewport (navbar, small pills).
- Large cards use a **solid** `rgba(255,255,255,0.03)` fill — visually near-identical over a near-black background, at a fraction of the cost.
- Below `md`, disable `backdrop-blur` entirely via a `.glass` variant. Nobody will notice; everyone will feel it.

**3. The SVG noise filter.** `feTurbulence` stretched full-viewport is rasterized by the CPU and is genuinely expensive — it can cost several milliseconds per paint on mobile.

**Fix:** generate the turbulence once at build time into a **128×128 PNG** and tile it with `background-repeat: repeat`. Identical grain, ~2 KB, effectively free. Do this instead of the inline SVG data URI in §4.2.

### 9.2 Get the neural canvas off the main thread

The highest-leverage optimization available, and one almost no portfolio does:

- **`OffscreenCanvas` + Web Worker.** `canvas.transferControlToOffscreen()`, run the entire OGL renderer inside a worker, `postMessage` pointer position and resize events in. The main thread is then completely free for scroll, Framer Motion, and hydration — **the particle field literally cannot cause jank**.
- Feature-detect `typeof OffscreenCanvas !== "undefined" && canvas.transferControlToOffscreen`; fall back to the main-thread renderer (Safari support has historically lagged).
- Throttle pointer `postMessage` to one per frame — do not flood the worker.

Also on the main thread:

- All scroll and touch listeners `{ passive: true }`.
- Defer non-critical init (globe, telemetry, easter eggs, command palette registration) to `requestIdleCallback`.
- **Zero allocations inside any RAF loop.** Preallocate every typed array and scratch vector at setup. A single `new Float32Array()` per frame is a GC stutter every few seconds.

### 9.3 Paint and layout containment

```css
section:not(#hero) {
  content-visibility: auto;
  contain-intrinsic-size: 0 800px;   /* prevents scrollbar jumping */
}
.card { contain: layout paint; }
```

`content-visibility: auto` skips rendering work for off-screen sections entirely — one of the largest single wins available for a long scrolling page.

Further rules:

- Animate **only** `transform` and `opacity`. Never `width`, `height`, `top`, `left`, `margin`, or `filter` in a loop.
- `will-change` is applied on interaction start and **removed** on end. A permanent `will-change` permanently costs GPU memory.
- Orbit rotations run as CSS keyframes on the compositor, never as JS-driven transforms.

### 9.4 Delivery

- ~~**Partial Prerendering:** enable `experimental.ppr`~~ — **dropped *(A2)*.** PPR is canary-only and needs React 19; we ship stable. Every other item in this section still applies.
- `export const dynamic = "force-static"` on the home route — nothing on it is request-dependent.
- **Generate the OG image at build** with `next/og` `ImageResponse` from `siteConfig`, so it can never go stale.
- Images: `formats: ["image/avif", "image/webp"]`, explicit dimensions, `blurDataURL`, `priority` only on the avatar.
- **Preload the mono font subset** used by the loader — it is the first text painted, and a swap there is highly visible.
- `Cache-Control: public, max-age=31536000, immutable` on `/_next/static/*` (Vercel default; verify).
- Speculation Rules to prefetch the resume PDF on hover of either resume link.

### 9.5 Make measurement mandatory

Wire these in Stage 1 so regressions surface the moment they appear, not at Stage 8:

- `@next/bundle-analyzer` behind `ANALYZE=true npm run build`.
- An `npm run perf:budget` script that parses the build output and **exits non-zero if First Load JS exceeds 300 KB**. Run it in the per-stage gate.
- `web-vitals` logged to console in development.
- Chrome Performance trace with **4× CPU throttling and "Fast 4G"** at the end of Stage 3 and Stage 8. Target: no long task over 50 ms, no dropped frames while scrolling the hero.
- Commit a `lighthouserc.json` so the audit is reproducible instead of vibes-based.

### 9.6 Non-negotiable perf invariants

1. Every RAF is gated by an `IntersectionObserver`. Off-screen means zero work.
2. Every WebGL context is released on unmount (`WEBGL_lose_context`). Browsers cap contexts at ~16; leaks kill the page.
3. No allocation inside any animation loop.
4. No layout-triggering property is ever animated.
5. The model, the embedding atlas, and the search index never touch the initial bundle.
6. Mobile always renders a genuinely lighter scene — not the same scene at a lower DPR.

---

## 10. PHASE 2 — LEGENDARY EXTRAS

**Do not start any of these until Phase 1 is deployed and green.** Build them one at a time, each on its own branch, each independently revertible.

| # | Feature | Notes |
|---|---|---|
| P2-1 | **Command palette** (`⌘K` / `Ctrl+K`) | Radix Dialog + a small fuzzy matcher. Jump to sections, open socials, download resume, copy email, toggle reduced motion. Highest value-per-effort of the set — build this first. |
| P2-2 | **Live GitHub pulse** | Route Handler proxying the GitHub API with `revalidate: 3600`, feeding live stars/forks/last-commit into project cards, plus a contribution-graph strip. Requires a token in env for rate limits. |
| P2-3 | **Open source strip** | Merged PRs to external repos via the GitHub search API. Only build if there's real data — an empty section is worse than none. |
| P2-4 | **Neural pathway SVG** | An animated SVG line threading between sections, drawing itself on scroll via `useScroll` + `pathLength`. Purely decorative → `aria-hidden`. |
| P2-5 | **Horizontal scroll gallery** | For featured projects. `useScroll` + `useTransform` on `x`. Must degrade to vertical on touch; horizontal hijacking is a known a11y hazard, so gate it behind reduced-motion and provide keyboard paging. |
| P2-6 | **Live inference playground** | Full spec at **§8.2 / S8**. Build last — it's the heaviest item and the most impressive. |
| P2-7 | **Embedding atlas** | Full spec at **§8.2 / S9**. Reuses the Stage 3 OGL renderer, so build it after S8 while that code is fresh. |
| P2-8 | **Semantic portfolio search** | Full spec at **§8.2 / S10**. Ship the BM25 fallback first; add embeddings only if the bundle allows. |
| P2-9 | **Easter eggs** | Konami code → particle burst; `theme --light` in the shell → a 1-second flashbang then "nope."; `sudo` → the §8.1/S4 response. Keep them discoverable-but-invisible. |

---

## 11. PERFORMANCE, SEO & ACCESSIBILITY TARGETS

### 11.1 Budgets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse SEO | 100 |
| First Contentful Paint | < 1.5 s |
| Largest Contentful Paint | < 2.5 s |
| Time to Interactive | < 3.5 s |
| Cumulative Layout Shift | < 0.1 |
| First Load JS (gzipped) | < 300 KB |

Note: the boot loader deliberately delays perceived content. Ensure the hero markup is in the DOM behind the loader from first paint so LCP measures the real `<h1>`, not the loader.

### 11.2 Metadata (`app/layout.tsx`)

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://www.yash.systems"),
  title: "Yash Gurjar — AI & ML Engineer | Computer Vision & Deep Learning",
  description:
    "Portfolio of Yash Gurjar, an AI & ML Engineer from Jaipur specializing in Computer Vision, Neural Networks, TensorFlow, and PyTorch. Building intelligent solutions.",
  keywords: ["Yash Gurjar","AI Engineer","ML Engineer","Computer Vision Developer",
             "Deep Learning","TensorFlow","PyTorch","Jaipur","Machine Learning Portfolio",
             "Neural Networks","JECRC University"],
  authors: [{ name: "Yash Gurjar" }],
  creator: "Yash Gurjar",
  openGraph: {
    type: "website", locale: "en_US", url: "https://www.yash.systems",
    title: "Yash Gurjar — AI & ML Engineer",
    description: "Building intelligent solutions through AI/ML algorithms and deep learning architectures.",
    siteName: "Yash Gurjar Portfolio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Yash Gurjar — AI & ML Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yash Gurjar — AI & ML Engineer",
    description: "Computer Vision · Neural Networks · TensorFlow · PyTorch",
    creator: "@Yash_9724",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};
```

JSON-LD `Person` schema in a `<script type="application/ld+json">`: name, url, jobTitle "AI & ML Engineer", `alumniOf` JECRC University, `knowsAbout` [Artificial Intelligence, Machine Learning, Computer Vision, Deep Learning], `sameAs` [GitHub, LinkedIn, X].

---

## 12. MOBILE MATRIX

### 12.1 Breakpoints
Tailwind defaults — `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.

### 12.2 Adaptations

| Component | Desktop | Mobile (< md) |
|---|---|---|
| Custom cursor | Active | Not rendered at all |
| Loader | 3.5 s | 2.0 s |
| Navbar | Horizontal links | Hamburger → full-screen overlay |
| Neural canvas | 220 particles, mouse attraction | 90 particles, no attraction |
| Hero name | `text-9xl` | `text-5xl` |
| Bento grid | 3-col asymmetric | Single-column stack |
| Globe | OGL wireframe | Static SVG + CSS pulse |
| Strengths | Auto-cycling stack | Same, swipeable |
| Skills | Orbital radar | Categorized pill grid |
| Project cards | 3D tilt + spotlight | Flat cards |
| Terminal | Full shell + Enter-to-advance | Simplified chrome, explicit Submit, shell commands still available |
| Neural canvas thread | OffscreenCanvas worker | OffscreenCanvas worker (matters *more* here) |
| Glassmorphism | `backdrop-blur` on small surfaces | `backdrop-blur` disabled entirely (§9.1) |
| Live inference (P2) | Webcam + upload | Upload only |

### 12.3 Touch rules

- Every hover-revealed piece of information must have a tap equivalent. **No critical content hidden behind hover.**
- Tap targets ≥ 44×44 px.
- No horizontal-scroll hijacking on touch.

---

## 13. QUALITY GATES

### 13.1 Run after every stage

```bash
npx tsc --noEmit          # zero errors
npm run lint              # zero errors
npm run build             # succeeds, note the First Load JS number
npm run perf:budget       # fails if First Load JS > 300 KB  (§9.5)
npm run dev               # zero console errors/warnings on load
```

### 13.2 Per-stage checklist

- [ ] TypeScript clean, no `any`, no `@ts-ignore`
- [ ] Production build succeeds; bundle still under budget
- [ ] Dev console clean — no errors, no React warnings, no hydration mismatches
- [ ] Renders correctly at 375 px
- [ ] Every interactive element keyboard-reachable with a visible focus ring
- [ ] No layout shift on load
- [ ] Zero hardcoded user-facing strings — everything from `config.ts`
- [ ] Every new `useEffect` with a subscription/RAF/listener returns a teardown
- [ ] Zero allocations added inside any animation loop (§9.6)
- [ ] Committed as `feat(stage-N): …`

### 13.3 Final handoff

- [ ] `README.md` — stack, setup, env vars, content-editing guide, deploy steps
- [ ] `.env.example` committed; `.env.local` gitignored and never committed
- [ ] `public/og-image.png` (1200×630) generated
- [ ] Favicon set + `site.webmanifest`
- [ ] `app/robots.ts` + `app/sitemap.ts`
- [ ] Lighthouse report pasted for mobile and desktop
- [ ] Deployed to Vercel; production URL verified
- [ ] Contact form tested end-to-end in production

---

## 14. ANTI-PATTERNS — VIOLATIONS REQUIRE A REDO

1. **No light mode.** No toggle, no `light:` variants, no `@media (prefers-color-scheme: light)`.
2. **No hardcoded user-facing content in components.** It all comes from `config.ts`.
3. **No `any`, no `@ts-ignore`, no `as unknown as`.** Type it properly or ask.
4. **No Three.js / R3F / drei / postprocessing.** OGL only (D1, D2).
5. **No WebGL canvas rendered with SSR.** Always `next/dynamic` + `{ ssr: false }` + `<Suspense>`.
6. **No plain vertical list for Skills** on desktop. Orbital radar.
7. **No skipping the loader** — but always let the *user* skip it.
8. **No inline `style`** except for `useMotionValue` / `useTransform` values.
9. **No `left`/`top` animation.** Transform only, for GPU compositing.
10. **No forgetting mobile.** Every component verified at 375 px before its stage closes.
11. **No stock placeholder images.** Real assets, or a designed gradient placeholder.
12. **No fabricated data.** No invented star counts, accuracy figures, repos, or dates. If it isn't verifiable, omit it (D7, D8).
13. **No accessibility sacrificed for aesthetics.** Every fancy interaction needs a keyboard and screen-reader path.
14. **No `cursor: pointer` on body.** The custom cursor owns all cursor state.
15. **No large dependency for a small job.** Write the hook.
16. **No effect without cleanup.** Every listener, RAF, timer, and observer gets torn down.
17. **No claiming a gate passed without running it.** Paste real output.
18. **No silent improvisation.** Spec conflict or ambiguity → stop and ask.
19. **No `backdrop-blur` on large surfaces**, and none at all below `md` (§9.1).
20. **No allocations inside a RAF loop.** Preallocate at setup (§9.2).
21. **No permanent `will-change`.** Apply on interaction, remove after (§9.3).
22. **No heavy asset in the initial bundle.** Models, embeddings, and search indexes are click-to-load only (§9.6).

---

## 15. SUCCESS CRITERIA

The rebuild is done when all of the following are true:

1. A visitor's first eight seconds contain a boot sequence, a living neural field, and a name that arrives with weight.
2. Nothing on the page is a list of things. Every section has a shape.
3. Every number on the site is real and checkable against the GitHub repos.
4. **A reader can see a real loss curve, a real confusion matrix, and an honest limitations statement.** This is the line between "designed a site about ML" and "does ML."
5. **An engineer can type `help` and navigate the entire portfolio from the terminal.**
6. The whole site is usable with a keyboard and a screen reader, and legible with motion disabled.
7. Lighthouse mobile Performance ≥ 90 — under 4× CPU throttling — with all of the above intact.
8. The particle field cannot cause jank, because it does not run on the main thread.
9. Yash can add a project by editing one object in one file.
10. The contact form delivers a real email.

**The final test:** show it to an ML engineer for thirty seconds. If their reaction is "nice site," it failed. If it's *"wait, is that your actual confusion matrix?"* — it worked.

---

*This document is the single source of truth. Every design decision, every constraint, and every anti-pattern is above. Where it is specific, follow it exactly. Where it is silent, use judgment and say what you chose.*
