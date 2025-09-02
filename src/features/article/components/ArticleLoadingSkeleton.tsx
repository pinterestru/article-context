import { Skeleton } from '@/components/ui/skeleton';

export function ArticleLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Title skeleton */}
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-4/5 mx-auto" />
        
        {/* Meta info skeleton */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-1 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Hero image skeleton */}
      <div className="relative w-full h-64 md:h-96 bg-muted rounded-lg animate-pulse overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-background/20 to-transparent" />
      </div>
      
      {/* First paragraph */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      {/* Subheading */}
      <Skeleton className="h-8 w-3/5 mt-8" />
      
      {/* Content with varied lengths */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Widget placeholder - Promocode list */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      
      {/* Another subheading */}
      <Skeleton className="h-8 w-2/5 mt-8" />
      
      {/* Blockquote skeleton */}
      <div className="border-l-4 border-border pl-6 space-y-2">
        <Skeleton className="h-4 w-full italic" />
        <Skeleton className="h-4 w-4/5 italic" />
      </div>
      
      {/* List skeleton */}
      <div className="space-y-2 pl-6">
        <div className="flex gap-3">
          <Skeleton className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      
      {/* More content */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
      
      {/* Another widget */}
      <div className="bg-muted/50 rounded-lg p-6">
        <Skeleton className="h-24 w-full" />
      </div>
      
      {/* Final paragraph */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}