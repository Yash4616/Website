# Decisions

Calls made where the brief was silent or left room. Each one says what was decided and why.

## Architecture

- **Content is validated on the server only.** `content/data.ts` holds the content object as plain data and `content/site.ts` holds the zod schema and parses it. Client code imports types from `site.ts` (erased at build) and helpers from `content/format.ts`, which has no zod import, so the validator never ships to the browser.
- **The content reaches the browser in the lazy chunks, not in the HTML.** Until round 5 the layout passed the whole parsed object to the client shell as a prop, which wrote it into every HTML document: 28 KB compressed for the home page, about half of it this one prop. The shell now receives `person` only (what the Field masthead needs), and the Field and the command palette import the object from `content/client.ts` inside their own chunks. The home document without the stylesheet is 15 KB. The schema has no defaults or transforms, so the object the client reads is equal to the one the server validated; adding either to the schema would break that and should move the client back to a server-passed value.
- **Field or Brief is decided before first paint** by an inline script in `<head>` (`VIEW_SCRIPT` in `lib/view.ts`) that sets `data-view` on `<html>`. CSS does the swap, so switching is one attribute write: measured at about 1 to 2 ms, against the 100 ms budget. With JavaScript off the attribute is never set, the Brief shows, and a `<noscript>` style hides the view toggle.
- **The Field masthead ("plate") is server-rendered** inside the shell, so a cold load of the Field view shows the name, title, availability, three proofs and the résumé button before any canvas code arrives. Nothing shifts when the Field mounts (Lighthouse CLS 0).
- **Portal URLs are real routes.** `/work/<slug>` is a statically generated page that renders the project's Brief section. In the Field view the same URL opens the portal over the plot. Each page renders a small `RouteMarker` that reports its slug, so the back button, direct links and client navigation all agree. `usePathname` is not used, because under Cache Components it would need a Suspense boundary in the root layout.
- **Closing a portal** uses `history.back()` when the portal was opened from inside the site, so the back stack does not fill with duplicate entries. A portal opened from a direct link closes by navigating to `/`.
- **The Field, the portals and the palette are separate lazy chunks.** In the Brief view none of them load until asked for.

## The plot

- **Axes.** X is the layer of the stack, five named columns from "below Python" to "product surface". Y is time from January 2025 to June 2027, linear. Each node is plotted at its start month and draws a vertical span to its end month. Ongoing work ("present") draws to November 2026 (`field.asOf`) with an open end; finished work has a cap.
- **Node positions on the layer axis** (`plot.layer`) are my placement, not facts: tokenizer 0.35 (Rust, below Python), PyTorch 0.9 (framework), Oracle 1.85 and Object Detection 2.1 (model), Kaggle 2.5, RAG 3.0 (system), CodeNeuron 3.7, Arista 3.95 (product surface). Yash will review these; each lives in its file under `content/work/`.
- **Stations.** Background sits at February 2025 near the origin, because the axis starts in 2025 and education spans 2023 to 2027; its card gives the real years. Contact sits at January 2027, the start of the internship window, with its span to June 2027 drawn in the signal colour, because it is the call to action.
- **The plot fills the screen.** The height of a month is chosen so the plot has the proportions of the free screen area, so the overview fills a phone as well as a desktop. Time stays linear within any one layout.
- **Ring arcs.** An instrument's ring is drawn as far round as the work is complete. Only Arista has a task count (137 of 164), so it is the only partial ring. Others are full.
- **Edges** join nodes that share at least one skill from the skills list, counting only skills held by at most half the nodes: Python sits on 7 of 10 and would join everything to everything. Under the lens an edge shows the shared skills.

## Retrieval

- **BM25 parameters:** k1 1.2, b 0.75. The name counts three times, the short name and skills twice, everything else once.
- **Match threshold 1.2.** One rare term matching once clears it. Below it the Field refuses: "No instrument matches that. Nearest: X." The nearest node is the best sub-threshold BM25 hit, or failing any term overlap, the best character-trigram match.
- **Prefix matching** on the word still being typed, so results move on every keystroke.
- **Typing anywhere opens the query line, except B**, which is the view-switch shortcut. To start a query with B, press `/` first or click the query line. The hint line says "B for brief".

## Motion and rendering

- **The lens shows the measured layer.** Inside the lens the scene is drawn a second time with each node's reading and limitation in place of its name. The dome is flat in the middle, so the reading stays legible, and bends at the rim, where the dispersion appears. Dispersion is `0.002 + 0.006 x normalised pointer speed`, as specified; the pointer-speed normalisation uses the same 2000 px/s clamp as the kinetic type.
- **The opening count-up runs on the plate's three proofs.** At the overview zoom the canvas shows names only, so the readings that are on screen during the opening are the proofs. The canvas labels fade in with a stagger.
- **Kinetic type** is applied to the plate name, every portal heading, and the compression bench's sample sentence. Tier B moves whole words instead of sub-word pieces.
- **Chromatic fringing** on portal headings uses one SVG filter whose red and blue offsets are set from pointer speed, capped at 3 px. It is removed entirely at rest, so the heading is crisp.
- **Oracle was corrected from its own research log** (Oracle/RESEARCH_LOG.md, 2026-07-07 and 2026-07-10). The brief gave 0.940 over 3 seeds; 0.940 is the single-seed gate run, and the 3-seed replication is 0.912 ± 0.062, which is now the reading. "Zero forgetting" became "without losing its base capability" (the canary probe never fell below base), because skills did interfere slightly. Status changed from research to self-study.
- **Abuse-Ring Sentinel and Arista Desktop were removed** at Yash's request, and the "Smaller builds" section with them. Oracle became a full project, so the Field now has 8 instruments and no satellites.
- **Each project lives in its own file** under `content/work/`, with a comment naming the repo docs its facts came from. The vault in C:DevYash was used as an index only; every number was checked against the project's own docs, because the vault disagreed with them in places (Oracle's seeds, WEAR's best score).
- **Object Detection uses the generated results file.** Its README and report give mean IoU 96.04%, but `results_report.txt` gives 0.9595 with different per-class values, so they are two runs. The site uses the machine-generated file.
- **WEAR became one entry in a Kaggle Competitions project.** At Yash’s request the WEAR project was replaced by “Kaggle Competitions” (`content/work/kaggle.ts`, `/work/kaggle`; `/work/wear` redirects there permanently). It lists 4 of the 7 competitions on his Kaggle profile: Autonomous Agent Prediction, ROGII, UMUD and WEAR. Biohub (3,081 of 3,947), Nemotron (3,429 of 4,185) and PTCG (unranked) were removed at his request, so nothing on the site counts entries. Each shows rank, field size, type and a top % from `topPercentText`, rounded up so it never reads better than it was; the Standings bench shows the mirror figure (share of the field below, rounded down). The headline reading is WEAR’s measured 0.72114 public-leaderboard macro F1 with its final standing (130 of 232) beside it, and WEAR’s story, finding, specification rows and bench groups carry over unchanged. UMUD describes what was built, from its notes; Autonomous Agent and ROGII have no notes and state the competition’s own task. UMUD’s rank is the standing at the close on 14 Nov 2026 (private leaderboard due 21 Nov) and is marked provisional.
- **The Kaggle span starts in August 2026** because Kaggle listed ROGII and Autonomous Agent as ended about 3 months before 15 Nov 2026. It is an estimate from that listing, not a logged date.
- **The printed Brief drops each project's one-line summary** to stay on one A4 page with 8 projects; name, dates, reading and limitation all print.
- **New benches share one component**, a comparison bench: switchable groups of recorded values, each on its own axis, with the axis start stated whenever it is not zero.
- **Each PR in the Brief names its project** (PyTorch or Hugging Face Hub) under the PR number, above the area tag.
- **Satellites and stations open a card**, docked bottom right on desktop and as a bottom sheet on a phone, rather than a portal, as the brief specifies.
- **Reduced motion** keeps the Field available if chosen, but switches off the lens, kinetic type, magnetic controls, camera flights, count-ups and bench loops. The Brief is still the default under reduced motion.
- **The lens layer renders at full resolution in every tier.** The brief asks for a half-resolution lens pass in Tier B, but at half resolution the measured readout under the lens blurs. The layer only draws the square under the glass, so full resolution costs little; Tier B still caps the pixel ratio at 1.5, draws fewer edges and moves type per word.
- **The lens readout names the node** (its short name) above the reading. It sits on the node, with no backing, and fades in over about a quarter second. A version centred on the glass with a solid backing read as a hover card stuck to the pointer, and lost the reveal of the dome sliding over a node; Yash called it buttony, so it was reverted.
- **Tier choice at start:** Tier B for touch devices, small screens, integrated or software GPUs, and 4 or fewer CPU cores. Otherwise Tier A. The governor can only step down, and the floor is kept in `sessionStorage`.

## Benches

- **Retrieval bench.** Each bar has a tick at the best value across the three configurations, labelled with the winner. With Hybrid + rerank selected, the R@1 tick reads "Dense 0.616", so Dense's R@1 lead is visible without switching. Hybrid has no generation measurement in the facts, so its dial reads "not measured" rather than a value.
- **Compression bench.** Horizontal bars, not columns, because 17 language names do not fit as column labels on a phone. "Below the rule" therefore reads as "short of the rule" to the left. The two short bars are hatched and their values set in bold, at the same weight as the rest.
- **Diff bench.** A class diagram that springs between the two structures. The four PyTorch PR cards include the withdrawn one, drawn with a dashed border.
- **Grading loop.** A schematic. Which question fails varies between real runs; here Q3 fails one criterion so the refine path is visible, and the caption says so.
- **Face bench.** An original study written for this page: one SDF orb, two capsule eyes, four poses. It is labelled as not the production face. The frame-time readings are the recorded production numbers, not measurements of the study.

## Copy

- First person in project copy ("I am Lead AI Developer", "Closed, withdrawn by me"), because the site speaks for Yash. No adjectives about him.
- `fmt(0)` is the left end of every gauge. Every other number comes from the content object. Layout coordinates and animation timings are not facts and live in config modules or at the top of each bench file.

## Toolchain

- Next.js 16.4.6 with Cache Components and Partial Prefetching as scaffolded, React 19.3, Tailwind 4.3 (used for the token layer only; the styling is plain CSS), zod 4.6.7. No other runtime dependency.
- IBM Plex Mono comes through `next/font/google`, which downloads it at build time and serves it from this origin. Archivo is a local file (`app/fonts/archivo-latin.woff2`, through `next/font/local`): the Latin subset limited to weights 400 to 700 and widths 100% to 125%, which is all the site sets. It is 57 KB against 90 KB for the full design space, and was the largest single file on the page. `scripts/subset-font.py` rebuilds it; a weight below 400 or above 700, or a width under 100%, needs a new subset. No request goes to a font host at runtime. The OG image reads two OFL font files from `assets/fonts`.
- **The stylesheet is inlined** (`experimental.inlineCss`). See the measurement in `next.config.ts` and BUILD_LOG round 5. If the flag is ever removed, the site works the same with one more request.
- **A page that only exists in the Brief shows the Brief.** The 404 and error pages render in the Brief, which the Field view hides, so `BriefOnly` switches the view while such a page is mounted, without changing the remembered choice, and switches back on leaving.
- **Unknown project slugs return 404.** `/work/[slug]` sets `ensureStatic = "navigation"`, so a request for an unlisted slug waits for the render and `notFound()` can set the status. Without it the shared shell is sent first under a 200.
- **Failure costs one layer.** An error boundary wraps the Field and another the palette. If the Field throws or its chunk cannot be fetched, the session falls back to the Brief. A lost WebGL context is rebuilt when the browser returns it.
- **Analytics is Vercel Web Analytics**, at Yash's choice, since the site deploys there. `<Analytics />` in the shell counts page views; `lib/track.ts` adds named events through the same package. A first version sent to Umami from the site's own code; it was replaced before it shipped. Do Not Track and Global Privacy Control are honoured: events are not sent, and page views are dropped by `beforeSend`. Search reports the project reached, not the text typed. `@vercel/analytics` is the one runtime dependency added.
- **The command palette has a button** ("Menu", beside the view toggle). It was Ctrl+K only, which nobody on a phone could press and nothing on screen mentioned.
- **The lens readout is wrapped to the flat part of the glass.** Each limitation line is as wide as the dome is flat at that height (80% of the radius), so the last line no longer runs into the bend; a long limitation ends in an ellipsis sooner.
- **Tests use Node's own runner** (`npm test`), with a 20-line resolver for the `@/` alias instead of a test framework: no new dependency.
- **Security headers** are set in `next.config.ts`. There is no Content-Security-Policy: the pages are static with inline scripts, so a strict policy would need a nonce and a render per request.
- The canonical URL for metadata, the sitemap and `llms.txt` is `https://yash.systems`. `NEXT_PUBLIC_SITE_URL` overrides it.
- The favicon is the instrument glyph from the Field (ring and core), replacing the scaffold default.
