/**
 * Registration ticks at the four page corners — REBUILD.md §5, §2.4/4.
 *
 * Fixed to the viewport, which is the "page" on the web. Purely apparatus, so
 * `aria-hidden` and `pointer-events: none`; it must never intercept a click or
 * announce itself.
 */
export function PageFrame() {
  return (
    <div className="page-frame" aria-hidden="true">
      <span className="left-0 top-0 border-l border-t" />
      <span className="right-0 top-0 border-r border-t" />
      <span className="bottom-0 left-0 border-b border-l" />
      <span className="bottom-0 right-0 border-b border-r" />
    </div>
  );
}

export default PageFrame;
