import HeroSection from '@/components/sections/Hero';
import AboutSection from '@/components/sections/About';
import SkillsSection from '@/components/sections/Skills';
import ProjectsSection from '@/components/sections/Projects';
import ContactSection from '@/components/sections/Contact';

/**
 * Stays a Server Component (§3.1) — the boot gate and cursor are client leaves
 * mounted at the root by ClientWrapper, so nothing here needs "use client".
 *
 * §6.2 — the commented-out Experience and Testimonials imports were removed.
 * The section components themselves still exist and were not deleted; they are
 * simply not part of the page.
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </>
  );
}
