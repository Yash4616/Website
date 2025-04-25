import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/navigation'), { ssr: false })
const HeroSection = dynamic(() => import('@/components/hero-section'), { ssr: false })
const AboutSection = dynamic(() => import('@/components/about-section'), { ssr: false })
const SkillsSection = dynamic(() => import('@/components/skills-section'), { ssr: false })
const ProjectsSection = dynamic(() => import('@/components/projects-section'), { ssr: false })
// const ExperienceSection = dynamic(() => import('@/components/experience-section'), { ssr: false })
// const TestimonialsSection = dynamic(() => import('@/components/testimonials-section'), { ssr: false })
const ContactSection = dynamic(() => import('@/components/contact-section'), { ssr: false })

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