import { useAuth } from './context/AuthContext.jsx'
import { isCloud } from './lib/supabase.js'
import { DataProvider } from './context/DataContext.jsx'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

export default function Root() {
  const { loading, session, recovery } = useAuth()

  // Arrived via a password-recovery link → force setting a new password first.
  if (isCloud && recovery) return <ResetPassword />

  if (isCloud && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-400">
        <div className="animate-pulse text-sm">Loading…</div>
      </div>
    )
  }

  if (isCloud && !session) return <Login />

  return (
    <DataProvider>
      <App />
    </DataProvider>
  )
}
