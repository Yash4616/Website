"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { BriefOnly } from "@/components/BriefOnly";

/**
 * A page failed to render. The shell (view toggle, Field) sits in the root
 * layout, outside this boundary, and keeps working.
 */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <BriefOnly />
      <main className="brief" id="brief">
        <p className="row-meta">Error</p>
        <h1 className="p-name" style={{ marginTop: 12 }}>
          This page failed to load.
        </h1>
        <p className="p-what">Nothing was lost. Try it again, or go back to the start.</p>
        <div className="b-actions">
          <button type="button" className="btn btn-cta" onClick={() => retry()}>
            Try again
          </button>
          {/* A full navigation, not a client one: the client state is what failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn" href="/">
            Go to the start
          </a>
        </div>
      </main>
    </>
  );
}
