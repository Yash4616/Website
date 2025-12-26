"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Aurora from './Aurora';
import { motion } from 'framer-motion'
import { FiArrowDown, FiEye } from 'react-icons/fi'

const TYPING_TEXTS = ['Computer Vision', 'Neural Networks', 'TensorFlow', 'Machine Learning','Deep Learning', 'NLP', 'Artificial Intelligence'] as const;
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_TIME = 1500;

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
          setIsDeleting(true)
          clearTimeout(timeout)
          setTimeout(() => {
            // Continue with deletion after pause
          }, PAUSE_TIME)
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
      className="min-h-screen relative flex items-center overflow-hidden pt-16"
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
      <div className="container px-4 z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Yash Gurjar
              <span className="block text-primary mt-2">AI & ML Engineer</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 h-8"
          >
            <p className="text-xl sm:text-2xl font-medium text-muted-foreground">
              Specializing in <span className="text-primary">{typedText}</span>
              <span className="animate-blink">|</span>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl"
          >
            Turning complex data into intelligent solutions through innovative AI/ML algorithms and deep learning architectures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button size="lg" onClick={scrollToProjects} className="gap-2">
              <FiEye className="h-5 w-5" />
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
          <FiArrowDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  )
}