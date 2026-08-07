'use client';

import { useEffect, useState } from 'react';

interface TypewriterOptions {
  typeMs?: number;
  deleteMs?: number;
  pauseMs?: number;
  /** When true, settle on the first word and never cycle (§4.5). */
  disabled?: boolean;
}

/**
 * Cycling typewriter — MASTER_PLAN.md §7 Stage 3c.
 *
 * A single self-rescheduling timeout rather than one timer per phase, so there
 * is exactly one handle to clear. The consumer is responsible for reserving the
 * line's height (`min-h`) — this hook returns text of changing length and would
 * otherwise cause layout shift on every keystroke (§11.1, CLS < 0.1).
 *
 * §15 rule 15: this is ~30 lines, so it is a hook and not a dependency.
 */
export function useTypewriter(words: string[], options: TypewriterOptions = {}) {
  const { typeMs = 80, deleteMs = 40, pauseMs = 2000, disabled = false } = options;

  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (disabled || words.length === 0) {
      setText(words[0] ?? '');
      return;
    }

    const current = words[wordIndex % words.length];
    const complete = !deleting && text === current;
    const cleared = deleting && text === '';

    const delay = complete ? pauseMs : deleting ? deleteMs : typeMs;

    const timer = window.setTimeout(() => {
      if (complete) {
        setDeleting(true);
        return;
      }
      if (cleared) {
        setDeleting(false);
        setWordIndex((index) => (index + 1) % words.length);
        return;
      }
      setText((previous) =>
        deleting ? current.slice(0, previous.length - 1) : current.slice(0, previous.length + 1)
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [text, deleting, wordIndex, words, typeMs, deleteMs, pauseMs, disabled]);

  return text;
}

export default useTypewriter;
