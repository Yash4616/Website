'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center px-4">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-destructive"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
                    <p className="text-muted-foreground max-w-md">
                        An unexpected error occurred. Please try again or contact me if the problem persists.
                    </p>
                </div>
                <Button onClick={reset}>Try again</Button>
            </div>
        </div>
    )
}
