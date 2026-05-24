import { NavLink, Outlet } from 'react-router-dom'
import { API_REGISTRY } from '@/apis/api-registry'
import { Button } from '@/components/ui/Button.tsx'
import { cn } from '@/lib/cn.ts'
import { StatusBanner } from './StatusBanner.tsx'

const navItems = [
    { to: '/docs', label: 'Documentation' },
    { to: '/keys', label: 'API Keys' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/status', label: 'Status' },
    { to: '/changelog', label: 'Changelog' },
]

export function AppLayout() {
    // TODO: Implement authentication check

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <StatusBanner />
            <div className="flex min-h-0 flex-1">
                <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
                    <div className="shrink-0 border-b border-slate-800 p-4">
                        <h1 className="text-lg font-bold text-white">Dev Portal</h1>
                        {/* TODO: Implement user email */}
                        <p className="truncate text-xs text-slate-500">{'Dummy'}</p>
                    </div>
                    <nav
                        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3"
                        aria-label="Main navigation"
                    >
                        <ul className="space-y-1">
                            {navItems.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.to === '/docs'}
                                        className={({ isActive }) =>
                                            cn(
                                                'block rounded-lg px-3 py-2 text-sm transition',
                                                isActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800',
                                            )
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase text-slate-600">APIs</p>
                        <ul className="space-y-1">
                            {API_REGISTRY.map((api) => (
                                <li key={api.id}>
                                    <NavLink
                                        to={`/docs/${api.id}`}
                                        className={({ isActive }) =>
                                            cn(
                                                'block rounded-lg px-3 py-2 text-sm transition',
                                                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800',
                                            )
                                        }
                                    >
                                        {api.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="shrink-0 border-t border-slate-800 p-3">
                        <Button
                            variant="ghost"
                            className="w-full"
                            // TODO: Implement sign out
                            onClick={() => { }}
                        >
                            Sign out
                        </Button>
                    </div>
                </aside>
                <main className="min-h-0 flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
