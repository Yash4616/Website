"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaGithub, FaStar } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { getProjectsByCategory, projectCategories } from '@/data/projects'
import type { Project } from '@/types'
function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1920px) 33vw, 25vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
          className="transition-transform duration-500 hover:scale-105"
        />
      </div>
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold">{project.title}</h3>
        <p className="mt-2 text-muted-foreground text-sm">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 3).map(tech => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="outline">+{project.technologies.length - 3}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <FaStar className="h-4 w-4 fill-current" />
          <span>{project.stars}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <FaGithub className="h-4 w-4 mr-1" />
              Code
            </Link>
          </Button>
          {project.demoUrl ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <FiExternalLink className="h-4 w-4 mr-1" />
                Demo
              </Link>
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  )
}

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter projects based on active category
  useEffect(() => {
    setIsLoading(true)

    // Small delay to prevent UI jank during tab changes
    const timer = setTimeout(() => {
      const filtered = getProjectsByCategory(activeCategory)

      setVisibleProjects(filtered)
      setIsLoading(false)
    }, 10)

    return () => clearTimeout(timer)
  }, [activeCategory])

  return (
    <section id="projects" className="py-16 md:py-24 bg-muted/30 w-full">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A showcase of my work in AI, machine learning, and web development
          </p>
        </div>

        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <div className="flex justify-center mb-8 overflow-x-auto pb-2">
            <TabsList className="flex flex-wrap justify-center">
              {projectCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap text-sm px-2.5 py-1.5">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategory} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[1, 2, 3].map(index => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative h-48 w-full bg-muted animate-pulse" />
                    <CardContent className="pt-6">
                      <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-3" />
                      <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
                    </CardContent>
                    <CardFooter className="pt-0" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {visibleProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Link href="https://github.com/Yash4616" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              <FaGithub className="h-5 w-5 mr-2" />
              View All Projects on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}