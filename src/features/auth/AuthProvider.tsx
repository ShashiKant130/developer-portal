import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase.ts'
import { AuthContext, type AuthContextValue } from './auth-context.ts'

const GUEST_SESSION_KEY = 'portal-guest'

function loadGuestSession(): boolean {
  try {
    return sessionStorage.getItem(GUEST_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function saveGuestSession(isGuest: boolean) {
  try {
    if (isGuest) sessionStorage.setItem(GUEST_SESSION_KEY, '1')
    else sessionStorage.removeItem(GUEST_SESSION_KEY)
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isGuest, setIsGuest] = useState(loadGuestSession)
  const [loading, setLoading] = useState(true)

  const clearGuest = useCallback(() => {
    setIsGuest(false)
    saveGuestSession(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) clearGuest()
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) clearGuest()
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [clearGuest])

  const continueAsGuest = useCallback(() => {
    setIsGuest(true)
    saveGuestSession(true)
  }, [])

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!email || password.length < 6) {
        return { error: 'Email required and password must be at least 6 characters.' }
      }
      clearGuest()
      const { error } = await supabase.auth.signUp({ email, password })
      return { error: error?.message ?? null }
    },
    [clearGuest],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) return { error: 'Email and password are required.' }
      clearGuest()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    [clearGuest],
  )

  const signOut = useCallback(async () => {
    if (isGuest) {
      clearGuest()
      return
    }
    await supabase.auth.signOut()
  }, [isGuest, clearGuest])

  const getAccessToken = useCallback(() => {
    if (isGuest) return null
    return session?.access_token ?? null
  }, [isGuest, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isGuest,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      getAccessToken,
    }),
    [user, session, loading, isGuest, signUp, signIn, signOut, continueAsGuest, getAccessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
