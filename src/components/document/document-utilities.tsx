'use client';

import { useState } from 'react';

export function DocumentUtilities({ citation }: { citation: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-data uppercase tracking-[0.08em]">
      <button type="button" onClick={copyCitation} className="text-left underline decoration-rule-strong underline-offset-4 hover:text-accent">
        [{copied ? 'Copied' : 'Cite'}]
      </button>
      <button type="button" onClick={() => window.print()} className="text-left underline decoration-rule-strong underline-offset-4 hover:text-accent">[Print]</button>
      <a href="#main">[↑]</a>
    </div>
  );
}

export default DocumentUtilities;
