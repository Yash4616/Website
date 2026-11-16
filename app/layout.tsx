import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Shell } from "@/components/Shell";
import { site } from "@/content/site";
import { VIEW_SCRIPT } from "@/lib/view";
import "./globals.css";

// Both families are served from this origin. No request leaves for a font
// host at runtime.
//
// Archivo is the Latin subset of the variable font, limited to the part of
// the design space the site sets: weights 400 to 700 and widths 100% to 125%.
// The full file (weights 100 to 900, widths 62% to 125%) is 90 KB; this one is
// 57 KB. scripts/subset-font.py rebuilds it.
const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-archivo",
  weight: "400 700",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description = `${site.person.title}. ${site.person.line} ${site.person.availability}`;

// "@handle" from the X profile link, for the share card's byline.
const xLink = site.person.links.find((l) => /^https:\/\/(x|twitter)\.com\//.test(l.href));
const xHandle = xLink ? `@${new URL(xLink.href).pathname.split("/")[1]}` : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.person.name}, ${site.person.title}`,
    template: `%s | ${site.person.name}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: `${site.person.name}, ${site.person.title}`,
    description,
    url: "/",
    siteName: site.person.name,
  },
  twitter: { card: "summary_large_image", creator: xHandle },
  authors: [{ name: site.person.name, url: site.url }],
  creator: site.person.name,
};

export const viewport: Viewport = {
  themeColor: "#0d0e0f",
  colorScheme: "dark",
  viewportFit: "cover",
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.person.name,
  jobTitle: site.person.title,
  description: site.person.line,
  email: `mailto:${site.person.email}`,
  url: site.url,
  sameAs: site.person.links.map((l) => l.href),
  alumniOf: { "@type": "CollegeOrUniversity", name: site.person.education.school },
  knowsAbout: site.person.skills.flatMap((s) => s.items),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Decides Field or Brief before first paint, so there is no flash and no shift. */}
        <script dangerouslySetInnerHTML={{ __html: VIEW_SCRIPT }} />
        <noscript>
          <style>{".view-toggle{display:none}"}</style>
        </noscript>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replace(/</g, "\\u003c") }}
        />
        <a className="skip" href="#brief">
          Skip to content
        </a>
        <div className="brief-root">{children}</div>
        <Shell person={site.person} />
      </body>
    </html>
  );
}
