import { useNavigate, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { Badge, EmptyState } from '../components/ui.jsx'
import { labelOf, PROJECT_STAGE, PRODUCT_SCOPE, SPEC_STATUS } from '../lib/constants.js'
import { Users, Plus } from 'lucide-react'

function rupiah(n) {
  if (!n) return null
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

export default function Projects() {
  const navigate = useNavigate()
  const { state, consultantsForProject } = useData()
  const projects = state.projects

  return (
    <div>
      <header className="flex items-start justify-between px-4 pb-2 pt-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-400">Where consultants are shaping the spec</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white active:scale-95"
        >
          <Plus size={16} /> Add
        </Link>
      </header>

      <div className="px-4 pt-2">
        {projects.length === 0 ? (
          <EmptyState icon="🏗️" title="No projects yet" subtitle="Project pipeline comes in the next milestone." />
        ) : (
          <ul className="space-y-2.5">
            {projects.map((p) => {
              const spec = SPEC_STATUS.find((s) => s.value === p.spec_status)
              const count = consultantsForProject(p.id).length
              return (
                <li
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="cursor-pointer rounded-2xl bg-white p-4 ring-1 ring-slate-200 active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-slate-800">{p.name}</h2>
                    <Badge tone={spec?.tone}>{spec?.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{p.owner_client}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge>{labelOf(PROJECT_STAGE, p.stage)}</Badge>
                    <Badge>{labelOf(PRODUCT_SCOPE, p.product_scope)}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Users size={13} /> {count} consultant{count === 1 ? '' : 's'}
                    </span>
                  </div>

                  {p.est_value != null && (
                    <p className="mt-2 text-sm font-medium text-slate-600">{rupiah(p.est_value)}</p>
                  )}
                  {p.notes && <p className="mt-1 text-xs text-slate-400">{p.notes}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
