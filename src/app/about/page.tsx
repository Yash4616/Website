import AboutSection from '@/components/sections/About'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'About',
    description: 'Learn more about Yash Gurjar - AI & ML Engineer specializing in Computer Vision, Neural Networks, and Deep Learning.',
}

export default function AboutPage() {
    return (
        <main className="pt-16">
            <AboutSection />
        </main>
    )
}
