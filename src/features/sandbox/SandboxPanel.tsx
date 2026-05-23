import { useMemo, useState } from 'react'
import type { ApiDefinition, EndpointDef } from '@/apis/types'
import { Button } from '@/components/ui/Button.tsx'
import { StatusBadge } from '@/components/ui/Badge.tsx'
import { CodeBlock } from '@/components/ui/CodeBlock.tsx'
import { Input, Label } from '@/components/ui/Input.jsx'
import { ErrorState, Skeleton } from '@/components/ui/StateViews'
import { useKeysStore } from '@/stores/keys-store.ts'
import {
  generateCurl,
  generateFetch,
  generatePython,
  type SnippetRequest,
} from '@/lib/snippet-generator'
import { useSandboxRequest } from './useSandboxRequest.ts'

interface SandboxPanelProps {
  api: ApiDefinition
  endpoint: EndpointDef
}

export function SandboxPanel({ api, endpoint }: SandboxPanelProps) {
    // TODO: Implement getAccessToken
    const getAccessToken = () => {
        return 'dummy-token'
    }
  const allKeys = useKeysStore((s) => s.keys)
  const touchKey = useKeysStore((s) => s.touchKey)
  const activeKey = useMemo(
    () => allKeys.find((k) => !k.revoked),
    [allKeys],
  )

  const { mutate, isPending, data: result, error, reset } = useSandboxRequest()

  const pathParams = useMemo(
    () => endpoint.parameters.filter((p) => p.in === 'path'),
    [endpoint],
  )
  const queryParams = useMemo(
    () => endpoint.parameters.filter((p) => p.in === 'query'),
    [endpoint],
  )

  const [pathValues, setPathValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(pathParams.map((p) => [p.name, p.example || ''])),
  )
  const [queryValues, setQueryValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(queryParams.map((p) => [p.name, p.example || ''])),
  )
  const [body, setBody] = useState(endpoint.requestBody?.example ?? '{}')
  const [extraHeaders, setExtraHeaders] = useState('{}')
  const [snippetTab, setSnippetTab] = useState<'curl' | 'fetch' | 'python'>('curl')

  const buildUrl = () => {
    let path = endpoint.path
    for (const p of pathParams) {
      path = path.replace(`{${p.name}}`, encodeURIComponent(pathValues[p.name] ?? ''))
    }
    const url = new URL(api.baseUrl + path)
    for (const p of queryParams) {
      const v = queryValues[p.name]
      if (v) url.searchParams.set(p.name, v)
    }
    return url.toString()
  }

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    const token = getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (activeKey && !activeKey.revoked) {
      headers['X-Api-Key'] = activeKey.secret
    }
    try {
      const extra = JSON.parse(extraHeaders) as Record<string, string>
      Object.assign(headers, extra)
    } catch {
      /* ignore invalid JSON */
    }
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  const sendRequest = () => {
    reset()
    mutate(
      {
        url: buildUrl(),
        method: endpoint.method,
        headers: buildHeaders(),
        body: ['POST', 'PUT', 'PATCH'].includes(endpoint.method) ? body : undefined,
      },
      {
        onSuccess: () => {
          if (activeKey && !activeKey.revoked) {
            touchKey(activeKey.id)
          }
        },
      },
    )
  }

  const snippetReq: SnippetRequest = {
    method: endpoint.method,
    url: buildUrl(),
    headers: buildHeaders(),
    body: ['POST', 'PUT', 'PATCH'].includes(endpoint.method) ? body : undefined,
  }

  const snippets = {
    curl: generateCurl(snippetReq),
    fetch: generateFetch(snippetReq),
    python: generatePython(snippetReq),
  }

  const errorMessage = error?.message ?? null

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold text-white">Interactive Sandbox</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {pathParams.map((p) => (
          <div key={p.name}>
            <Label htmlFor={`path-${p.name}`}>{p.name} (path)</Label>
            <Input
              id={`path-${p.name}`}
              value={pathValues[p.name] ?? ''}
              onChange={(e) => setPathValues((v) => ({ ...v, [p.name]: e.target.value }))}
            />
          </div>
        ))}
        {queryParams.map((p) => (
          <div key={p.name}>
            <Label htmlFor={`query-${p.name}`}>{p.name} (query)</Label>
            <Input
              id={`query-${p.name}`}
              value={queryValues[p.name] ?? ''}
              onChange={(e) => setQueryValues((v) => ({ ...v, [p.name]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {endpoint.requestBody && (
        <div className="mt-4">
          <Label htmlFor="body">Request body (JSON)</Label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-300"
          />
        </div>
      )}

      <div className="mt-4">
        <Label htmlFor="headers">Extra headers (JSON)</Label>
        <Input id="headers" value={extraHeaders} onChange={(e) => setExtraHeaders(e.target.value)} />
      </div>

      <Button type="button" className="mt-4" onClick={sendRequest} disabled={isPending}>
        {isPending ? 'Sending…' : 'Send request'}
      </Button>

      {isPending && <Skeleton className="mt-4 h-32 w-full" />}
      {errorMessage && (
        <div className="mt-4">
          <ErrorState
            title="Request failed"
            message={errorMessage}
            onRetry={sendRequest}
          />
        </div>
      )}
      {result && !errorMessage && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <StatusBadge status={result.status} />
            <span className="text-sm text-slate-400">{result.latencyMs} ms</span>
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            {result.body}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-300">Code snippets</h3>
        <p className="mt-1 text-xs text-slate-500">
          cURL is one line for terminal paste. On Windows PowerShell use{' '}
          <code className="text-slate-400">curl.exe</code> if{' '}
          <code className="text-slate-400">curl</code> fails (PowerShell alias). PokéAPI
          does not require auth headers.
        </p>
        <div className="mt-2 flex gap-2">
          {(['curl', 'fetch', 'python'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSnippetTab(tab)}
              className={`rounded px-3 py-1 text-xs capitalize ${
                snippetTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab === 'fetch' ? 'JavaScript' : tab}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <CodeBlock code={snippets[snippetTab]} language={snippetTab} />
        </div>
      </div>
    </section>
  )
}
