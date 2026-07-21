import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyAuthError } from '../lib/authErrors.js'
import SyncBadge from '../components/SyncBadge.jsx'

export default function Account() {
  const navigate = useNavigate()
  const { user, updatePassword, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function changePassword(e) {
    e.preventDefault()
    if (password !== confirm) return setMsg({ tone: 'error', text: 'Passwords do not match.' })
    setBusy(true)
    setMsg(null)
    const { error } = await updatePassword(password)
    setBusy(false)
    if (error) return setMsg({ tone: 'error', text: friendlyAuthError(error) })
    setPassword('')
    setConfirm('')
    setMsg({ tone: 'info', text: 'Password updated ✅' })
  }

  return (
    <div>
      <header className="flex items-center gap-3 bg-white px-4 py-4 ring-1 ring-slate-200">
        <button onClick={() => navigate(-1)} className="text-slate-500" aria-label="Back">
          <ArrowLeft />
        </button>
        <h1 className="font-semibold text-slate-800">Account</h1>
      </header>

      <div className="space-y-4 p-4">
        {/* Email + sync */}
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={16} className="text-slate-400" />
              <span className="font-medium text-slate-800">{user?.email}</span>
            </div>
            <SyncBadge />
          </div>
        </div>

        {/* Change password */}
        <form onSubmit={changePassword} className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Change password</h2>
          </div>

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
            <span className="mb-1 block text-xs font-medium text-slate-500">Confirm new password</span>
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

        <button
          onClick={() => {
            if (window.confirm('Sign out of AirPresales?')) signOut()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-red-500 ring-1 ring-slate-200 active:scale-[0.99]"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'
