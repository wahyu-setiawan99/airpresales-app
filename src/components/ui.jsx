import { STATUS_META, contactStatus } from '../lib/cadence.js'

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-600',
]

export function Avatar({ name, size = 44 }) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return (
    <div
      className={`${AVATAR_COLORS[idx]} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  )
}

export function StatusPill({ consultant }) {
  const meta = STATUS_META[contactStatus(consultant)]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-medium ${meta.text} ring-1 ring-slate-200`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warn: 'bg-amber-50 text-amber-700 ring-amber-200',
    bad: 'bg-red-50 text-red-700 ring-red-200',
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <p className="font-medium text-slate-700">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}

export function SectionTitle({ children, right }) {
  return (
    <div className="mb-2 mt-5 flex items-center justify-between px-1">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{children}</h2>
      {right}
    </div>
  )
}
