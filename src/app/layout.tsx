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
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: {
    default: 'Yash Gurjar | AI & ML Engineer',
    template: '%s | Yash Gurjar',
  },
  description: 'Portfolio of Yash Gurjar, AI & ML Engineer specializing in Computer Vision, Neural Networks, Deep Learning, and TensorFlow. Building intelligent solutions for tomorrow\'s challenges.',
  keywords: ['AI Engineer', 'ML Engineer', 'Machine Learning', 'Computer Vision', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks', 'Portfolio'],
  authors: [{ name: 'Yash Gurjar', url: 'https://yashgurjar.dev' }],
  creator: 'Yash Gurjar',
  manifest: '/manifest.json',
  metadataBase: new URL('https://yashgurjar.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yashgurjar.dev',
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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to domains for faster loading */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />

        {/* Add preload for critical assets */}
        <link rel="preload" href="/assets/images/myimage.jpg" as="image" />
      </head>
      <body className={inter.className}>
        <ClientWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">
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
      </body>
    </html>
  );
}