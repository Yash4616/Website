"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TextRevealProps {
    text: string
    className?: string
    delay?: number
    staggerDelay?: number
    duration?: number
    once?: boolean
}

export function TextReveal({
    text,
    className,
    delay = 0,
    staggerDelay = 0.05,
    duration = 0.5,
    once = true,
}: TextRevealProps) {
    const letters = text.split("")

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delay,
            },
        }),
    }

    const child = {
        hidden: {
            opacity: 0,
            y: 20,
            rotateX: -90,
        },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
                duration: duration,
            },
        },
    }

    return (
        <motion.span
            className={cn("inline-flex overflow-hidden", className)}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once }}
        >
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    className="inline-block"
                    style={{
                        transformOrigin: "bottom",
                        display: letter === " " ? "inline" : "inline-block",
                        width: letter === " " ? "0.3em" : "auto",
                    }}
                >
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.span>
    )
}

// Word-by-word reveal variant
interface WordRevealProps {
    text: string
    className?: string
    delay?: number
    staggerDelay?: number
    once?: boolean
}

export function WordReveal({
    text,
    className,
    delay = 0,
    staggerDelay = 0.1,
    once = true,
}: WordRevealProps) {
    const words = text.split(" ")

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delay,
            },
        },
    }

    const child = {
        hidden: {
            opacity: 0,
            y: 30,
            filter: "blur(10px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 150,
            },
        },
    }

    return (
        <motion.span
            className={cn("inline-flex flex-wrap", className)}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once }}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    )
}

// Slide up reveal for single elements
interface SlideRevealProps {
    children: React.ReactNode
    className?: string
    delay?: number
    duration?: number
    once?: boolean
}

export function SlideReveal({
    children,
    className,
    delay = 0,
    duration = 0.6,
    once = true,
}: SlideRevealProps) {
    return (
        <div className={cn("overflow-hidden", className)}>
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once }}
                transition={{
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    )
}
