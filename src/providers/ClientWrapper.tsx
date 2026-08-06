'use client';
import React from 'react';
import BootGate from '@/components/features/boot-gate';

/**
 * A6 — lenis was removed here.
 *
 * Not a bundle-size argument: lenis hijacks native scroll, which fights
 * `content-visibility: auto` (§9.3) and makes the native
 * `animation-timeline: view()` path (§8.1/S7) unusable. Smooth scrolling is
 * `scroll-behavior: smooth` on <html> via the browser (D2).
 *
 * Now the mount point for the Stage 2 boot gate, which owns the loader and the
 * custom cursor.
 */
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <BootGate>{children}</BootGate>;
}
