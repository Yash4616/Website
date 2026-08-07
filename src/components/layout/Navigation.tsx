'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/data/config';
import { SPRING_SNAPPY } from '@/lib/motion';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { FiDownload, FiMenu, FiX } from 'react-icons/fi';

/**
 * Navigation — MASTER_PLAN.md §7 Stage 3a.
 *
 * Filename kept as Navigation.tsx per D10/A9 — the plan's tree says "Navbar.tsx"
 * but D10 locks the existing structure, and renaming buys nothing.
 *
 * Every label and href comes from `siteConfig.footer.quickLinks` and
 * `siteConfig.social` (§5.1). Adding a section means editing config, not this
 * file.
 */

const SCROLL_THRESHOLD = 100; // §7 Stage 3a
const SECTION_RATIO = 0.4;

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaXTwitter,
};

/** The YG monogram (§7 Stage 3a) — 32px, cyan, inline SVG so it inherits colour. */
function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="YG monogram">
      <path
        d="M4 6 L10 15 L10 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 6 L10 15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M28 12 A7 7 0 1 0 28 20 L28 20 L23 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  const links = siteConfig.footer.quickLinks;
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /** Scroll state, coalesced into one rAF so we never thrash layout. */
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Active section via IntersectionObserver at threshold 0.4 (§7 Stage 3a) —
   * not scroll-position maths, which forces a reflow on every tick.
   */
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el instanceof Element);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(`#${entry.target.id}`);
        }
      },
      { threshold: SECTION_RATIO }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  /** Body scroll lock while the mobile overlay is open. */
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  /** Escape closes, and focus is trapped inside the overlay while it is open. */
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    // Move focus into the panel so the trap has somewhere to start.
    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const goTo = useCallback((href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-colors duration-300',
        isScrolled
          ? 'border-b border-edge-subtle bg-surface-primary/80 backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-6 lg:px-8">
        <Link
          href="/#hero"
          aria-label={siteConfig.hero.name}
          onClick={(event) => {
            event.preventDefault();
            goTo('#hero');
          }}
          className="text-cyan-accent transition-opacity hover:opacity-80"
          data-cursor="pointer"
        >
          <Monogram className="h-8 w-8" />
        </Link>

        {/* Desktop links */}
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = activeId === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(link.href);
                    }}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative block px-4 py-2 text-sm transition-colors',
                      isActive
                        ? 'text-content-primary'
                        : 'text-content-secondary hover:text-content-primary'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="navIndicator"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-x-3 -bottom-px h-px bg-cyan-accent"
                        style={{ boxShadow: '0 0 8px rgba(0,240,255,0.8)' }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop socials + resume */}
        <div className="hidden items-center gap-4 lg:flex">
          <ul className="flex items-center gap-1">
            {siteConfig.social.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];
              if (!Icon) return null;
              return (
                <li key={social.href}>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-content-secondary transition-colors hover:text-cyan-accent"
                  >
                    <Icon className="h-[1.1rem] w-[1.1rem]" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={siteConfig.resumeUrl}
            download
            data-cursor="magnetic"
            className="flex items-center gap-2 rounded-full border border-edge-accent px-4 py-2 text-sm text-cyan-accent transition-all hover:bg-cyan-accent/10 hover:shadow-glow-cyan"
          >
            <FiDownload className="h-4 w-4" aria-hidden="true" />
            Resume
          </Link>
        </div>

        {/* Mobile toggle — 44px tap target (§12.3) */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 items-center justify-center rounded-full text-content-primary lg:hidden"
        >
          {mobileOpen ? (
            <FiX className="h-6 w-6" aria-hidden="true" />
          ) : (
            <FiMenu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-void px-6 pt-10 lg:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="flex flex-col gap-2"
            >
              {links.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <a
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(link.href);
                    }}
                    className="block py-3 text-2xl text-content-primary"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-10 flex items-center gap-3 border-t border-edge-subtle pt-8">
              {siteConfig.social.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                if (!Icon) return null;
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-edge text-content-secondary"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
              <Link
                href={siteConfig.resumeUrl}
                download
                className="flex h-11 items-center gap-2 rounded-full border border-edge-accent px-5 text-sm text-cyan-accent"
              >
                <FiDownload className="h-4 w-4" aria-hidden="true" />
                Resume
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
