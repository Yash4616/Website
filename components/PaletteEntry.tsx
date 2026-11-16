"use client";

import { site } from "@/content/client";
import type { View } from "@/lib/view";
import CommandPalette from "./CommandPalette";

type Props = {
  view: View;
  onSwitch: (next: View) => void;
  onClose: () => void;
};

/** The command palette with its content, loaded together on first use. */
export default function PaletteEntry(props: Props) {
  return <CommandPalette site={site} {...props} />;
}
