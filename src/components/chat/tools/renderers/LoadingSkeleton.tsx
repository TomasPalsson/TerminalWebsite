type LoadingSkeletonProps = {
  message?: string
  variant?: 'default' | 'card' | 'badges'
}

export function LoadingSkeleton({ message = 'Loading...', variant = 'default' }: LoadingSkeletonProps) {
  return (
    <div className="my-3 not-prose">
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-neutral-900 p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-terminal animate-pulse" />
          <span className="font-mono text-sm text-gray-400">{message}</span>
        </div>
        <div className="mt-4 space-y-3">
          {variant === 'card' && (
            <>
              <div className="h-4 w-3/4 bg-neutral-800 rounded animate-pulse" />
              <div className="h-3 w-full bg-neutral-800 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-neutral-800 rounded animate-pulse" />
            </>
          )}
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-16 bg-neutral-800 rounded animate-pulse" />
            <div className="h-6 w-20 bg-neutral-800 rounded animate-pulse" />
            <div className="h-6 w-14 bg-neutral-800 rounded animate-pulse" />
          </div>
          {variant === 'badges' && (
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-neutral-800 rounded animate-pulse" />
              <div className="h-6 w-16 bg-neutral-800 rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
