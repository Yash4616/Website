interface RootLayoutProps {
  children: React.ReactNode;
}
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import ClientWrapper from '@/providers/ClientWrapper';
import { Analytics } from "@vercel/analytics/next"

// Optimize font loading by defining display strategy
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use 'swap' to prevent FOIT (Flash of Invisible Text)
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: {
    default: 'Yash Gurjar | AI & ML Engineer',
    template: '%s | Yash Gurjar',
  },
  description: 'Portfolio of Yash Gurjar, AI & ML Engineer specializing in Computer Vision, Neural Networks, Deep Learning, and TensorFlow. Building intelligent solutions for tomorrow\'s challenges.',
  keywords: ['AI Engineer', 'ML Engineer', 'Machine Learning', 'Computer Vision', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks', 'Portfolio', 'Jaipur', 'Rajasthan', 'India'],
  authors: [{ name: 'Yash Gurjar', url: 'https://yash.systems' }],
  creator: 'Yash Gurjar',
  manifest: '/manifest.json',
  metadataBase: new URL('https://yash.systems'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yash.systems',
    siteName: 'Yash Gurjar Portfolio',
    title: 'Yash Gurjar | AI & ML Engineer',
    description: 'Portfolio of Yash Gurjar, AI & ML Engineer specializing in Computer Vision, Neural Networks, and Deep Learning.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Yash Gurjar - AI & ML Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yash Gurjar | AI & ML Engineer',
    description: 'Portfolio of Yash Gurjar, AI & ML Engineer specializing in Computer Vision and Deep Learning.',
    creator: '@Yash_9724',
    images: ['/og-image.png'],
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

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Yash Gurjar',
  jobTitle: 'AI & ML Engineer',
  url: 'https://yash.systems',
  email: 'yashgurjar9714@gmail.com',
  sameAs: [
    'https://github.com/Yash4616',
    'https://linkedin.com/in/yashgurjar9',
    'https://x.com/Yash_9724',
  ],
  knowsAbout: ['Machine Learning', 'Computer Vision', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'India',
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to domains for faster loading */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {/* Skip navigation link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>
        <ClientWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main id="main-content" className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </ClientWrapper>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}