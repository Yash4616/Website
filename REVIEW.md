# Ten-minute review

Run these yourself before the site goes out. Start it with:

```
npm run build && npx next start
```

Then open http://localhost:3000. The canonical URL defaults to https://yash.systems.

## 1. The five-second test (1 minute)
- [ ] Open `/?view=brief` in a 1440 x 900 window. Without scrolling you see your name, title, availability, the three proofs and the Download résumé button.
- [ ] Click Download résumé. It downloads `Yash_Gurjar_Resume.pdf`.

## 2. Facts (2 minutes)
- [ ] Read the Brief top to bottom. Every number is one you recognise, and every project shows its limitation next to its reading.
- [ ] Check the layer placements in `content/site.ts` (`plot.layer` on each node). They are my placement, not facts.

## 3. The Field (3 minutes)
- [ ] Open `/` (or press B in the Brief). The rules draw in and the proofs count up in about a second.
- [ ] Move the mouse: the lens follows, and a node under it shows its reading and limitation. Move fast: the colour fringe at the lens rim widens.
- [ ] Scroll to zoom in: names gain a reading and a sentence. Keep zooming on a node and its portal opens.
- [ ] Type `recall`. A beam runs from the query line to Local RAG with a score. Press Enter to fly there.
- [ ] Type `kubernetes`. The Field refuses and names the nearest node.
- [ ] Press Tab until a node has an orange ring, then use the arrow keys to move between nodes. Enter opens it; Esc steps back out.

## 4. Portals (2 minutes)
- [ ] In the RAG portal, switch to Dense. Dense leads R@1, and the refusal dial drops to 2/5.
- [ ] In the tokenizer portal, Hindi and Arabic fall short of the 1.00x rule.
- [ ] Press B inside any portal. The Brief opens at that project's row. Press B again and you are back in the Field.
- [ ] Press the browser's back button inside a portal. It closes.

## 5. Everywhere (2 minutes)
- [ ] Ctrl+K (Cmd+K on a Mac) opens the palette from the Brief, the Field and a portal. "Copy email" copies your address.
- [ ] Open the site on your phone. Drag pans (and, once you have zoomed in, settles on the nearest node), pinch zooms, tap opens, press and hold shows the loupe above your finger. A portal is a sheet: pull it down to close. Nothing scrolls sideways.
- [ ] Turn JavaScript off and reload `/` and `/work/rag`. Everything is readable.
- [ ] Print the Brief (Ctrl+P). It fits on one A4 page.
- [ ] Tap Menu on your phone. The palette opens.
- [ ] Open an address that does not exist, such as `/nope`. You get the 404 page, in either view.

## 6. After deploying with analytics on (1 minute)
- [ ] Open the live site, download the résumé, then check the project's Analytics tab in Vercel: one visitor, a page view and, under Events, `resume-download`.
