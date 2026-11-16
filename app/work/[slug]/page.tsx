import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { RouteMarker } from "@/components/RouteMarker";
import { instruments, instrumentBySlug, readingText, site } from "@/content/site";
import { ProjectPage } from "@/views/brief/ProjectPage";

// Every project page is complete static output. For a slug that is not a
// project, the request waits for the render instead of being sent the shared
// shell first, so notFound() can still set the status: a real 404, not a
// page that says "not found" under a 200.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return instruments.map((i) => ({ slug: i.id }));
}

export async function generateMetadata(
  { params }: PageProps<"/work/[slug]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const node = instrumentBySlug(slug);
  // The page calls notFound() for this slug; the tab should say so too.
  if (!node) return { title: "Page not found" };
  const description = `${node.sentence} ${readingText(node.reading)} ${node.reading.label}. Limitation: ${node.limitation}`;
  // Setting openGraph here replaces the layout's whole object, including the
  // share image that app/opengraph-image.tsx adds to it. Carry the image over.
  const inherited = (await parent).openGraph;
  return {
    title: node.name,
    description,
    alternates: { canonical: `/work/${node.id}` },
    openGraph: {
      type: "article",
      siteName: site.person.name,
      title: node.name,
      description,
      url: `/work/${node.id}`,
      images: inherited?.images,
    },
  };
}

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const node = instrumentBySlug(slug);
  if (!node) notFound();
  const projectLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: node.name,
    description: node.what,
    url: `${site.url}/work/${node.id}`,
    keywords: node.stack.join(", "),
    author: { "@type": "Person", name: site.person.name, url: site.url },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectLd).replace(/</g, "\\u003c") }}
      />
      <RouteMarker slug={node.id} />
      <ProjectPage node={node} />
    </>
  );
}
