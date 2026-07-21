import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isCloud } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isCloud)
  // True while the user arrived via a password-recovery link and must set a new password.
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!isCloud) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    isCloud,
    loading,
    session,
    recovery,
    user: session?.user ?? null,
    async signIn(email, password) {
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signUp(email, password) {
      return supabase.auth.signUp({ email, password })
    },
    // Passwordless: emails a one-tap login link.
    async sendMagicLink(email) {
      return supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
    },
    async signOut() {
      return supabase.auth.signOut()
    },
    // Sends a password-reset email that links back to /reset-password.
    async sendPasswordReset(email) {
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    },
    // Sets a new password for the currently-authenticated (or recovery) session.
    async updatePassword(newPassword) {
      return supabase.auth.updateUser({ password: newPassword })
    },
    endRecovery() {
      setRecovery(false)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
