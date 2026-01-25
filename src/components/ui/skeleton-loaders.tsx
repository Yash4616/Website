import { cn } from '@/lib/utils'

interface SkeletonCardProps {
    className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
            {/* Image placeholder */}
            <div className="h-48 bg-muted animate-pulse" />
            {/* Content */}
            <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="flex gap-2 pt-2">
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    )
}

export function SkeletonText({ className }: { className?: string }) {
    return (
        <div className={cn("h-4 bg-muted rounded animate-pulse", className)} />
    )
}

export function SkeletonAvatar({ className }: { className?: string }) {
    return (
        <div className={cn("h-12 w-12 rounded-full bg-muted animate-pulse", className)} />
    )
}

export function SkeletonSection({ children, className }: { children?: React.ReactNode; className?: string }) {
    return (
        <div className={cn("py-16 md:py-24", className)}>
            <div className="container px-4">
                {/* Section header */}
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse mb-4" />
                    <div className="h-4 w-full max-w-md mx-auto bg-muted rounded animate-pulse" />
                </div>
                {children}
            </div>
        </div>
    )
}
