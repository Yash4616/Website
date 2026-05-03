"use client";
import React from 'react';
import useLenis from '@/lib/useLenis';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useLenis();

  return <>{children}</>;
}
