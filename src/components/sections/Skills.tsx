"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ripple } from "@/components/ui/ripple"
import { cn } from '@/lib/utils'

// Define skill categories and skills
const skillCategories = [
  {
    id: 'languages',
    name: 'Languages',
    skills: [
      { name: 'Python', logo: 'python.svg' },
      { name: 'JavaScript', logo: 'js.svg' },
      { name: 'TypeScript', logo: 'typescript.svg' },
      { name: 'C++', logo: 'cpp.svg' },
      { name: 'Flutter', logo: 'flutter.svg' },
      { name: 'Css', logo: 'css.svg' },

    ]
  },
  {
    id: 'frameworks',
    name: 'Frameworks & Libraries',
    skills: [
      { name: 'TensorFlow', logo: 'tensorflow.svg' },
      { name: 'PyTorch', logo: 'pytorch.svg' },
      { name: 'Scikit-learn', logo: 'scikitLearn.svg' },
      { name: 'Matplotlib', logo: 'matplotlib.svg' },
      { name: 'React', logo: 'react.svg' },
      { name: 'Next.js', logo: 'nextjs.svg' },
    ]
  },
  {
    id: 'tools',
    name: 'Tools & Technologies',
    skills: [
      { name: 'Docker', logo: 'docker.svg' },
      { name: 'Git', logo: 'github.svg' },
      { name: 'Figma', logo: 'figma.svg' },
      { name: 'CUDA & CuDnn', logo: 'cuda.svg' },
      { name: 'MySQL', logo: 'mysql.svg' },
      { name: 'Google Cloud', logo: 'googleCloud.svg' },
    ]
  },
  {
    id: 'soft',
    name: 'Soft Skills',
    skills: [
      { name: 'Problem Solving', logo: 'problemSolving.svg' },
      { name: 'Technical Writing', logo: 'techWrite.svg' },
      { name: 'Team Collaboration', logo: 'team.svg' },
      { name: 'Research', logo: 'research.svg' },
      { name: 'Project Management', logo: 'project.svg' },
    ]
  }
]

function SkillItem({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/40 hover:border-primary/40 hover:bg-card/60 transition-colors">
      {logo.endsWith('.svg') ? (
        <div className="w-8 h-8 relative flex-shrink-0">
          <Image
            src={`/assets/icons/${logo}`}
            alt={`${name} logo`}
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <span className="text-xl">{logo}</span>
      )}
      <span className="font-medium text-sm sm:text-base">{name}</span>
    </div>
  )
}

export default function SkillsSection() {
  const [activeTab, setActiveTab] = useState('languages')

  // Define technology SVG mappings
  const technologySvgs = [
    { name: 'React', logo: 'react.svg' },
    { name: 'Python', logo: 'python.svg' },
    { name: 'TensorFlow', logo: 'tensorflow.svg' },
    { name: 'PyTorch', logo: 'pytorch.svg' },
    { name: 'Google Cloud', logo: 'googleCloud.svg' },
    { name: 'Docker', logo: 'docker.svg' },
    { name: 'Next.js', logo: 'nextjs.svg' },
    { name: 'Matplotlib', logo: 'matplotlib.svg' },
    { name: 'Scikit-Learn', logo: 'scikitLearn.svg' },
    { name: 'GitHub', logo: 'github.svg' },
    { name: 'TypeScript', logo: 'typescript.svg' },
    { name: 'MySQL', logo: 'mysql.svg' },
  ]

  return (
    <section id="skills" className="py-16 md:py-24 w-full">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Skills &amp; Expertise</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Here&apos;s a breakdown of my technical skills and the tools I work with
          </p>
        </div>

        <Tabs
          defaultValue="languages"
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-8 w-full">
            <TabsList className="inline-flex flex-wrap justify-center h-auto gap-2 bg-muted/50 p-1 rounded-lg">
              {skillCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap px-4 py-2 flex-1 min-w-[120px] sm:flex-none rounded-md">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {skillCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {category.skills.map(skill => (
                  <SkillItem
                    key={skill.name}
                    name={skill.name}
                    logo={skill.logo}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-center mb-8">Technologies I&apos;ve worked with</h3>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
            {technologySvgs.map((tech, i) => (
              <Ripple
                key={i}
                color="rgba(255,255,255,0.4)"
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg p-4 cursor-pointer",
                  "bg-muted/50 hover:bg-muted transition-colors duration-300 hover:scale-105"
                )}
              >
                <div className="relative w-full h-full" title={tech.name}>
                  <Image
                    src={`/assets/icons/${tech.logo}`}
                    alt={tech.name}
                    fill
                    className="object-contain pointer-events-none"
                  />
                </div>
              </Ripple>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
