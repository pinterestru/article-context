import { cn } from '@/lib/utils/cn';

interface PromocodeListSkeletonProps {
  count?: number;
  className?: string;
}

export function PromocodeListSkeleton({ 
  count = 8, 
  className 
}: PromocodeListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative flex items-center gap-2 sm:gap-3 rounded-xl p-3 pr-2 sm:pr-3 min-h-[72px] bg-card border border-border overflow-hidden"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-background/40 to-transparent" />
          
          {/* Discount percentage skeleton - hidden on mobile */}
          <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-20 pr-3 mr-3 border-r border-border">
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          </div>

          {/* Middle - Description skeleton */}
          <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
            <div className="h-4 w-full max-w-[280px] bg-muted rounded animate-pulse" />
            <div className="h-3 w-2/3 max-w-[200px] bg-muted/70 rounded animate-pulse" />
          </div>

          {/* Right side - Button skeleton */}
          <div className="flex-shrink-0">
            <div className="h-9 w-24 sm:w-32 rounded-xl bg-muted border-2 border-dashed border-border animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Single card skeleton for inline usage
 */
export function PromocodeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center gap-2 sm:gap-3 rounded-xl p-3 pr-2 sm:pr-3 min-h-[72px] bg-card border border-border overflow-hidden', className)}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-background/40 to-transparent" />
      
      {/* Discount percentage skeleton - hidden on mobile */}
      <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-20 pr-3 mr-3 border-r border-border">
        <div className="h-8 w-12 bg-muted rounded animate-pulse" />
      </div>

      {/* Middle - Description skeleton */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
        <div className="h-4 w-full max-w-[280px] bg-muted rounded animate-pulse" />
        <div className="h-3 w-2/3 max-w-[200px] bg-muted/70 rounded animate-pulse" />
      </div>

      {/* Right side - Button skeleton */}
      <div className="flex-shrink-0">
        <div className="h-9 w-24 sm:w-32 rounded-xl bg-muted border-2 border-dashed border-border animate-pulse" />
      </div>
    </div>
  );
}