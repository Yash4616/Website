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
    <footer className="border-t w-full overflow-hidden">
      <div className="container py-8 md:py-10">
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
                <Link href="https://github.com/Yash4616" target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile (opens in new tab)">
                  <FaGithub className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://linkedin.com/in/yashgurjar9" target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile (opens in new tab)">
                  <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://x.com/Yash_9724" target="_blank" rel="noopener noreferrer" aria-label="View X/Twitter profile (opens in new tab)">
                  <FaXTwitter className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="mailto:yashgurjar9714@gmail.com?subject=Portfolio%20Inquiry" aria-label="Send email">
                  <FiMail className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About', 'Skills', 'Projects', 'Contact'].map((item) => (
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
                  <Link href="/assets/pdfs/Yash_Resume.pdf" download className="flex items-center gap-1" aria-label="Download Resume (PDF)">
                    <FiDownload className="h-4 w-4" aria-hidden="true" />
                    <span>Download Resume</span>
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Yash Gurjar. All rights reserved.
          </p>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={scrollToTop} aria-label="Back to top">
            <FiArrowUp className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Back to top</span>
          </Button>
        </div>
      </div>
    </footer>
  )
}