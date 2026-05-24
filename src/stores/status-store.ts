import { create } from 'zustand'
import { API_REGISTRY } from '@/apis/api-registry'

export type HealthStatus = 'operational' | 'degraded' | 'outage'

interface ApiStatus {
    apiId: string
    status: HealthStatus
    uptime90d: number
}

export interface Incident {
    id: string
    apiId: string
    title: string
    status: 'investigating' | 'resolved'
    startedAt: string
    resolvedAt?: string
    notes: string
}

interface StatusState {
    apis: ApiStatus[]
    incidents: Incident[]
}

export const useStatusStore = create<StatusState>(() => ({
    apis: API_REGISTRY.map((api, i) => ({
        apiId: api.id,
        status: (i === 0 ? 'operational' : 'degraded') as HealthStatus,
        uptime90d: 99.9 - i * 0.5,
    })),
    incidents: [
        {
            id: 'inc-1',
            apiId: 'stub-payments',
            title: 'Elevated latency on payment creation',
            status: 'investigating',
            startedAt: '2025-05-20T14:00:00Z',
            notes: 'Engineering is investigating increased p99 latency.',
        },
        {
            id: 'inc-2',
            apiId: 'pokeapi',
            title: 'Scheduled maintenance completed',
            status: 'resolved',
            startedAt: '2025-05-01T02:00:00Z',
            resolvedAt: '2025-05-01T04:30:00Z',
            notes: 'Database migration completed successfully.',
        },
    ],
}))

export function hasDegradedApis(): boolean {
    const { apis } = useStatusStore.getState()
    return apis.some((a) => a.status === 'degraded' || a.status === 'outage')
}