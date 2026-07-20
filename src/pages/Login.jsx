import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const fn = mode === 'signin' ? signIn : signUp
    const { data, error } = await fn(email.trim(), password)
    setBusy(false)
    if (error) {
      setMsg({ tone: 'error', text: error.message })
      return
    }
    if (mode === 'signup' && !data.session) {
      setMsg({
        tone: 'info',
        text: 'Account created. Check your email to confirm, then sign in.',
      })
      setMode('signin')
    }
    // On success with a session, AuthProvider flips the app to the main screen.
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-100 px-6">
      <div className="mb-8 text-center">
        <img src="/icon.svg" alt="" className="mx-auto h-20 w-20 rounded-2xl shadow-md" />
        <h1 className="mt-4 text-2xl font-bold text-slate-800">AirPresales</h1>
        <p className="mt-1 text-sm text-slate-400">Your consultant relationship engine</p>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h2>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@airtek.co.id"
            className={inputCls}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className={inputCls}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </label>

        {msg && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.tone === 'error'
                ? 'bg-red-50 text-red-600'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white ${
            busy ? 'bg-slate-300' : 'bg-blue-600 active:scale-[0.99]'
          }`}
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMsg(null)
          }}
          className="w-full text-center text-sm text-slate-500"
        >
          {mode === 'signin'
            ? "New here? Create an account"
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'
