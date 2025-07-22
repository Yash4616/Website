interface RootLayoutProps {
  children: React.ReactNode;
}
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ClientWrapper from '../components/ClientWrapper';

// Optimize font loading by defining display strategy
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Use 'swap' to prevent FOIT (Flash of Invisible Text)
  preload: true,
});

export const metadata: Metadata = {
  title: 'Yash Gurjar | AI & ML Engineer',
  description: 'Portfolio of Yash Gurjar, AI & ML Engineer specializing in Computer Vision, Neural Networks, and TensorFlow',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to domains for faster loading */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        
        {/* Add preload for critical assets */}
        <link rel="preload" href="/myimage.jpg" as="image" />
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
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(error) {
                      console.log('ServiceWorker registration failed: ', error);
                    }
                  );
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}