"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FiArrowUp, FiDownload, FiMail } from 'react-icons/fi'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <footer className="border-t overflow-x-hidden">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="#hero" className="text-xl font-bold">
              Yash Gurjar
            </Link>
            <p className="mt-2 text-muted-foreground">
              AI & ML Engineer specializing in Computer Vision, Neural Networks, and TensorFlow.
              Building intelligent solutions for tomorrow&apos;s challenges.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://github.com/Yash4616" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://linkedin.com/in/yashgurjar9" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://x.com/Yash_9724?t=S830SiTORnK3Lmhj4myo5w&s=09" target="_blank" rel="noopener noreferrer">
                  <FaXTwitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="mailto:yashgurjar9714@gmail.com">
                  <FiMail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About', 'Skills', 'Projects', 'Experience', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`#${item.toLowerCase()}`} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <Link href="/Resume.pdf" download className="flex items-center gap-1">
                    <FiDownload className="h-4 w-4" />
                    <span>Download Resume</span>
                  </Link>
                </Button>
              </li>
              <li>
                <Link 
                  href="#blog" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="#testimonials" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Yash Gurjar. All rights reserved.
          </p>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={scrollToTop}>
            <FiArrowUp className="h-5 w-5" />
            <span className="sr-only">Back to top</span>
          </Button>
        </div>
      </div>
    </footer>
  )
}