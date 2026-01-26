"use client"

import * as React from "react"
import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface RippleProps {
    children: React.ReactNode
    className?: string
    color?: string
    duration?: number
    disabled?: boolean
}

interface Ripple {
    id: number
    x: number
    y: number
    size: number
}

export function Ripple({
    children,
    className,
    color = "currentColor",
    duration,
    disabled = false,
}: RippleProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const rippleIdRef = useRef(0)

    const createRipple = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return

        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()

        // Get click/touch position
        let x: number, y: number
        if ('touches' in event) {
            x = event.touches[0].clientX - rect.left
            y = event.touches[0].clientY - rect.top
        } else {
            x = event.clientX - rect.left
            y = event.clientY - rect.top
        }

        // Calculate ripple size based on container dimensions
        const size = Math.max(rect.width, rect.height) * 2.5

        // Calculate duration based on size (M3 physics)
        const calculatedDuration = duration || Math.min(900, Math.max(400, size * 1.5))

        // Create ripple element
        const ripple = document.createElement('span')
        ripple.className = 'ripple-effect'
        ripple.style.cssText = `
      position: absolute;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      opacity: 0.12;
      transform: scale(0);
      pointer-events: none;
    `

        // Use WAAPI for smooth 60fps animation
        container.appendChild(ripple)

        const animation = ripple.animate([
            { transform: 'scale(0)', opacity: 0.12 },
            { transform: 'scale(1)', opacity: 0.08 },
        ], {
            duration: calculatedDuration,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
            fill: 'forwards'
        })

        // Fade out on animation complete
        animation.onfinish = () => {
            const fadeOut = ripple.animate([
                { opacity: 0.08 },
                { opacity: 0 }
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            })

            fadeOut.onfinish = () => {
                ripple.remove()
            }
        }
    }, [color, duration, disabled])

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
            onMouseDown={createRipple}
            onTouchStart={createRipple}
            style={{ isolation: 'isolate' }}
        >
            {children}
        </div>
    )
}

// Wrapper component for elements that need ripple + hover states
interface RippleCardProps {
    children: React.ReactNode
    className?: string
    rippleColor?: string
    onClick?: () => void
}

export function RippleCard({
    children,
    className,
    rippleColor = "rgba(255,255,255,0.3)",
    onClick,
}: RippleCardProps) {
    return (
        <Ripple
            color={rippleColor}
            className={cn(
                "cursor-pointer select-none",
                className
            )}
        >
            <div onClick={onClick} className="w-full h-full">
                {children}
            </div>
        </Ripple>
    )
}
