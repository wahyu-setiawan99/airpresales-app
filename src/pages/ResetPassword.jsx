import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ResetPassword() {
  const { updatePassword, endRecovery } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [done, setDone] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (password !== confirm) {
      return setMsg({ tone: 'error', text: 'Passwords do not match.' })
    }
    setBusy(true)
    setMsg(null)
    const { error } = await updatePassword(password)
    setBusy(false)
    if (error) return setMsg({ tone: 'error', text: error.message })
    setDone(true)
  }

  function continueToApp() {
    // Clear the recovery token from the URL, then enter the app (session is already active).
    endRecovery()
    navigate('/', { replace: true })
    window.history.replaceState(null, '', '/')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-100 px-6">
      <div className="mb-8 text-center">
        <img src="/icon.svg" alt="" className="mx-auto h-20 w-20 rounded-2xl shadow-md" />
        <h1 className="mt-4 text-2xl font-bold text-slate-800">AirPresales</h1>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        {done ? (
          <>
            <h2 className="text-lg font-semibold text-slate-800">Password updated ✅</h2>
            <p className="text-sm text-slate-500">
              Your new password is set and you're signed in.
            </p>
            <button
              onClick={continueToApp}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:scale-[0.99]"
            >
              Continue to app
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Set a new password</h2>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">New password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={inputCls}
                autoComplete="new-password"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Confirm password</span>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className={inputCls}
                autoComplete="new-password"
              />
            </label>

            {msg && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.tone === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
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
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'
