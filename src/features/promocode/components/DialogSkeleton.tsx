export function DialogSkeleton() {
  return (
    <div className="space-y-4 text-center">
      {/* Store logo and name skeleton */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="bg-muted h-12 w-12 animate-pulse rounded-lg" />
        <div className="bg-muted h-5 w-32 animate-pulse rounded" />
      </div>

      {/* Title skeleton */}
      <div className="bg-muted mx-auto h-7 max-w-xs animate-pulse rounded-md" />

      <div className="border-border my-4 border-t" />

      {/* Instructions skeleton */}
      <div className="bg-muted mx-auto h-5 max-w-sm animate-pulse rounded" />

      {/* Promocode box skeleton */}
      <div className="relative inline-flex items-center justify-center">
        <div className="bg-muted/50 border-muted-foreground/30 animate-pulse rounded-lg border-2 border-dashed px-8 py-4">
          <div className="bg-muted h-8 w-32 rounded" />
        </div>
        {/* Copy button skeleton */}
        <div className="bg-background absolute -top-3 -right-3 h-10 w-10 animate-pulse rounded-full shadow-lg" />
      </div>

      {/* Additional info skeleton */}
      <div className="mx-auto max-w-md space-y-2">
        <div className="bg-muted h-4 animate-pulse rounded" />
        <div className="bg-muted mx-auto h-4 w-3/4 animate-pulse rounded" />
      </div>

      {/* More details link skeleton */}
      <div className="bg-muted mx-auto h-4 max-w-xs animate-pulse rounded" />

      {/* Button skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="bg-muted h-12 w-full max-w-sm animate-pulse rounded-lg" />
      </div>
    </div>
  )
}
