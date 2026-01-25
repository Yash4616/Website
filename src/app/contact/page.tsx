import ContactSection from '@/components/sections/Contact'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with Yash Gurjar for AI/ML projects, collaborations, or opportunities.',
}

export default function ContactPage() {
    return (
        <main className="pt-16">
            <ContactSection />
        </main>
    )
}
