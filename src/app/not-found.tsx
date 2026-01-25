import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center px-4">
                <div className="relative">
                    <span className="text-[150px] md:text-[200px] font-bold text-muted-foreground/20 select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-bold">Page Not Found</span>
                    </div>
                </div>
                <p className="text-muted-foreground max-w-md text-lg">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Button asChild size="lg">
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        </div>
    )
}
