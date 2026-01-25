// Project types
export interface Project {
    id: number
    title: string
    slug: string
    description: string
    image: string
    categories: string[]
    technologies: string[]
    repoUrl: string
    demoUrl?: string
    stars: number
    featured?: boolean
}

// Skill types
export interface Skill {
    name: string
    icon: string
    level: number // 0-100
    category: 'languages' | 'frameworks' | 'tools' | 'ml'
}

// Experience types
export interface Experience {
    id: number
    title: string
    company: string
    location: string
    period: string
    description: string[]
    technologies: string[]
    type: 'work' | 'education' | 'volunteer'
}

// Blog types
export interface BlogPost {
    slug: string
    title: string
    description: string
    date: string
    readTime: string
    tags: string[]
    content: string
}

// Contact form types
export interface ContactFormData {
    name: string
    email: string
    subject: string
    message: string
}

// Testimonial types
export interface Testimonial {
    id: number
    name: string
    role: string
    company: string
    image: string
    content: string
}

// Metadata types
export interface SiteConfig {
    name: string
    description: string
    url: string
    ogImage: string
    links: {
        github: string
        linkedin: string
        twitter: string
        email: string
    }
}
