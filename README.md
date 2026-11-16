# yash.systems

Portfolio of Yash Gurjar, AI & ML Engineer. Two views of one content object:

- **Brief**: server-rendered, single column, works with JavaScript off. The default under reduced motion, Save-Data, or without WebGL2.
- **Field**: a WebGL2 plot of the work (layer of the stack against time), searched with an in-browser BM25 index, with a refractive lens and one portal per project.

Every fact on the site lives in `content/data.ts` (one file per project under `content/work/`), validated with zod at build time by the schema in `content/site.ts`.

## Run

```
npm install
npm run build
npx next start
```

Set `NEXT_PUBLIC_SITE_URL` to override the canonical URL (defaults to `https://yash.systems`).

## Test

```
npm test
```

Nothing extra to install: Node runs the TypeScript directly. Checked on Node 26; older versions that cannot run `.ts` files will not work. The tests check the content against itself (the open-source summary against the PR list, the first proof against the merged PRs), the number formatting, the search ranking and the plot.

## Analytics

Vercel Web Analytics. Turn it on once: in the Vercel dashboard open the project, go to Analytics and choose Enable, then redeploy. Nothing is recorded before that, and nothing is recorded off Vercel. Vercel sets no cookie, so no consent banner is needed.

It records page views and these events: `resume-download`, `email-click`, `email-copy`, `outbound` (which link), `view-start` and `view-switch` (Field or Brief), `palette-open`, `search` (which project was reached, never the words typed) and `search-refused`. Visitors with Do Not Track or Global Privacy Control set are not counted. Custom events may need a paid Vercel plan; page views do not.

A local `next start` logs a 404 for `/_vercel/insights/script.js`. That file only exists on Vercel.

## Where things are

| Path | What |
| --- | --- |
| `content/data.ts`, `content/work/` | The content object |
| `content/site.ts` | Its schema, and the validated object for server code |
| `content/client.ts` | The same object for the lazy client chunks |
| `views/brief/` | Brief view (server components) |
| `views/field/` | Field engine: camera, physics, renderer, lens, labels |
| `portals/` | The project benches: five bespoke, one shared comparison bench |
| `lib/` | View state, navigation, BM25, governor, kinetic type, analytics (`track.ts`) |
| `tests/` | `npm test` |
| `app/not-found.tsx`, `app/error.tsx` | The 404 and error pages |
| `scripts/subset-font.py` | Rebuilds `app/fonts/archivo-latin.woff2` |

See `BUILD_LOG.md`, `DECISIONS.md` and `REVIEW.md`.
