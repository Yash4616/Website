"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Aurora from '@/components/features/Aurora';
import { TextReveal } from '@/components/ui/text-reveal'
import { motion } from 'framer-motion'
import { FiArrowDown, FiEye } from 'react-icons/fi'

const TYPING_TEXTS = ['Computer Vision', 'Neural Networks', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NLP', 'Artificial Intelligence'] as const;
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;

export default function HeroSection() {
  const [typedText, setTypedText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Current text being typed
      const currentText = TYPING_TEXTS[textIndex]

      // If deleting
      if (isDeleting) {
        setTypedText(currentText.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)

        // If done deleting
        if (charIndex <= 1) {
          setIsDeleting(false)
          setTextIndex((textIndex + 1) % TYPING_TEXTS.length)
        }
      }
      // If typing
      else {
        setTypedText(currentText.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)

        // If done typing
        if (charIndex >= currentText.length) {
          // Pause before deleting
          if (!isDeleting) {
            // We need to pause here, but this useEffect structure makes it hard without extra state.
            // Simplest fix: just don't set isDeleting immediately if we want pause?
            // Actually, let's keep it simple: just let it delete immediately for now to avoid complexity, 
            // or use a delay mechanism if I can.
            // But to strictly follow 'restore' without breaking:
            setIsDeleting(true)
          }
        }
      }
    }, isDeleting ? DELETING_SPEED : TYPING_SPEED)

    return () => clearTimeout(timeout)
  }, [charIndex, textIndex, isDeleting])

  const scrollToProjects = () => {
    const element = document.querySelector('#projects')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToContact = () => {
    const element = document.querySelector('#contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      className="min-h-dvh relative flex items-center overflow-hidden pt-16"
    >
      {/* Aurora background effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '220px' }}>
          <Aurora />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container z-10 relative">
        <div className="max-w-3xl flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-none">
            <TextReveal
              text="Yash Gurjar"
              staggerDelay={0.06}
              delay={0.2}
            />
            <span className="block text-foreground mt-0.5">
              <TextReveal
                text="AI & ML Engineer"
                staggerDelay={0.04}
                delay={0.8}
              />
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-8"
          >
            <p className="text-xl sm:text-2xl font-medium text-muted-foreground">
              Specializing in <span className="text-primary pl-2">{typedText}</span>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl"
          >
            Turning complex data into intelligent solutions through innovative AI/ML algorithms and deep learning architectures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 flex flex-wrap gap-4"
          >
            <Button size="lg" onClick={scrollToProjects} className="gap-2">
              <FiEye className="h-5 w-5" aria-hidden="true" />
              View Projects
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToContact}>
              Contact Me
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-2">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FiArrowDown className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}