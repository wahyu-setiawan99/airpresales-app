import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Download } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { Avatar, StatusPill, EmptyState } from '../components/ui.jsx'
import { contactStatus } from '../lib/cadence.js'
import { labelOf, DISCIPLINES } from '../lib/constants.js'

const STATUS_ORDER = { overdue: 0, due_soon: 1, fresh: 2 }

export default function Consultants() {
  const { activeConsultants } = useData()
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return activeConsultants()
      .filter((c) => (tier === 'all' ? true : c.tier === tier))
      .filter((c) =>
        term
          ? [c.name, c.firm, c.title].some((f) =>
              (f || '').toLowerCase().includes(term),
            )
          : true,
      )
      .sort((a, b) => STATUS_ORDER[contactStatus(a)] - STATUS_ORDER[contactStatus(b)])
  }, [activeConsultants, q, tier])

  return (
    <div>
      <header className="sticky top-0 z-10 bg-slate-100/95 px-4 pb-2 pt-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Consultants</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/consultants/import"
              className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 active:scale-95"
            >
              <Download size={16} /> Import
            </Link>
            <Link
              to="/consultants/new"
              className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white active:scale-95"
            >
              <Plus size={16} /> Add
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          <Search size={18} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or firm"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-2 flex gap-1.5">
          {['all', 'A', 'B', 'C'].map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                tier === t
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200'
              }`}
            >
              {t === 'all' ? 'All' : `Tier ${t}`}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-2">
        {list.length === 0 ? (
          <EmptyState icon="🔍" title="No consultants found" subtitle="Try a different search or add one." />
        ) : (
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/consultants/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 active:bg-slate-50"
                >
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {labelOf(DISCIPLINES, c.discipline)} · {c.firm}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                      {c.tier}
                    </span>
                    <StatusPill consultant={c} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
