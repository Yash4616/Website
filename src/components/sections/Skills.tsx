"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

// Define skill categories and skills
const skillCategories = [
  {
    id: 'languages',
    name: 'Languages',
    skills: [
      { name: 'Python', level: 90, logo: 'python.svg' },
      { name: 'JavaScript', level: 75, logo: 'js.svg' },
      { name: 'TypeScript', level: 80, logo: 'typescript.svg' },
      { name: 'C++', level: 80, logo: 'cpp.svg' },
      { name: 'Flutter', level: 70, logo: 'flutter.svg' },
      { name: 'Css', level: 85, logo: 'css.svg' },

    ]
  },
  {
    id: 'frameworks',
    name: 'Frameworks & Libraries',
    skills: [
      { name: 'TensorFlow', level: 90, logo: 'tensorflow.svg' },
      { name: 'PyTorch', level: 80, logo: 'pytorch.svg' },
      { name: 'Scikit-learn', level: 80, logo: 'scikitLearn.svg' },
      { name: 'Matplotlib', level: 80, logo: 'matplotlib.svg' },
      { name: 'React', level: 80, logo: 'react.svg' },
      { name: 'Next.js', level: 85, logo: 'nextjs.svg' },
    ]
  },
  {
    id: 'tools',
    name: 'Tools & Technologies',
    skills: [
      { name: 'Docker', level: 85, logo: 'docker.svg' },
      { name: 'Git', level: 90, logo: 'github.svg' },
      { name: 'Figma', level: 80, logo: 'figma.svg' },
      { name: 'CUDA & CuDnn', level: 70, logo: 'cuda.svg' },
      { name: 'MySQL', level: 75, logo: 'mysql.svg' },
      { name: 'Google Cloud', level: 85, logo: 'googleCloud.svg' },
    ]
  },
  {
    id: 'soft',
    name: 'Soft Skills',
    skills: [
      { name: 'Problem Solving', level: 95, logo: 'problemSolving.svg' },
      { name: 'Technical Writing', level: 85, logo: 'techWrite.svg' },
      { name: 'Team Collaboration', level: 90, logo: 'team.svg' },
      { name: 'Research', level: 90, logo: 'research.svg' },
      { name: 'Project Management', level: 80, logo: 'project.svg' },
    ]
  }
]

function SkillItem({ name, level, logo }: { name: string; level: number; logo: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {logo.endsWith('.svg') ? (
            <div className="w-6 h-6 relative">
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
          <span className="font-medium">{name}</span>
        </div>
        <span className="text-sm font-medium">{level}%</span>
      </div>
      <Progress value={level} className="h-2" />
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
          <h2 className="text-3xl font-bold tracking-tight">Skills & Expertise</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Here&apos;s a breakdown of my technical skills and areas of expertise
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {category.skills.map(skill => (
                  <SkillItem
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
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
              <div
                key={i}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg p-4",
                  "bg-muted/50 hover:bg-muted transition-colors duration-300"
                )}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={`/assets/icons/${tech.logo}`}
                    alt={tech.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}