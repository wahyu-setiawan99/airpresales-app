import { CloudOff, RefreshCw, Check } from 'lucide-react'
import { useSync } from '../hooks/useSync.js'
import { isCloud } from '../lib/supabase.js'

// Small status pill: "Synced" / "N pending" / "Syncing…" / "Offline".
// `light` variant is for placing on the dark/gradient header.
export default function SyncBadge({ light = false }) {
  const { online, pending, processing } = useSync()
  if (!isCloud) return null

  let icon, text, tone
  if (!online) {
    icon = <CloudOff size={13} />
    text = pending ? `Offline · ${pending}` : 'Offline'
    tone = 'warn'
  } else if (processing) {
    icon = <RefreshCw size={13} className="animate-spin" />
    text = 'Syncing…'
    tone = 'busy'
  } else if (pending > 0) {
    icon = <RefreshCw size={13} />
    text = `${pending} pending`
    tone = 'busy'
  } else {
    icon = <Check size={13} />
    text = 'Synced'
    tone = 'ok'
  }

  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium'
  const light_tones = {
    ok: 'bg-white/15 text-blue-50',
    busy: 'bg-white/20 text-white',
    warn: 'bg-amber-400/25 text-amber-50',
  }
  const solid_tones = {
    ok: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    busy: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    warn: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  }
  const tones = light ? light_tones : solid_tones

  return (
    <span className={`${base} ${tones[tone]}`}>
      {icon}
      {text}
    </span>
  )
}
