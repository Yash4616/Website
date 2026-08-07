'use client';

import { motion } from 'framer-motion';
import { FiArrowDown } from 'react-icons/fi';
import Aurora from '@/components/features/Aurora';
import { siteConfig } from '@/data/config';
import { SPRING_SMOOTH } from '@/lib/motion';
import { useTypewriter } from '@/hooks/use-typewriter';
import { useMotionSafe } from '@/hooks/use-motion-safe';
import { useLoaderRan } from '@/components/features/boot-gate';

/**
 * Hero — MASTER_PLAN.md §7 Stage 3c.
 *
 * ── A25: the entrance is conditional, and that is a performance decision ─────
 * The clip-mask reveal runs ONLY when the loader did not play (return visit or
 * reduced motion). When the loader played, the hero renders in its final
 * composed state behind it.
 *
 * The reason is LCP, and it is worth stating plainly so nobody "fixes" this
 * later: a clip-masked <h1> is translated outside its `overflow-hidden` parent,
 * so it is not visible, so it is not a contentful paint. Animating it
 * unconditionally would push LCP from ~1.6 s to ~3.8 s — losing the 2.5 s budget
 * to win a gate line. The Stage 3 gate is therefore "LCP resolves to the <h1>
 * and stays under 2.5 s", not "the h1 animates".
 *
 * Two bonuses: two entrance animations never stack, and everyone who skips the
 * loader or returns still sees the reveal.
 *
 * The OGL neural canvas replaces Aurora in Stage 3b; Aurora stays until that
 * renders correctly (§6.2).
 */
export default function HeroSection() {
  const { prefersReduced } = useMotionSafe();
  const loaderRan = useLoaderRan();

  // The loader's split-reveal is the entrance when it played.
  const playEntrance = !loaderRan && !prefersReduced;

  const typed = useTypewriter(siteConfig.hero.typewriterWords, {
    typeMs: 80,
    deleteMs: 40,
    pauseMs: 2000,
    disabled: prefersReduced,
  });

  const reveal = (delay: number) =>
    playEntrance
      ? {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { ...SPRING_SMOOTH, delay },
        }
      : {};

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      {/* Background — z-0. Replaced by the OGL neural canvas in Stage 3b. */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-[220px]">
          <Aurora />
        </div>
      </div>

      {/* Foreground — z-10 */}
      <div className="relative z-10 w-full px-8 lg:px-20">
        <div className="flex max-w-4xl flex-col items-start">
          {/*
            The name is real text, never an image — the gradient is CSS
            (§7 Stage 3c).

            Two shapes, deliberately. LCP attributes to the innermost element
            that carries the text, so the wrapper span the reveal needs would
            take LCP attribution away from the <h1> itself. In the common path
            (loader ran, no entrance) the text sits directly in the <h1> with no
            wrapper at all, which is both what the gate asks for and one DOM node
            fewer. The wrapper exists only where the reveal actually runs.
          */}
          {playEntrance ? (
            <h1
              id="hero-heading"
              className="text-5xl font-bold tracking-tight md:text-8xl lg:text-9xl"
            >
              <span className="block overflow-hidden">
                <motion.span
                  className="block bg-gradient-accent bg-clip-text text-transparent"
                  style={{ textShadow: '0 0 40px rgba(0,240,255,0.15)' }}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={SPRING_SMOOTH}
                >
                  {siteConfig.hero.name}
                </motion.span>
              </span>
            </h1>
          ) : (
            <h1
              id="hero-heading"
              className="bg-gradient-accent bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-8xl lg:text-9xl"
              style={{ textShadow: '0 0 40px rgba(0,240,255,0.15)' }}
            >
              {siteConfig.hero.name}
            </h1>
          )}

          <motion.p
            className="mt-4 text-2xl font-light tracking-wide text-white/80"
            {...reveal(0.3)}
          >
            {siteConfig.hero.title}
          </motion.p>

          {/*
            Fixed min-height reserves the line so cycling never shifts layout
            (§11.1, CLS < 0.1).
          */}
          <motion.p
            className="mt-3 flex min-h-[2.25rem] items-center font-mono text-base text-cyan-accent sm:text-lg"
            aria-live="off"
            {...reveal(0.45)}
          >
            <span className="text-content-secondary">
              {siteConfig.hero.typewriterPrefix}
            </span>
            <span>{typed}</span>
            <span className="ml-0.5 animate-blink" aria-hidden="true">
              |
            </span>
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap gap-4" {...reveal(0.6)}>
            <a
              href={siteConfig.hero.primaryCta.href}
              data-cursor="magnetic"
              onClick={(event) => {
                event.preventDefault();
                document
                  .querySelector(siteConfig.hero.primaryCta.href)
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-full border-2 border-cyan-accent px-8 py-4 text-content-primary transition-all hover:scale-[1.02] hover:bg-cyan-accent/10 hover:shadow-glow-cyan"
            >
              {siteConfig.hero.primaryCta.label}
            </a>
            <a
              href={siteConfig.hero.secondaryCta.href}
              download
              data-cursor="magnetic"
              className="rounded-full border border-edge bg-white/5 px-8 py-4 text-content-primary backdrop-blur-sm transition-all hover:border-edge-hover hover:scale-[1.02]"
            >
              {siteConfig.hero.secondaryCta.label}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-white/30">
          {siteConfig.hero.scrollHint}
        </span>
        <motion.span
          animate={prefersReduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <FiArrowDown className="h-5 w-5 text-white/30" />
        </motion.span>
      </div>
    </section>
  );
}
