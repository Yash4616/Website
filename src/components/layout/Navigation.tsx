"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FiDownload, FiMenu, FiX } from 'react-icons/fi'

const navItems = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 overflow-x-hidden',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="#hero"
          className="text-xl font-bold tracking-tight hover:text-primary transition-colors"
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('#hero')
          }}
        >
          Yash Gurjar
        </Link>

        {/* Desktop navigation - shows at lg (1024px+) */}
        <nav className="hidden lg:flex items-center gap-6">
          <ul className="flex gap-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(item.href)
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://github.com/Yash4616" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://linkedin.com/in/yashgurjar9" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://x.com/Yash_9724?t=S830SiTORnK3Lmhj4myo5w&s=09" target="_blank" rel="noopener noreferrer">
                  <FaXTwitter className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
            </div>
            <Button size="sm" className="gap-1" asChild>
              <a href="/assets/pdfs/Resume.pdf" download>
                <FiDownload className="h-4 w-4" aria-hidden="true" />
                Resume
              </a>
            </Button>
          </div>
        </nav>

        {/* Mobile menu button - shows below lg (1024px) */}
        <div className="flex lg:hidden items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <div className="relative w-6 h-6">
              <FiMenu className={`absolute inset-0 h-6 w-6 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true" />
              <FiX className={`absolute inset-0 h-6 w-6 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-b pb-4 overflow-x-hidden">
          <nav className="container px-4 py-3">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium hover:text-primary transition-colors min-h-[44px] flex items-center"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(item.href)
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2 flex flex-wrap gap-2">
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href="https://github.com/Yash4616" target="_blank" rel="noopener noreferrer">
                    <FaGithub className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href="https://linkedin.com/in/yashgurjar9" target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href="https://x.com/Yash_9724?t=S830SiTORnK3Lmhj4myo5w&s=09" target="_blank" rel="noopener noreferrer">
                    <FaXTwitter className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                </Button>
                <Button size="sm" className="gap-1" asChild>
                  <a href="/assets/pdfs/Resume.pdf" download>
                    <FiDownload className="h-4 w-4" aria-hidden="true" />
                    Resume
                  </a>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}