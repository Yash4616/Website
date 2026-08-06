'use client';
import React from 'react';

/**
 * A6 — lenis was removed here.
 *
 * Not a bundle-size argument: lenis hijacks native scroll, which fights
 * `content-visibility: auto` (§9.3) and makes the native
 * `animation-timeline: view()` path (§8.1/S7) unusable. Smooth scrolling is
 * `scroll-behavior: smooth` via the browser (D2).
 *
 * This wrapper is deliberately kept as the mount point for the Stage 2 loader
 * gate and custom cursor.
 */
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
