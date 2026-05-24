import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import { CopyButton } from '@/components/ui/CopyButton.tsx'
import { EnvBadge } from '@/components/ui/Badge.tsx'
import { Input, Label } from '@/components/ui/Input.tsx'
import { EmptyState } from '@/components/ui/StateViews.tsx'
import {
  maskKey,
  useKeysStore,
  type KeyEnvironment,
} from '@/stores/keys-store'

export function KeysPage() {
  const { keys, createKey, revokeKey } = useKeysStore()
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<KeyEnvironment>('sandbox')
  const [expiresAt, setExpiresAt] = useState('')
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const activeKeys = keys.filter((k) => !k.revoked)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const { fullSecret } = createKey({
      name: name.trim(),
      environment,
      expiresAt: expiresAt || null,
    })
    setNewKeySecret(fullSecret)
    setName('')
    setExpiresAt('')
  }

  const confirmRevoke = () => {
    if (revokeId) {
      revokeKey(revokeId)
      setRevokeId(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">API Keys</h1>
      <p className="mt-2 text-slate-400">Create and manage keys for sandbox and production.</p>

      {newKeySecret && (
        <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-6" role="alert">
          <p className="font-semibold text-amber-200">Save your API key now</p>
          <p className="mt-1 text-sm text-amber-300/80">
            This is the only time the full key will be shown. Store it securely.
          </p>
          <code className="mt-4 block break-all rounded-lg bg-slate-950 p-3 font-mono text-sm text-white">
            {newKeySecret}
          </code>
          <div className="mt-4 flex flex-wrap items-start gap-4">
            <CopyButton text={newKeySecret} label="Copy key" variant="primary" size="md" />
            <Button type="button" variant="secondary" onClick={() => setNewKeySecret(null)}>
              I&apos;ve saved it
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-8 max-w-lg space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="font-semibold text-white">Create new key</h2>
        <div>
          <Label htmlFor="key-name">Name</Label>
          <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="key-env">Environment</Label>
          <select
            id="key-env"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as KeyEnvironment)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div>
          <Label htmlFor="key-expiry">Expiry (optional)</Label>
          <Input id="key-expiry" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <Button type="submit">Create key</Button>
      </form>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Your keys</h2>
        {activeKeys.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No API keys yet" description="Create a key to use in the sandbox." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Last used</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    key={key.id}
                    className={`border-b border-slate-800/50 ${key.revoked ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-slate-200">{key.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {key.revoked ? '(revoked)' : maskKey(key)}
                    </td>
                    <td className="px-4 py-3">
                      <EnvBadge env={key.environment} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      {!key.revoked && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => setRevokeId(key.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {revokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold text-white">Revoke API key?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This action cannot be undone. Applications using this key will stop working.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRevokeId(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={confirmRevoke}>
                Revoke
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
