/**
 * Registration marks — REBUILD.md §2.4/4, §7/1.
 *
 * L-shaped corner ticks, as on a technical drawing or a printer's proof sheet.
 * §1.3 puts it plainly: "That single detail does more for the aesthetic than
 * any effect, and costs four spans."
 *
 * Drawn with borders on four absolutely-positioned spans rather than SVG or a
 * background image — it is four elements, scales with any container, inherits
 * colour, and costs nothing to render. `aria-hidden` throughout: these are
 * pure apparatus and announcing "corner tick" four times per figure would be
 * hostile to a screen-reader user.
 *
 * Server component. Ships no JavaScript.
 */

const CORNERS = [
  { key: 'tl', position: 'top-0 left-0', edges: 'border-t border-l' },
  { key: 'tr', position: 'top-0 right-0', edges: 'border-t border-r' },
  { key: 'bl', position: 'bottom-0 left-0', edges: 'border-b border-l' },
  { key: 'br', position: 'bottom-0 right-0', edges: 'border-b border-r' },
] as const;

export function RegistrationMarks({
  size = 10,
  className = 'border-rule-strong',
}: {
  /** Arm length in px. 10 for figures, 14 for the page frame. */
  size?: number;
  /** Border colour utility. Defaults to the stronger of the two rule weights. */
  className?: string;
}) {
  return (
    <span aria-hidden="true">
      {CORNERS.map((corner) => (
        <span
          key={corner.key}
          className={`pointer-events-none absolute ${corner.position} ${corner.edges} ${className}`}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}

/**
 * A framed region with registration marks at its corners — the standard
 * treatment for a figure (§5). The parent establishes the positioning context
 * so the marks sit exactly on the corners.
 */
export function RegisteredFrame({
  children,
  className = '',
  markSize = 10,
}: {
  children: React.ReactNode;
  className?: string;
  markSize?: number;
}) {
  return (
    <div className={`relative ${className}`}>
      <RegistrationMarks size={markSize} />
      {children}
    </div>
  );
}

export default RegistrationMarks;
