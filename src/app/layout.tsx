import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import ClientWrapper from '@/providers/ClientWrapper';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '@/data/config';

interface RootLayoutProps {
  children: React.ReactNode;
}

// D3 — Inter stays. Zero churn, already loaded, excellent at display sizes.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-sans',
});

// D4 — JetBrains Mono. Chosen over Geist Mono for readability at 12–14px, which
// is exactly where the loader and terminal live.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-mono',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#030303',
};

// §11.2. Note: og:image and twitter:image are NOT declared here — they are
// produced by the app/opengraph-image.tsx file convention (A12), which Next
// injects automatically. Declaring them in both places emits duplicate tags.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.meta.url),
  title: {
    default: siteConfig.meta.title,
    template: '%s | Yash Gurjar',
  },
  description: siteConfig.meta.description,
  keywords: siteConfig.meta.keywords,
  authors: [{ name: 'Yash Gurjar', url: siteConfig.meta.url }],
  creator: 'Yash Gurjar',
  manifest: '/manifest.json',
  alternates: {
    canonical: siteConfig.meta.url,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.meta.url,
    siteName: 'Yash Gurjar Portfolio',
    title: 'Yash Gurjar — AI & ML Engineer',
    description:
      'Building intelligent solutions through AI/ML algorithms and deep learning architectures.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yash Gurjar — AI & ML Engineer',
    description: 'Computer Vision · Neural Networks · TensorFlow · PyTorch',
    creator: '@Yash_9724',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// JSON-LD Person schema (§11.2), driven from config so it cannot drift.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: siteConfig.hero.name,
  jobTitle: siteConfig.hero.title,
  url: siteConfig.meta.url,
  email: siteConfig.contact.email,
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'JECRC University',
  },
  sameAs: siteConfig.social.map((link) => link.href),
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision',
    'Deep Learning',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'India',
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  // Resolved on the server. It must NOT appear as `process.env.NODE_ENV` inside
  // the inline script below: that string is injected verbatim via
  // dangerouslySetInnerHTML, so Next's build-time substitution never touches it
  // and the browser throws `ReferenceError: process is not defined` on every
  // load. Interpolating the resolved boolean is the fix.
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    // D9 — dark is the only theme. `className="dark"` is set statically here;
    // there is no theme runtime, no toggle, and no light variant (A7, AP-1).
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        {/* Skip navigation link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>
        <ClientWrapper>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            {!isProduction ? (
              <div className="fixed bottom-4 right-4 z-[100] rounded-md border border-border/60 bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
                Dev mode: service worker disabled
              </div>
            ) : null}
            <main id="main-content" className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ClientWrapper>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (${isProduction}) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                } else {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                    });
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      keys
                        .filter(function(key) { return key.startsWith('yash-portfolio-cache-'); })
                        .forEach(function(key) { caches.delete(key); });
                    });
                  }
                }
              }
            `,
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
