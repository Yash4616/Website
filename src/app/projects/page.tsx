import ProjectsSection from '@/components/sections/Projects'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Explore projects by Yash Gurjar in AI, Machine Learning, Computer Vision, and Web Development.',
}

export default function ProjectsPage() {
    return (
        <main className="pt-16">
            <ProjectsSection />
        </main>
    )
}
