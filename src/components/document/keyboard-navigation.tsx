'use client';

import { useEffect } from 'react';

export function KeyboardNavigation({ ids }: { ids: string[] }) {
  useEffect(() => {
    let awaitingHome = false;
    let timer: number | undefined;
    const inputTarget = (target: EventTarget | null) => target instanceof HTMLElement && (
      target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)
    );

    const move = (direction: 1 | -1) => {
      // The current section is the last marker passed by the reading line. At
      // the top of the document no marker has been passed, so `j` correctly
      // enters section 01 rather than skipping straight to section 02.
      let current = -1;
      ids.forEach((id, index) => {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= 96) current = index;
      });
      const destination = ids[Math.max(0, Math.min(ids.length - 1, current + direction))];
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      document.getElementById(destination)?.scrollIntoView({ behavior, block: 'start' });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || inputTarget(event.target)) return;
      if (awaitingHome && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior });
        awaitingHome = false;
        if (timer) window.clearTimeout(timer);
        return;
      }
      if (event.key.toLowerCase() === 'g') {
        awaitingHome = true;
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => { awaitingHome = false; }, 700);
        return;
      }
      awaitingHome = false;
      if (event.key.toLowerCase() === 'j') { event.preventDefault(); move(1); }
      if (event.key.toLowerCase() === 'k') { event.preventDefault(); move(-1); }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (timer) window.clearTimeout(timer);
    };
  }, [ids]);

  return null;
}

export default KeyboardNavigation;
