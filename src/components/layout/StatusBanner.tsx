import { hasDegradedApis } from '@/stores/status-store'

export function StatusBanner() {
    const degraded = hasDegradedApis()

    if (!degraded) return null

    return (
        <div
            role="alert"
            className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-200"
        >
            One or more APIs are currently degraded. Check the{' '}
            <a href="/status" className="underline">
                status page
            </a>{' '}
            for details.
        </div>
    )
}
