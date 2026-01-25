import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { projects, getProjectBySlug } from '@/data/projects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FaGithub, FaStar } from 'react-icons/fa'
import { FiExternalLink, FiArrowLeft } from 'react-icons/fi'
import type { Metadata } from 'next'

export async function generateStaticParams() {
    return projects.map((project) => ({
        slug: project.slug,
    }))
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const project = getProjectBySlug(slug)

    if (!project) {
        return { title: 'Project Not Found' }
    }

    return {
        title: project.title,
        description: project.description,
        openGraph: {
            title: project.title,
            description: project.description,
            images: [project.image],
        },
    }
}

export default async function ProjectPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const project = getProjectBySlug(slug)

    if (!project) {
        notFound()
    }

    return (
        <main className="pt-20 pb-16">
            <div className="container px-4">
                {/* Back button */}
                <Link href="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
                        <p className="text-lg text-muted-foreground">{project.description}</p>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                        <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Technologies */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Technologies Used</h2>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-sm">
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4">
                        <Button asChild>
                            <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                <FaGithub className="mr-2 h-4 w-4" />
                                View Code
                            </Link>
                        </Button>
                        {project.demoUrl && (
                            <Button variant="outline" asChild>
                                <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                    <FiExternalLink className="mr-2 h-4 w-4" />
                                    Live Demo
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-8 pt-8 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FaStar className="h-4 w-4" />
                            <span>{project.stars} stars on GitHub</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
