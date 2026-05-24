import { useMemo, useState } from 'react'
import { API_REGISTRY } from '@/apis/api-registry.ts'
import type { ChangelogType } from '@/apis/types.ts'
import { ChangelogTypeBadge } from '@/components/ui/Badge.tsx'
import { EmptyState } from '@/components/ui/StateViews.tsx'

export function ChangelogPage() {
  const [apiFilter, setApiFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const entries = useMemo(() => {
    return API_REGISTRY.flatMap((api) =>
      (api.changelog ?? []).map((entry) => ({ ...entry, apiId: api.id, apiName: api.name })),
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const filtered = entries.filter((e) => {
    if (apiFilter !== 'all' && e.apiId !== apiFilter) return false
    if (typeFilter !== 'all' && e.type !== typeFilter) return false
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Changelog</h1>
      <p className="mt-2 text-slate-400">Version history loaded from per-API JSON files.</p>

      <div className="mt-6 flex flex-wrap gap-4">
        <select
          value={apiFilter}
          onChange={(e) => setApiFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          aria-label="Filter by API"
        >
          <option value="all">All APIs</option>
          {API_REGISTRY.map((api) => (
            <option key={api.id} value={api.id}>
              {api.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {(['breaking', 'feature', 'fix'] as ChangelogType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No changelog entries" description="Adjust your filters." />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {filtered.map((entry, i) => (
            <li
              key={`${entry.apiId}-${entry.version}-${i}`}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ChangelogTypeBadge type={entry.type} />
                <span className="font-mono text-sm text-indigo-300">v{entry.version}</span>
                <span className="text-xs text-slate-500">{entry.apiName}</span>
                <span className="text-xs text-slate-600">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              <h2 className="mt-2 font-semibold text-white">{entry.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{entry.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
