"use client";

import Navigation from '@/components/navigation';
import HeroSection from '@/components/hero-section';
import AboutSection from '@/components/about-section';
import SkillsSection from '@/components/skills-section';
import ProjectsSection from '@/components/projects-section';
// import ExperienceSection from '@/components/experience-section';
// import TestimonialsSection from '@/components/testimonials-section';
import ContactSection from '@/components/contact-section';

export default function Home() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      {/* <ExperienceSection /> */}
      {/* <TestimonialsSection /> */}
      <ContactSection />
    </main>
  )
}