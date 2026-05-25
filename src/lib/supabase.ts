import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url?.trim() && anonKey?.trim())

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null

export const SUPABASE_SETUP_HINT =
  'Supabase is not configured. Copy .env.example to .env and add your project URL and anon key, or use Continue as guest.'
