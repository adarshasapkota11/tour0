export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-subtle ${className}`} />
}

export function ActivityCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-line">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function DestinationCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-line">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function ActivityGridSkeleton({ count = 6 }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DestinationGridSkeleton({ count = 6 }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  )
}
