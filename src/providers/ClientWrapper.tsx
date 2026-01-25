"use client";
import { ReactLenis } from '@studio-freight/react-lenis';
import React from 'react';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
      {children}
    </ReactLenis>
  );
}
