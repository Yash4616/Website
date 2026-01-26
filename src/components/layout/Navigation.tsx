"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LiquidGlassLinkButton } from '@/components/ui/liquid-glass-button'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FiDownload, FiMenu, FiX, FiHome, FiUser, FiCode, FiFolderPlus, FiMail } from 'react-icons/fi'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { name: 'Home', href: '#hero', icon: <FiHome className="h-4 w-4" /> },
  { name: 'About', href: '#about', icon: <FiUser className="h-4 w-4" /> },
  { name: 'Skills', href: '#skills', icon: <FiCode className="h-4 w-4" /> },
  { name: 'Projects', href: '#projects', icon: <FiFolderPlus className="h-4 w-4" /> },
  { name: 'Contact', href: '#contact', icon: <FiMail className="h-4 w-4" /> },
]

function TubelightNavbar({
  items,
  activeTab,
  setActiveTab,
}: {
  items: NavItem[]
  activeTab: string
  setActiveTab: (name: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5 bg-muted/40 backdrop-blur-xl p-1.5 rounded-full border border-border/40 shadow-lg shadow-black/5">
      {items.map((item) => {
        const isActive = activeTab === item.name
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab(item.name)
              const element = document.querySelector(item.href)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-full",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            {/* Single animated pill with glow effect */}
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 rounded-full bg-background border border-border/60"
                style={{
                  boxShadow: `
                    0 0 0 1px hsl(var(--border) / 0.3),
                    0 1px 3px hsl(0 0% 0% / 0.1),
                    inset 0 1px 0 hsl(0 0% 100% / 0.1)
                  `,
                }}
                transition={{
                  type: 'tween',
                  ease: [0.25, 0.1, 0.25, 1],
                  duration: 0.2,
                }}
              >
                {/* Tubelight glow - top edge */}
                <div
                  className="absolute -top-px left-3 right-3 h-px rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.5) 50%, transparent 100%)',
                    boxShadow: '0 0 6px 1px hsl(0 0% 100% / 0.25)',
                  }}
                />
              </motion.div>
            )}

            {/* Desktop: Text only */}
            <span className="relative z-10 hidden sm:block">{item.name}</span>

            {/* Mobile: Icon only */}
            <span className="relative z-10 sm:hidden">{item.icon}</span>
          </Link>
        )
      })}
    </div>
  )
}


export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)

      // Update active tab based on scroll position
      const sections = navItems.map(item => ({
        name: item.name,
        element: document.querySelector(item.href)
      }))

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveTab(section.name)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        {/* Logo */}
        <Link
          href="#hero"
          className="text-xl font-bold tracking-tight hover:text-primary transition-colors"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('Home')
            const element = document.querySelector('#hero')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          Yash Gurjar
        </Link>

        {/* Desktop navigation with Tubelight effect */}
        <nav className="hidden lg:flex items-center gap-6">
          <TubelightNavbar
            items={navItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://github.com/Yash4616" target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile (opens in new tab)">
                  <FaGithub className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://linkedin.com/in/yashgurjar9" target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile (opens in new tab)">
                  <FaLinkedin className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="https://x.com/Yash_9724" target="_blank" rel="noopener noreferrer" aria-label="View X/Twitter profile (opens in new tab)">
                  <FaXTwitter className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
            </div>
            <LiquidGlassLinkButton
              href="/assets/pdfs/Resume.pdf"
              download
              size="sm"
              aria-label="Download Resume (PDF)"
            >
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              Resume
            </LiquidGlassLinkButton>
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-4">
          <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen}>
            <div className="relative w-6 h-6">
              <FiMenu className={`absolute inset-0 h-6 w-6 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true" />
              <FiX className={`absolute inset-0 h-6 w-6 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden bg-background/95 backdrop-blur-md border-b pb-4 overflow-x-hidden"
        >
          <nav className="container px-4 py-3">
            {/* Mobile Tubelight Navbar */}
            <div className="flex justify-center mb-4">
              <TubelightNavbar
                items={navItems}
                activeTab={activeTab}
                setActiveTab={(name) => {
                  setActiveTab(name)
                  setMobileMenuOpen(false)
                }}
              />
            </div>

            <div className="flex justify-center flex-wrap gap-2 pt-2">
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
              <LiquidGlassLinkButton
                href="/assets/pdfs/Resume.pdf"
                download
                size="sm"
                aria-label="Download Resume (PDF)"
              >
                <FiDownload className="h-4 w-4" aria-hidden="true" />
                Resume
              </LiquidGlassLinkButton>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  )
}