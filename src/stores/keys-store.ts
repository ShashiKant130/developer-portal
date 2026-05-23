import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type KeyEnvironment = 'sandbox' | 'production'

export interface ApiKey {
  id: string
  name: string
  environment: KeyEnvironment
  prefix: string
  secret: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  revoked: boolean
}

interface KeysState {
  keys: ApiKey[]
  createKey: (input: {
    name: string
    environment: KeyEnvironment
    expiresAt: string | null
  }) => { key: ApiKey; fullSecret: string }
  revokeKey: (id: string) => void
  touchKey: (id: string) => void
}

function generateSecret(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'dp_live_'
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export const useKeysStore = create<KeysState>()(
  persist(
    (set, get) => ({
      keys: [],
      createKey: (input) => {
        const fullSecret = generateSecret()
        const key: ApiKey = {
          id: crypto.randomUUID(),
          name: input.name,
          environment: input.environment,
          prefix: fullSecret.slice(-4),
          secret: fullSecret,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          expiresAt: input.expiresAt,
          revoked: false,
        }
        set({ keys: [...get().keys, key] })
        return { key, fullSecret }
      },
      revokeKey: (id) => {
        set({
          keys: get().keys.map((k) => (k.id === id ? { ...k, revoked: true } : k)),
        })
      },
      touchKey: (id) => {
        set({
          keys: get().keys.map((k) =>
            k.id === id ? { ...k, lastUsedAt: new Date().toISOString() } : k,
          ),
        })
      },
    }),
    { name: 'portal-api-keys' },
  ),
)

export function maskKey(key: ApiKey): string {
  return `dp_••••••••••••${key.prefix}`
}
