// src/features/article/components/WidgetSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function WidgetSkeleton() {
  return (
    <div className="my-6 rounded-lg border p-4">
      <Skeleton className="h-8 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
