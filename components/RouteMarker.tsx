"use client";

import { useEffect } from "react";
import { routeCommitted } from "@/lib/nav";

/**
 * Each page renders one of these. When the route commits (or a preserved
 * page becomes visible again) it reports which portal, if any, the URL names.
 */
export function RouteMarker({ slug }: { slug: string | null }) {
  useEffect(() => {
    routeCommitted(slug);
  }, [slug]);
  return null;
}
