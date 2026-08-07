import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { siteConfig } from '@/data/config';
import './globals.css';

/**
 * REBUILD.md §2.2 — two families, no third.
 *
 * Archivo is a sturdy grotesk with a real width axis. That matters on a dark
 * ground: high-contrast serifs optically thin out and shimmer on near-black,
 * which is why this direction uses a grotesk for display rather than the serif
 * a light document would want. The width axis is loaded so the masthead can be
 * set in Archivo Expanded 700 (§5).
 *
 * Inter, Space Grotesk, Poppins, and Montserrat are banned by §3/11.
 */
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.meta.url),
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
  alternates: { canonical: '/', types: { 'text/plain': [{ url: '/llms.txt', title: 'LLMs.txt' }] } },
  openGraph: {
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    url: siteConfig.meta.url,
    siteName: 'yash.systems',
    type: 'website',
    images: [{ url: '/opengraph-image' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-plane-2 focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
