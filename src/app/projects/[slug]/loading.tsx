export default function ProjectLoading() {
    return (
        <main className="pt-20 pb-16">
            <div className="container px-4">
                {/* Back button skeleton */}
                <div className="h-6 w-32 bg-muted rounded animate-pulse mb-8" />

                <div className="max-w-4xl mx-auto">
                    {/* Header skeleton */}
                    <div className="mb-8">
                        <div className="h-10 w-3/4 bg-muted rounded animate-pulse mb-4" />
                        <div className="h-6 w-full bg-muted rounded animate-pulse" />
                    </div>

                    {/* Image skeleton */}
                    <div className="aspect-video rounded-lg bg-muted animate-pulse mb-8" />

                    {/* Technologies skeleton */}
                    <div className="mb-8">
                        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Actions skeleton */}
                    <div className="flex gap-4">
                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </main>
    )
}
