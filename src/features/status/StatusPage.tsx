import { API_REGISTRY } from '@/apis/api-registry'
import { useStatusStore, type HealthStatus } from '@/stores/status-store.ts'

const statusColors: Record<HealthStatus, string> = {
  operational: 'text-emerald-400',
  degraded: 'text-amber-400',
  outage: 'text-red-400',
}

const statusLabels: Record<HealthStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
}

export function StatusPage() {
  const apis = useStatusStore((s) => s.apis)
  const incidents = useStatusStore((s) => s.incidents)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">API Status</h1>
      <p className="mt-2 text-slate-400">System health and incident history (mocked data).</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {API_REGISTRY.map((api) => {
          const status = apis.find((a) => a.apiId === api.id)
          return (
            <div
              key={api.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{api.name}</h2>
                <span
                  className={`text-sm font-medium ${statusColors[status?.status ?? 'operational']}`}
                >
                  {statusLabels[status?.status ?? 'operational']}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-200">
                {status?.uptime90d.toFixed(2)}%
              </p>
              <p className="text-xs text-slate-500">90-day uptime</p>
            </div>
          )
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Incident history</h2>
        <ul className="mt-4 space-y-4">
          {incidents.map((inc) => {
            const apiName = API_REGISTRY.find((a) => a.id === inc.apiId)?.name ?? inc.apiId
            return (
              <li
                key={inc.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{inc.title}</span>
                  <span className="text-xs text-slate-500">{apiName}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      inc.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{inc.notes}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Started {new Date(inc.startedAt).toLocaleString()}
                  {inc.resolvedAt &&
                    ` · Resolved ${new Date(inc.resolvedAt).toLocaleString()}`}
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
