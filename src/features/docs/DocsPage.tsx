import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getApiById, API_REGISTRY } from '@/apis/api-registry.ts'
import { parseOpenApiSpec } from '@/lib/spec-parser.ts'
import { MethodBadge } from '@/components/ui/Badge.tsx'
import { EmptyState } from '@/components/ui/StateViews.tsx'

export function DocsIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">API Documentation</h1>
      <p className="mt-2 text-slate-400">
        Select an API from the sidebar or press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">Ctrl+K</kbd> to search endpoints.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {API_REGISTRY.map((api) => (
          <Link
            key={api.id}
            to={`/docs/${api.id}`}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-indigo-500/50"
          >
            <h2 className="text-lg font-semibold text-white">{api.name}</h2>
            <p className="mt-1 text-sm text-slate-500">v{api.version}</p>
            <p className="mt-3 text-sm text-slate-400">
              {parseOpenApiSpec(api.spec).length} endpoints
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ApiDocsPage() {
  const { apiId } = useParams<{ apiId: string }>()
  const api = apiId ? getApiById(apiId) : undefined

  if (!api) {
    return <EmptyState title="API not found" description="Check the registry configuration." />
  }

  const endpoints = parseOpenApiSpec(api.spec)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{api.name}</h1>
      <p className="text-sm text-slate-500">v{api.version} · {api.baseUrl}</p>

      {api.docsMarkdown && (
        <section className="prose prose-invert mt-8 max-w-none rounded-xl border border-slate-800 bg-slate-900 p-6 prose-headings:text-white prose-a:text-indigo-400">
          <h2 className="!mt-0 text-lg font-semibold">Getting Started</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{api.docsMarkdown}</ReactMarkdown>
        </section>
      )}

      {api.sdks && api.sdks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">SDKs & Libraries</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {api.sdks.map((sdk) => (
              <div key={sdk.lang} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <p className="font-medium text-slate-200">{sdk.lang}</p>
                <code className="mt-2 block text-xs text-slate-400">{sdk.install}</code>
                <a href={sdk.repo} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-indigo-400 hover:underline">
                  Repository →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Endpoints</h2>
        <ul className="mt-4 space-y-2">
          {endpoints.map((ep) => (
            <li key={ep.id}>
              <Link
                to={`/docs/${api.id}/endpoint/${encodeURIComponent(ep.id)}`}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 transition hover:border-slate-600"
              >
                <MethodBadge method={ep.method} />
                <span className="font-mono text-sm text-slate-300">{ep.path}</span>
                <span className="ml-auto text-sm text-slate-500">{ep.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {api.errors && api.errors.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Error Reference</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">HTTP</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {api.errors.map((err) => (
                  <tr key={err.code} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 font-mono text-indigo-300">{err.code}</td>
                    <td className="px-4 py-3">{err.httpStatus ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{err.description}</td>
                    <td className="px-4 py-3 text-slate-500">{err.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
