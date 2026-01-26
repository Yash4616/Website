"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface LiquidGlassButtonProps {
    children: React.ReactNode
    className?: string
    size?: "default" | "sm" | "lg"
    onClick?: () => void
    disabled?: boolean
    type?: "button" | "submit" | "reset"
}

export function LiquidGlassButton({
    children,
    className,
    size = "default",
    onClick,
    disabled,
    type = "button",
}: LiquidGlassButtonProps) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove(event: React.MouseEvent<HTMLButtonElement>) {
        const { left, top } = event.currentTarget.getBoundingClientRect()
        mouseX.set(event.clientX - left)
        mouseY.set(event.clientY - top)
    }

    const background = useMotionTemplate`radial-gradient(100px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.12), transparent 70%)`

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            onMouseMove={handleMouseMove}
            className={cn(
                "group relative overflow-hidden rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center",
                "bg-white/10 backdrop-blur-xl border border-white/20",
                "hover:bg-white/15 hover:border-white/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                // Size variants
                size === "sm" && "px-4 py-2 text-sm gap-1.5",
                size === "default" && "px-5 py-2.5 text-sm gap-2",
                size === "lg" && "px-6 py-3 text-base gap-2",
                className
            )}
            whileHover={disabled ? {} : { scale: 1.03 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            transition={{ type: "tween", duration: 0.15 }}
        >
            {/* Glass shine effect */}
            <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                }}
            />

            {/* Mouse follow highlight */}
            <motion.div
                className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background }}
            />

            {/* Top edge highlight */}
            <div
                className="absolute inset-x-3 top-0 h-px rounded-full pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    )
}

// Wrapper for Link usage
interface LiquidGlassLinkButtonProps {
    children: React.ReactNode
    className?: string
    size?: "default" | "sm" | "lg"
    href: string
    download?: boolean
    target?: string
    rel?: string
    "aria-label"?: string
}

export function LiquidGlassLinkButton({
    children,
    className,
    size = "default",
    href,
    download,
    target,
    rel,
    "aria-label": ariaLabel,
}: LiquidGlassLinkButtonProps) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove(event: React.MouseEvent<HTMLAnchorElement>) {
        const { left, top } = event.currentTarget.getBoundingClientRect()
        mouseX.set(event.clientX - left)
        mouseY.set(event.clientY - top)
    }

    const background = useMotionTemplate`radial-gradient(100px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.12), transparent 70%)`

    return (
        <motion.a
            href={href}
            download={download}
            target={target}
            rel={rel}
            aria-label={ariaLabel}
            onMouseMove={handleMouseMove}
            className={cn(
                "group relative overflow-hidden rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center",
                "bg-white/10 backdrop-blur-xl border border-white/20",
                "hover:bg-white/15 hover:border-white/30",
                // Size variants
                size === "sm" && "px-4 py-2 text-sm gap-1.5",
                size === "default" && "px-5 py-2.5 text-sm gap-2",
                size === "lg" && "px-6 py-3 text-base gap-2",
                className
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "tween", duration: 0.15 }}
        >
            {/* Glass shine effect */}
            <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                }}
            />

            {/* Mouse follow highlight */}
            <motion.div
                className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background }}
            />

            {/* Top edge highlight */}
            <div
                className="absolute inset-x-3 top-0 h-px rounded-full pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.a>
    )
}
