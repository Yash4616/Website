import { Fragment } from "react";

/**
 * Markup for a line of kinetic type. No hooks, so it renders on the server.
 * The accessible text is the whole string; the pieces are presentation only.
 * A piece that starts with a space begins a new word.
 */
export function Pieces({ pieces }: { pieces: string[] }) {
  const words: string[][] = [];
  for (const piece of pieces) {
    if (words.length === 0 || /^\s/.test(piece)) words.push([piece.trimStart()]);
    else words[words.length - 1].push(piece);
  }
  return (
    <>
      <span className="sr-only">{pieces.join("")}</span>
      <span aria-hidden="true" className="kinetic-pieces">
        {words.map((word, w) => (
          <Fragment key={w}>
            {w > 0 ? " " : null}
            <span className="word" data-word="">
              {word.map((piece, p) => (
                <span key={p} className="piece" data-piece="">
                  {piece}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
