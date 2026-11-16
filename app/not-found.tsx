import type { Metadata } from "next";
import Link from "next/link";
import { BriefOnly } from "@/components/BriefOnly";
import { RouteMarker } from "@/components/RouteMarker";
import { instruments } from "@/content/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "There is no page at this address.",
};

/**
 * Unmatched addresses, and /work/<slug> for a slug that is not a project.
 * Kept small: Next.js sends this file's payload with every route.
 */
export default function NotFound() {
  return (
    <>
      <RouteMarker slug={null} />
      <BriefOnly />
      <main className="brief" id="brief">
        <p className="row-meta">404</p>
        <h1 className="p-name" style={{ marginTop: 12 }}>
          No page at this address.
        </h1>
        <p className="p-what">The link may be out of date or mistyped. Everything on the site is one step from here.</p>
        <nav className="b-actions" aria-label="Ways back">
          <Link className="btn btn-cta" href="/">
            Go to the start
          </Link>
        </nav>
        <section className="b-section" aria-labelledby="nf-work-h">
          <h2 id="nf-work-h">Selected work</h2>
          <ul className="nf-list">
            {instruments.map((node) => (
              <li key={node.id}>
                <Link href={`/work/${node.id}`}>{node.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
