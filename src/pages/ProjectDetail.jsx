import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Pencil, X, Plus, CalendarClock } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { Avatar, Badge, SectionTitle, EmptyState } from '../components/ui.jsx'
import {
  labelOf, DISCIPLINES, PRODUCT_SCOPE, PROJECT_STAGE, SPEC_STATUS, INFLUENCE,
} from '../lib/constants.js'

function rupiah(n) {
  if (n == null) return null
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    projectById, linksForProject, consultantById, activeConsultants,
    linkConsultant, unlinkConsultant,
  } = useData()

  const p = projectById(id)
  const [pick, setPick] = useState('')
  const [role, setRole] = useState('')
  const [influence, setInfluence] = useState('med')

  if (!p) {
    return (
      <div className="p-6">
        <EmptyState icon="🤷" title="Project not found" />
        <Link to="/projects" className="mt-4 block text-center text-blue-600">Back to projects</Link>
      </div>
    )
  }

  const links = linksForProject(id)
  const linkedIds = links.map((l) => l.consultant_id)
  const available = activeConsultants().filter((c) => !linkedIds.includes(c.id))
  const spec = SPEC_STATUS.find((s) => s.value === p.spec_status)

  function addLink() {
    if (!pick) return
    linkConsultant(id, pick, { role_in_project: role.trim(), influence })
    setPick('')
    setRole('')
    setInfluence('med')
  }

  return (
    <div>
      <header className="bg-white px-4 pb-4 pt-6 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-slate-500" aria-label="Back">
            <ArrowLeft />
          </button>
          <Link to={`/projects/${id}/edit`} className="text-slate-500" aria-label="Edit">
            <Pencil size={20} />
          </Link>
        </div>

        <h1 className="mt-2 text-xl font-bold text-slate-800">{p.name}</h1>
        <p className="text-sm text-slate-400">{p.owner_client}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={spec?.tone}>{spec?.label}</Badge>
          <Badge>{labelOf(PROJECT_STAGE, p.stage)}</Badge>
          <Badge>{labelOf(PRODUCT_SCOPE, p.product_scope)}</Badge>
        </div>

        {(p.est_value != null || p.close_date) && (
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
            {p.est_value != null && <span className="font-medium">{rupiah(p.est_value)}</span>}
            {p.close_date && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <CalendarClock size={14} /> {format(new Date(p.close_date), 'd MMM yyyy')}
              </span>
            )}
          </div>
        )}
      </header>

      <div className="px-4">
        {p.notes && (
          <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
            {p.notes}
          </div>
        )}

        <SectionTitle>Consultants on this project</SectionTitle>
        {links.length === 0 ? (
          <p className="px-1 text-sm text-slate-400">No consultants linked yet.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) => {
              const c = consultantById(l.consultant_id)
              if (!c) return null
              return (
                <li key={l.consultant_id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="flex flex-1 cursor-pointer items-center gap-3" onClick={() => navigate(`/consultants/${c.id}`)}>
                    <Avatar name={c.name} size={40} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">{c.name}</p>
                      <p className="truncate text-xs text-slate-400">
                        {l.role_in_project || labelOf(DISCIPLINES, c.discipline)} · {labelOf(INFLUENCE, l.influence)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => unlinkConsultant(id, c.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 active:bg-slate-200"
                    aria-label="Remove"
                  >
                    <X size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* Add a consultant */}
        <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <p className="mb-2 text-xs font-medium text-slate-500">Link a consultant</p>
          {available.length === 0 ? (
            <p className="text-sm text-slate-400">All consultants are already linked.</p>
          ) : (
            <div className="space-y-2">
              <select value={pick} onChange={(e) => setPick(e.target.value)} className={inputCls}>
                <option value="">Select consultant…</option>
                {available.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.firm}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. Mechanical)" className={inputCls} />
                <select value={influence} onChange={(e) => setInfluence(e.target.value)} className={inputCls}>
                  {INFLUENCE.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <button
                onClick={addLink}
                disabled={!pick}
                className={`flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium text-white ${
                  pick ? 'bg-blue-600 active:scale-95' : 'bg-slate-300'
                }`}
              >
                <Plus size={16} /> Add to project
              </button>
            </div>
          )}
        </div>
        <div className="h-4" />
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'
