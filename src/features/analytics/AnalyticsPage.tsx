import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useKeysStore } from '@/stores/keys-store.ts'
import { EmptyState } from '@/components/ui/StateViews.tsx'

type Window = '7d' | '30d'

function generateMockSeries(window: Window) {
  const days = window === '7d' ? 7 : 30
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calls: Math.floor(800 + Math.random() * 400),
      errors: Math.floor(Math.random() * 40),
      latency: Math.floor(80 + Math.random() * 120),
    }
  })
}

const mockEndpoints = [
  { endpoint: 'GET /pokemon/{name}', calls: 12400, errorRate: 1.2, avgLatency: 95 },
  { endpoint: 'GET /pokemon', calls: 8200, errorRate: 0.8, avgLatency: 110 },
  { endpoint: 'GET /ability/{id}', calls: 2100, errorRate: 2.1, avgLatency: 88 },
]

export function AnalyticsPage() {
  const allKeys = useKeysStore((s) => s.keys)
  const keys = useMemo(() => allKeys.filter((k) => !k.revoked), [allKeys])
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [window, setWindow] = useState<Window>('7d')

  const activeKeyId =
    keys.find((k) => k.id === selectedKeyId)?.id ?? keys[0]?.id ?? ''

  const series = useMemo(() => generateMockSeries(window), [window])
  const totals = useMemo(() => {
    const calls = series.reduce((s, d) => s + d.calls, 0)
    const errors = series.reduce((s, d) => s + d.errors, 0)
    const latency =
      series.reduce((s, d) => s + d.latency, 0) / (series.length || 1)
    return { calls, errorRate: ((errors / calls) * 100).toFixed(1), latency: Math.round(latency) }
  }, [series])

  if (keys.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Usage Analytics</h1>
        <div className="mt-8">
          <EmptyState title="No keys to analyze" description="Create an API key first." />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Usage Analytics</h1>
      <p className="mt-2 text-slate-400">Mocked metrics for dashboard demonstration.</p>

      <div className="mt-6 flex flex-wrap gap-4">
        <select
          value={activeKeyId}
          onChange={(e) => setSelectedKeyId(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          aria-label="Select API key"
        >
          {keys.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-slate-700">
          {(['7d', '30d'] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindow(w)}
              className={`px-4 py-2 text-sm ${
                window === w ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              {w === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-500">Call volume</p>
          <p className="mt-1 text-2xl font-bold text-white">{totals.calls.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-500">Error rate (4xx/5xx)</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{totals.errorRate}%</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-500">Avg latency</p>
          <p className="mt-1 text-2xl font-bold text-white">{totals.latency} ms</p>
        </div>
      </div>

      <div className="mt-8 h-72 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-300">Call volume over time</h2>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={series}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
            />
            <Line type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Per-endpoint breakdown</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Calls</th>
                <th className="px-4 py-3">Error rate</th>
                <th className="px-4 py-3">Avg latency</th>
              </tr>
            </thead>
            <tbody>
              {mockEndpoints.map((row) => (
                <tr key={row.endpoint} className="border-b border-slate-800/50">
                  <td className="px-4 py-3 font-mono text-slate-300">{row.endpoint}</td>
                  <td className="px-4 py-3">{row.calls.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.errorRate}%</td>
                  <td className="px-4 py-3">{row.avgLatency} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
