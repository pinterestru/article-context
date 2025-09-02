export default function ArticleLoading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Article Header Skeleton */}
        <div className="mb-8">
          <div className="bg-muted mb-4 h-12 animate-pulse rounded-lg" />
          <div className="bg-muted h-6 max-w-2xl animate-pulse rounded-lg" />
        </div>

        {/* Article Meta Skeleton */}
        <div className="border-border mb-8 flex items-center gap-4 border-b pb-8">
          <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
          <div className="flex-1">
            <div className="bg-muted mb-2 h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
          </div>
        </div>

        {/* Article Content Skeleton */}
        <div className="space-y-4">
          <div className="bg-muted h-4 animate-pulse rounded" />
          <div className="bg-muted h-4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />

          <div className="bg-muted my-8 h-64 animate-pulse rounded-lg" />

          <div className="bg-muted h-4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
          <div className="bg-muted h-4 animate-pulse rounded" />

          <div className="bg-muted my-8 h-32 animate-pulse rounded-lg" />

          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
        </div>

        {/* Promocode Widget Skeleton */}
        <div className="border-border mt-12 rounded-lg border p-6">
          <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
          <div className="bg-muted h-12 animate-pulse rounded" />
        </div>
      </div>
    </main>
  )
}
