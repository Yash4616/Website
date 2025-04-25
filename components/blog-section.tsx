import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FaRegCalendarAlt, FaClock } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'

const blogPosts = [
  {
    id: 1,
    title: 'Understanding Transformers: The Architecture Behind Modern NLP',
    excerpt: 'An in-depth look at the transformer architecture that powers models like BERT, GPT, and T5.',
    date: 'March 15, 2023',
    readTime: '8 min read',
    category: 'NLP',
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/blog/understanding-transformers',
  },
  {
    id: 2,
    title: 'Optimizing Neural Networks: Best Practices for Training Efficiency',
    excerpt: 'Practical techniques to improve neural network training speed, memory usage, and convergence.',
    date: 'January 22, 2023',
    readTime: '12 min read',
    category: 'Deep Learning',
    image: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/blog/optimizing-neural-networks',
  },
  {
    id: 3,
    title: 'The Ethics of AI: Navigating the Challenges of Bias and Fairness',
    excerpt: 'Exploring the ethical considerations in developing AI systems and strategies for mitigating bias.',
    date: 'October 5, 2022',
    readTime: '10 min read',
    category: 'AI Ethics',
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/blog/ethics-of-ai',
  },
]

function BlogCard({ post }: { post: typeof blogPosts[0] }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image 
          src={post.image} 
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/80">
            {post.category}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-6 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
        <p className="mt-2 text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
        
        <div className="mt-auto pt-4 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FaRegCalendarAlt className="h-4 w-4" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="h-4 w-4" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BlogSection() {
  return (
    <section id="blog" className="py-16 md:py-24">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sharing insights and knowledge about AI, machine learning, and technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <Link key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="block h-full">
              <BlogCard post={post} />
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="https://example.com/blog" target="_blank" rel="noopener noreferrer">
              <FiExternalLink className="mr-2 h-4 w-4" />
              Visit My Blog
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}