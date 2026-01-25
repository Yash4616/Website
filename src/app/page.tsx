import HeroSection from '@/components/sections/Hero';
import AboutSection from '@/components/sections/About';
import SkillsSection from '@/components/sections/Skills';
import ProjectsSection from '@/components/sections/Projects';
// import ExperienceSection from '@/components/sections/Experience';
// import TestimonialsSection from '@/components/sections/Testimonials';
import ContactSection from '@/components/sections/Contact';

export default function Home() {
  return (
    <main>
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