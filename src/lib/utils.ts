import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * REBUILD.md §2.2 requires correct marks — en dash for ranges, `×` for
 * multiplication, `−` for minus, `·` as separator, curly quotes. "A hyphen
 * doing a dash's job is a visible error at this level of finish."
 *
 * These helpers apply the rule at render, so it does not depend on whoever
 * edits the config reaching for U+2013 by hand.
 */

/** 2023–2027, with a real en dash. */
export function range(from: number | string, to: number | string): string {
  return `${from}–${to}`;
}

/**
 * Splits a value like "16.0 GB" or "88.22%" into number and unit, so the unit
 * can be set smaller and dimmer than its value (§2.2). Returns a null unit when
 * the value is not of that shape, and the caller renders it whole.
 */
export function splitUnit(value: string): { value: string; unit: string | null } {
  const match = /^(-?[\d,]+(?:\.\d+)?)\s*(.+)$/.exec(value.trim());
  if (!match) return { value, unit: null };
  return { value: match[1], unit: match[2] };
}
