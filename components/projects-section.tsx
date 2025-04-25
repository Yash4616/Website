"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaGithub, FaStar } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'

// Define project categories and projects
const projectCategories = [
  { id: 'all', name: 'All Projects' },
  { id: 'ml', name: 'Machine Learning' },
  { id: 'computer-vision', name: 'Computer Vision' },
  // { id: 'nlp', name: 'NLP' },
  { id: 'web', name: 'Web Development' },
]

// Move projects to a separate constant to improve readability
const projects = [
  {
    id: 1,
    title: 'ResNet18-CIFAR10-Classifier',
    description: 'High-accuracy image classifier using ResNet18 architecture and advanced augmentation techniques for CIFAR-10 dataset.',
    image: 'https://images.pexels.com/photos/2653362/pexels-photo-2653362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    categories: ['ml', 'computer-vision'],
    technologies: ['TensorFlow', 'Python', 'Matplotlib'],
    repoUrl: 'https://github.com/Yash4616/ResNet18-CIFAR10-Classifier',
    demoUrl: 'https://github.com/Yash4616/ResNet18-CIFAR10-Classifier/blob/main/README.md',
    stars: 2,
  },
  // {   //Under Development
  //   id: 2,
  //   title: 'NLP Sentiment Analysis API',
  //   description: 'An API that provides sentiment analysis for text using transformer-based models.',
  //   image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
  //   categories: ['ml', 'nlp'],
  //   technologies: ['PyTorch', 'FastAPI', 'Hugging Face', 'Docker'],
  //   repoUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  //   stars: 87,
  // },
  // {
  //   id: 3,
  //   title: 'AI Research Dashboard',
  //   description: 'Interactive dashboard for tracking and visualizing AI research papers and trends.',
  //   image: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
  //   categories: ['web', 'ml'],
  //   technologies: ['Next.js', 'TypeScript', 'D3.js', 'MongoDB'],
  //   repoUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  //   stars: 62,
  // },
  // {
  //   id: 4,
  //   title: 'Object Detection System',
  //   description: 'Real-time object detection system for video streams with high accuracy and low latency.',
  //   image: 'https://images.pexels.com/photos/5473337/pexels-photo-5473337.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
  //   categories: ['ml', 'computer-vision'],
  //   technologies: ['YOLO', 'OpenCV', 'Python', 'CUDA'],
  //   repoUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  //   stars: 124,
  // },
  // {
  //   id: 5,
  //   title: 'Speech Recognition Tool',
  //   description: 'A tool for transcribing and analyzing speech in multiple languages.',
  //   image: 'https://images.pexels.com/photos/5702281/pexels-photo-5702281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
  //   categories: ['ml', 'nlp'],
  //   technologies: ['Wav2Vec', 'PyTorch', 'Python', 'React'],
  //   repoUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  //   stars: 95,
  // },
  {
    id: 6,
    title: 'Portfolio Website',
    description: 'Modern, responsive portfolio website built with Next.js and Tailwind CSS.',
    image: 'website.png',
    categories: ['web'],
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    repoUrl: 'https://github.com/Yash4616/Website.git',
    demoUrl: 'https://example.com',
    stars: 0,
  },
]

function ProjectCard({ project }: { project: typeof projects[0] }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={project.image} 
          alt={project.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          <Button variant="outline" size="sm" asChild>
            <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <FiExternalLink className="h-4 w-4 mr-1" />
              Demo
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleProjects, setVisibleProjects] = useState<typeof projects>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter projects based on active category
  useEffect(() => {
    setIsLoading(true)
    
    // Small delay to prevent UI jank during tab changes
    const timer = setTimeout(() => {
      const filtered = activeCategory === 'all'
        ? projects
        : projects.filter(project => project.categories.includes(activeCategory))
      
      setVisibleProjects(filtered)
      setIsLoading(false)
    }, 10)
    
    return () => clearTimeout(timer)
  }, [activeCategory])

  return (
    <section id="projects" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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