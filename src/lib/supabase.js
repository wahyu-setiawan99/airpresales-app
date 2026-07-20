import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// When both env vars are present we run in "cloud" mode (login + sync).
// Otherwise the app falls back to local demo mode (localStorage, no login).
export const isCloud = Boolean(url && key)

export const supabase = isCloud
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
