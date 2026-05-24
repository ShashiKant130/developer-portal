import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEndpoints } from '@/lib/spec-parser.ts'
import { API_REGISTRY } from '@/apis/api-registry.ts'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const endpoints = getAllEndpoints(API_REGISTRY)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  const q = query.toLowerCase()
  const results = endpoints.filter(
    (ep) =>
      !q ||
      ep.summary.toLowerCase().includes(q) ||
      ep.path.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q) ||
      ep.parameters.some((p) => p.name.toLowerCase().includes(q)),
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-label="Search endpoints"
    >
      <div
        className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Search endpoints… (Esc to close)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-b border-slate-700 bg-transparent px-4 py-3 text-slate-100 outline-none"
        />
        <ul className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No results</li>
          ) : (
            results.slice(0, 20).map((ep) => (
              <li key={`${ep.apiId}-${ep.id}`}>
                <button
                  type="button"
                  className="flex w-full flex-col px-4 py-2 text-left hover:bg-slate-800"
                  onClick={() => {
                    navigate(`/docs/${ep.apiId}/endpoint/${encodeURIComponent(ep.id)}`)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  <span className="text-sm font-medium text-slate-200">
                    {ep.method} {ep.path}
                  </span>
                  <span className="text-xs text-slate-500">
                    {ep.apiName} — {ep.summary}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
