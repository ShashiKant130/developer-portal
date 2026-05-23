import { Link, useParams } from 'react-router-dom'
import { getApiById } from '@/apis/api-registry.ts'
import { parseOpenApiSpec } from '@/lib/spec-parser.ts'
import { MethodBadge } from '@/components/ui/Badge.tsx'
import { EmptyState, ErrorState } from '@/components/ui/StateViews.tsx'
import { SandboxPanel } from '@/features/sandbox/SandboxPanel.tsx'

export function EndpointPage() {
  const { apiId, endpointId } = useParams<{ apiId: string; endpointId: string }>()
  const api = apiId ? getApiById(apiId) : undefined
  const decodedId = endpointId ? decodeURIComponent(endpointId) : ''
  const endpoint = api ? parseOpenApiSpec(api.spec).find((e) => e.id === decodedId) : undefined

  if (!api) return <ErrorState title="API not found" />
  if (!endpoint) return <EmptyState title="Endpoint not found" description="Return to the API docs." />

  return (
    <div className="space-y-8">
      <div>
        <Link to={`/docs/${api.id}`} className="text-sm text-indigo-400 hover:underline">
          ← {api.name}
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <code className="text-lg text-white">{endpoint.path}</code>
        </div>
        <h1 className="mt-2 text-xl font-semibold text-slate-200">{endpoint.summary}</h1>
        {endpoint.description && (
          <p className="mt-2 text-slate-400">{endpoint.description}</p>
        )}
      </div>

      {endpoint.parameters.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white">Parameters</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((p) => (
                  <tr key={`${p.in}-${p.name}`} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 font-mono text-indigo-300">{p.name}</td>
                    <td className="px-4 py-3">{p.in}</td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3">{p.required ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-slate-400">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {endpoint.requestBody && (
        <section>
          <h2 className="text-lg font-semibold text-white">Request Body</h2>
          <p className="mt-1 text-sm text-slate-500">{endpoint.requestBody.description}</p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            {endpoint.requestBody.example}
          </pre>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-white">Responses</h2>
        <ul className="mt-3 space-y-2">
          {endpoint.responses.map((r) => (
            <li
              key={r.status}
              className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <span className="font-mono font-semibold text-emerald-400">{r.status}</span>
              <span className="ml-3 text-slate-400">{r.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <SandboxPanel api={api} endpoint={endpoint} />
    </div>
  )
}
