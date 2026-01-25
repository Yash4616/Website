import type { Project } from '@/types'

export const projects: Project[] = [
    {
        id: 1,
        slug: 'resnet18-cifar10-classifier',
        title: 'ResNet18-CIFAR10-Classifier',
        description: 'High-accuracy image classifier using ResNet18 architecture and advanced augmentation techniques for CIFAR-10 dataset.',
        image: 'https://images.pexels.com/photos/2653362/pexels-photo-2653362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        categories: ['ml', 'computer-vision'],
        technologies: ['TensorFlow', 'Python', 'Matplotlib'],
        repoUrl: 'https://github.com/Yash4616/ResNet18-CIFAR10-Classifier',
        demoUrl: 'https://github.com/Yash4616/ResNet18-CIFAR10-Classifier/blob/main/README.md',
        stars: 2,
        featured: true,
    },
    {
        id: 2,
        slug: 'computer-vision',
        title: 'Computer Vision',
        description: 'A collection of computer vision models and utilities, including image classification, object detection, and image processing pipelines.',
        image: 'https://images.pexels.com/photos/3103199/pexels-photo-3103199.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
        categories: ['ml', 'computer-vision'],
        technologies: ['PyTorch', 'Numpy', 'OpenCV'],
        repoUrl: 'https://github.com/Yash4616/Computer-Vision.git',
        demoUrl: 'https://github.com/Yash4616/Computer-Vision#readme',
        stars: 0,
        featured: true,
    },
    {
        id: 3,
        slug: 'portfolio-website',
        title: 'Portfolio Website',
        description: 'Modern, responsive portfolio website built with Next.js and Tailwind CSS.',
        image: '/assets/images/website.png',
        categories: ['web'],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        repoUrl: 'https://github.com/Yash4616/Website.git',
        demoUrl: 'https://yashgurjar.dev',
        stars: 0,
        featured: true,
    },
]

export const projectCategories = [
    { id: 'all', name: 'All Projects' },
    { id: 'ml', name: 'Machine Learning' },
    { id: 'computer-vision', name: 'Computer Vision' },
    { id: 'web', name: 'Web Development' },
]

export function getProjectBySlug(slug: string): Project | undefined {
    return projects.find(project => project.slug === slug)
}

export function getProjectsByCategory(category: string): Project[] {
    if (category === 'all') return projects
    return projects.filter(project => project.categories.includes(category))
}
