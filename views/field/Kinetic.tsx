"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Pieces } from "@/components/Pieces";
import { getPerWord, registerKinetic, subscribePerWord } from "@/lib/kinetic";

type Props = {
  pieces: string[];
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  id?: string;
  /** Chromatic fringing on hover, for DOM headings inside portals. */
  fringe?: boolean;
  /** Draw the boundaries between pieces, as the compression bench does. */
  showBoundaries?: boolean;
};

/**
 * A line of type that parts along its pieces when the pointer moves through
 * it. Tier B moves whole words instead of sub-word pieces.
 */
export function Kinetic({ pieces, as = "span", className, id, fringe = false, showBoundaries = false }: Props) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>(null);
  const perWord = useSyncExternalStore(subscribePerWord, getPerWord, () => false);
  const key = pieces.join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerKinetic(el, fringe);
  }, [fringe, key, perWord]);

  const cls = ["kinetic", showBoundaries ? "kinetic-bounds" : "", className ?? ""].filter(Boolean).join(" ");
  const Tag = as;
  return (
    <Tag ref={ref} id={id} className={cls}>
      <Pieces pieces={pieces} />
    </Tag>
  );
}
