export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
  }
  
  export function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 py-16 text-center">
        <p className="text-lg font-medium text-slate-300">{title}</p>
        {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      </div>
    )
  }
  
  export function ErrorState({
    title,
    message,
    onRetry,
  }: {
    title: string
    message?: string
    onRetry?: () => void
  }) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="font-medium text-red-400">{title}</p>
        {message && <p className="mt-2 text-sm text-red-300/80">{message}</p>}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 text-sm text-indigo-400 hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    )
  }
  