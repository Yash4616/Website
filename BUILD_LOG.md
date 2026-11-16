# Build log

Each milestone lists what was built and what was checked. A milestone is not started while the previous one fails typecheck, lint or a production build.

Toolchain as installed: Next.js 16.4.6 (App Router, Turbopack, Cache Components and Partial Prefetching on), React 19.3.0, Tailwind CSS 4.3.3, TypeScript 5 (strict), zod 4.6.7, Node 26.13.0. The bundled docs in `node_modules/next/dist/docs` were read before writing code, as the scaffold's AGENTS.md requires.

## M0: content object and Brief view

Built
- `content/site.ts`: one zod schema and one content object. Derived helpers (`fmt`, `readingText`, `tablesFor`, `monthIndex`) so no figure is typed twice.
- `views/brief/Brief.tsx` and `views/brief/ProjectPage.tsx`: server components, no client JavaScript of their own.
- `app/page.tsx`, `app/work/[slug]/page.tsx` with `generateStaticParams` for the five instruments.
- Tokens, Brief styles and the print stylesheet in `app/globals.css`. Archivo (variable, with the width axis) and IBM Plex Mono through `next/font`, which self-hosts them at build time.

Verified
- `npx tsc --noEmit`: clean.
- `npm run lint`: clean.
- `npm run build`: compiled, 10 static pages generated (`/`, five `/work/<slug>`, not-found).
- Screenshot at 1440 x 900 of `/?view=brief`: name, title, availability, three proofs and all four buttons visible without scrolling. The button row ends at 489 px of 900.

## M1: Field camera, nodes, axes, semantic zoom, keyboard, view toggle

Built
- `components/Shell.tsx`: the Field | Brief toggle, B and Cmd/Ctrl+K, the server-rendered Field masthead, lazy Field mount.
- `lib/view.ts`: the before-paint view script, remembered choice, trip to Brief. `lib/nav.ts` and `components/RouteMarker.tsx`: portal state tied to `/work/<slug>`.
- `views/field/Field.tsx`: mounts the engine, one focusable anchor per node, arrow-key traversal, Esc steps out.
- `views/field/engine.ts`, `camera.ts`, `world.ts`, `renderer.ts`, `labels.ts`: the plot, the 9 rad/s camera, semantic zoom (names, then name with reading and sentence, then the portal past 2.4x), collision-free labels.

Verified (production build, Chrome, 1440 x 900 and 390 x 844)
- All 10 nodes have tabbable anchors with a 2 px signal focus ring; arrow keys move to the nearest node in each direction.
- Wheel zoom on Local RAG opened `/work/rag`; back closed it.
- Switch Field to Brief inside the RAG portal: 1.4 ms, landed on the RAG row. Brief to Field from the tokenizer row: 0.6 ms, camera flew to the tokenizer.
- Phone: no horizontal overflow (scrollWidth 390 at 390); tapping a node opened its portal as a sheet.

## M2: BM25 index, query line, command palette

Built: `lib/bm25.ts`, the query line in `Field.tsx` (beams with scores, aria-live announcements), `components/CommandPalette.tsx`.

Verified
- "recall": one beam to Local RAG, score 2.61; announced "1 match. Top: Evaluation-Driven Local RAG, score 2.61."
- "rust tokenizer": BPE Tokenizer 6.48. "resume": Download résumé command and Contact 3.76.
- "what is your favourite food" and "kubernetes": refused, with the nearest node named.

## M3: physics, lens, kinetic type, opening sequence

Built: `physics.ts` (fixed 120 Hz semi-implicit Euler), `lens.ts` (WebGL2 post-process with speed-driven dispersion), `lib/kinetic.ts`, `lib/magnetic.ts`, the opening (rules draw in, proofs count up, at most 1.2 s, any input skips).

Verified: lens, edges and labels visible in screenshots; the opening completes and the proofs rest on their exact values. Under reduced motion the Brief is the default, and the Field, if chosen, shows exact values with no count-up.

Not verified by me: the feel of the springs, the lens and kinetic type with a real hand on a real mouse and a real phone. The automation browser throttles animation frames, so timing there is not representative. See REVIEW.md, section 3.

## M4: portals

Built: `portals/Portal.tsx` (reading gauge, four-beat story with arrow keys and swipe, bench, spec and tables), and the five benches: `rag.tsx`, `tokenizer.tsx`, `pytorch.tsx`, `codeneuron.tsx`, `arista.tsx`.

Verified by screenshot at 1440 x 900: all five portals render with no console errors. RAG: switching to Dense moves the bars to 0.616 / 0.860 / 0.884 / 0.930 / 0.753, Dense leads R@1 and MRR, the dial reads 2/5, and the particle path skips fusion and rerank. Two layout faults found and fixed: clipped pipeline ends, and overlapping diagram labels in the diff bench.

## M5: mobile, tiers, governor

Built: touch pan with snap, pinch, tap, press-and-hold loupe, bottom bar with query and toggle, portal sheets with pull-to-close and pinch-out, tiers A/B/C and the 60-frame p95 governor in `lib/governor.ts`.

Verified at 390 x 844: Tier B chosen, no horizontal overflow, bottom bar in reach. Faults found and fixed: overlapping x-axis labels, and node labels clipped at the right edge.

## M6: accessibility, metadata, print, review

Built: Person JSON-LD, Open Graph image, `robots.txt`, `sitemap.xml`, `/llms.txt`, per-route titles and descriptions, the one-page print stylesheet.

Verified
- Lighthouse on `/?view=brief`, mobile profile: performance 96, accessibility 100, best practices 100, SEO 100. CLS 0, TBT 30 ms, FCP 0.9 s, LCP 2.7 s.
- Field, portal and palette JavaScript: 36 KB gzipped in total, against a 150 KB budget.
- Print to PDF of the Brief: 1 page.
- `/work/codeneuron` served as plain HTML contains the limitation and the co-developer credit.
- `/llms.txt` and `/opengraph-image` return 200.

## Tally

| Milestone | tsc | lint | build | browser check |
| --- | --- | --- | --- | --- |
| M0 | pass | pass | pass | pass |
| M1 | pass | pass | pass | pass |
| M2 | pass | pass | pass | pass |
| M3 | pass | pass | pass | partial: feel not judged |
| M4 | pass | pass | pass | pass, after 2 fixes |
| M5 | pass | pass | pass | pass, emulated touch only |
| M6 | pass | pass | pass | pass |

## Hand-back

- Résumé copied to `public/Yash_Gurjar_Resume.pdf`.
- Canonical URL set to https://yash.systems.
- CodeNeuron credit wording confirmed by Yash.
- Favicon replaced with the instrument glyph; scaffold README replaced.

Still open: layer placements (Yash will review), real tokenizer boundaries for the sample sentence.

## Content round 2 (15 Nov 2026)

Built
- Each project now lives in its own file under `content/work/`, naming the repo docs it was checked against.
- New full write-ups with portals: Oracle (continual learning), Object Detection and Segmentation, WEAR activity recognition (Kaggle). A shared comparison bench (`portals/compare.tsx`) renders their recorded numbers.
- Enriched from each repo: RAG (pipeline, gold-set mix), tokenizer (training run, profiling fix), PyTorch (test counts for #193593), CodeNeuron (grading models, runner limits, running cost), Arista (the brain repo's runtime choice, status, evaluation sets and measured latency gap).
- Open source: Kubernetes website #56506 added (open, checked on GitHub 15 Nov 2026); Hugging Face PRs now link to GitHub. Certificates added to Education; skills aligned with the résumé.
- Removed: Arista Desktop, Abuse-Ring Sentinel and the "Smaller builds" section.
- Spacing: nodes spread along the layer axis, edges only where a pair shares 2+ distinctive skills or it is a node's strongest link, and the lens shows one node's measured layer with nothing else under it.

Verified
- `tsc`, `lint`, `build`: pass, 17 static pages (8 project pages).
- Screenshots at 1440 x 900 and 390 x 844: no overlapping labels; no horizontal overflow on the phone.
- Portals for Oracle and WEAR render with no console errors.
- Printed Brief: 1 page (project summaries are left out of print only).

## Round 3 (15 Nov 2026)

Built
- Lens: the readout is back on the node instead of the glass, with no backing, and crossfades (rate 12/s) when the lens moves between nodes; other glyphs and labels under the glass fade out by the same amount.
- Competitions section in the Brief (after Open source), a Kaggle row in the Field's Background card, search terms for it and an llms.txt section. Schema: `competitions`, with rank <= teams enforced.
- Print: competitions in two columns, one line each; degree and school on one line; closing line and contacts on one line; page margin 10 mm top and bottom.

Verified
- `tsc`, `lint`, `build`: pass.
- Lens checked in the browser on Local RAG and WEAR: no backing, readout centred on the node, no other glyphs inside the glass.
- Field search for "kaggle" returns WEAR and Background.
- Printed Brief: 1 page, with no spare line; the next addition to the Brief needs a print trim.

## Round 4 (15 Nov 2026)

Built
- WEAR Activity Recognition replaced by Kaggle Competitions (`content/work/kaggle.ts`): all 7 entries, a Standings bench group plus the three WEAR groups, and WEAR’s write-up as the documented entry. `/work/wear` redirects (308) to `/work/kaggle`.
- `CompetitionList` (components/) renders the record in the Brief row, the project page and the Field portal. The standalone Competitions section and the Background card’s Kaggle row are gone. Schema: `competitions` is an optional field on a project, with a nullable rank for unranked entries.

Verified
- `tsc`, `lint`, `build`: pass, 17 static pages (8 project pages).
- Brief row and Field portal show 7 entries; Standings bars 61, 54, 49, 43, 21, 18%, matching the top % figures.
- `/work/wear` returns 308 to `/work/kaggle`.
- Printed Brief: 1 page.
- Found, not fixed: a Field tab opened in the background can fit the plot as if the intro card were absent (axes behind the card). A reload in the foreground fits correctly.
- Follow-up: Biohub, Nemotron and PTCG removed at Yash’s request; 4 entries listed. Headline reading is now WEAR’s 0.72114 (a count of entries would be wrong with 3 left out). Span now Aug to Nov 2026.

## Round 5: audit, loading time, failure handling (16 Nov 2026)

Measured with headless Chrome over the DevTools protocol: cold load, cache off, 412 px wide, 4x CPU slowdown, slow 4G (1.6 Mbps, 150 ms latency). The build before this round and the build after it were served side by side and loaded alternately, 9 runs each, medians below. Lighthouse was not run this round, so there are no new Lighthouse scores.

| Page | First paint, before | after | Transferred, before | after |
| --- | --- | --- | --- | --- |
| `/` in the Brief | 1,164 ms | 952 ms | 291 KB | 268 KB |
| `/` in the Field | 840 ms | 568 ms | 312 KB | 305 KB |
| `/work/rag` in the Brief | 1,016 ms | 768 ms | 290 KB | 265 KB |

The Field is drawn at 2,687 ms against 2,801 ms. Blocking time did not change beyond run-to-run noise (about 230 to 440 ms at 4x slowdown, both builds); it is React and Next.js starting up, not site code.

Built
- Archivo limited to the weights and widths in use: 90 KB to 57 KB (`app/fonts/`, `scripts/subset-font.py`).
- The content object left the HTML: `content/data.ts`, `content/client.ts`, and the Field and palette entry files that bring it in their own chunks.
- Stylesheet inlined; the Field's chunk is requested as soon as the shell's script runs instead of after hydration; `will-change` only on magnetic controls in the Field.
- `app/not-found.tsx` and `app/error.tsx`, with `BriefOnly`. Before, an unknown address showed the Field's home view when the Field was the visitor's view, and Next's default page in the Brief.
- `/work/<unknown>` returns 404 (it returned 200 with a not-found body).
- Error boundaries round the Field and the palette; WebGL context loss handled in the renderer.
- Project pages carry the share image again (their `openGraph` had replaced the layout's and dropped it), plus `og:type`, `og:site_name` and a `CreativeWork` JSON-LD block. `twitter:creator`, an Apple touch icon, security headers, no `X-Powered-By`.
- Project pages: story labels are `h2` (they were `h3` straight after the `h1`). The skip link is hidden in the Field, where its target is.
- A guard for the round 4 fault (a Field tab opened in the background fitting the plot under the plate): the layout measure now ignores a zero-sized stage, watches the stage as well as the plate, and runs again when the tab becomes visible.

Verified
- `tsc`, `lint`, `build`: pass, 18 static pages.
- In the browser, desktop and 390 x 844: Field boots and the proofs rest on 3, 0.94 and 60+; lens, query ("recall" ranks Local RAG 2.73), palette, portal open and Esc; no console errors; no horizontal overflow on the phone.
- `/nope` and `/work/nope`: 404, the new page in both views; "Go to the start" returns to the Field and the remembered view is unchanged.
- WebGL context lost and restored through `WEBGL_lose_context`: the Field redraws.
- With the Field's chunks blocked, `/?view=field` lands in the Brief.
- Printed Brief: 1 page.

Not verified
- The background-tab fault itself: it could not be reproduced in a headless browser, so the guard is untested against the real case.
- Layout shift under throttling on `/work/rag` reads 0.029 against 0.016 before (0 unthrottled, both): text now paints before the font arrives more often. Both are well inside the 0.1 limit.
- Real devices, as before.

## Round 6: analytics, tests, palette button, lens readout (16 Nov 2026)

Built
- `lib/track.ts`: page views and nine named events to Umami, wired through `RouteMarker`, the shell, the palette and the Field's search. `.env.example`.
- `tests/` and `npm test`: 21 tests over content consistency, formatting, search and the plot.
- A Menu button for the command palette beside the view toggle; the phone bottom bar re-spaced for it.
- Lens readout wrapped to the flat part of the glass.
- The folder is a git repository with a first commit.

Verified
- `tsc`, `lint`, `build`, `npm test` (21 of 21): pass.
- A build with a test website ID, opened on a non-local hostname: one page view per route (`/`, `/work/rag`, `/`), and each event fired once with the documented body shape (`type: "event"`, payload `website, hostname, screen, language, title, url, referrer`, plus `name` and `data`). With Do Not Track on: 0 requests. On localhost: 0. The shipped build, with no ID: 0, and the test ID is not in its files.
- Menu opens the palette on desktop and at 390 x 844; controls there are 44 px tall and at least 48 wide; no horizontal overflow; the query placeholder is not clipped.
- Lens over Local RAG, CodeNeuron and Oracle: every line inside the glass.

Not verified
- That Umami accepts the requests: there is no Umami account yet, so they were inspected leaving the page, not arriving. After setting the ID, load the live site once and check the dashboard's realtime view.

### Round 6 follow-up: analytics moved to Vercel (16 Nov 2026)

The Umami sender described above was replaced with Vercel Web Analytics (`@vercel/analytics` 2.0.1) before deploying; the event names are unchanged and `.env.example` no longer has analytics settings. One fault found and fixed on the way: the first event, `view-start`, fired before the package had created its queue and was lost.

Verified: `tsc`, `lint`, `build`, `npm test` pass. In a local production build the page view and each event reach the package's queue in the expected shape; with Do Not Track on, no event is queued and the page-view filter is registered.

Not verified: anything past the queue. Vercel's script only exists on a Vercel deployment, so nothing was seen arriving in a dashboard, and the Do Not Track filter for page views runs inside that script.
