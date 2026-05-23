import { cn } from '@/lib/cn'

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  PATCH: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/40',
}

export function MethodBadge({ method }: { method: string }) {
  const m = method.toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex rounded border px-2 py-0.5 font-mono text-xs font-semibold',
        methodColors[m] ?? 'bg-slate-500/20 text-slate-400',
      )}
    >
      {m}
    </span>
  )
}

export function StatusBadge({ status }: { status: number | string }) {
  const code = typeof status === 'string' ? parseInt(status, 10) : status
  let color = 'bg-slate-500/20 text-slate-400 border-slate-500/40'
  if (code >= 200 && code < 300) color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  else if (code >= 300 && code < 400) color = 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  else if (code >= 400 && code < 500) color = 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  else if (code >= 500) color = 'bg-red-500/20 text-red-400 border-red-500/40'

  return (
    <span className={cn('inline-flex rounded border px-2 py-0.5 font-mono text-xs font-semibold', color)}>
      {status}
    </span>
  )
}

export function EnvBadge({ env }: { env: string }) {
  const colors =
    env === 'production'
      ? 'bg-purple-500/20 text-purple-300'
      : 'bg-cyan-500/20 text-cyan-300'
  return (
    <span className={cn('rounded px-2 py-0.5 text-xs font-medium', colors)}>{env}</span>
  )
}

export function ChangelogTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    breaking: 'bg-red-500/20 text-red-400',
    feature: 'bg-blue-500/20 text-blue-400',
    fix: 'bg-emerald-500/20 text-emerald-400',
  }
  return (
    <span className={cn('rounded px-2 py-0.5 text-xs font-medium uppercase', colors[type] ?? '')}>
      {type}
    </span>
  )
}
