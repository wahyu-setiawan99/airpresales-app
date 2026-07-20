import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Flame, Star, AlertCircle, MessageCircle, ChevronRight } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { todayList, contactStatus, daysSince, cadenceDays } from '../lib/cadence.js'
import { Avatar, StatusPill, EmptyState, SectionTitle } from '../components/ui.jsx'
import { labelOf, DISCIPLINES } from '../lib/constants.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Good morning'
  if (h < 15) return 'Good afternoon'
  if (h < 19) return 'Good evening'
  return 'Good night'
}

function reason(consultant, projects) {
  const overdueBy = daysSince(consultant.last_contacted_at) - cadenceDays(consultant)
  const live = projects.find((p) => ['design', 'tender'].includes(p.stage))
  if (live && ['unknown', 'competitor_specified'].includes(live.spec_status)) {
    return `Spec at risk on ${live.name}`
  }
  if (live) return `Live project: ${live.name}`
  if (consultant.last_contacted_at == null) return 'Never contacted yet'
  if (overdueBy >= 0) return `Overdue by ${overdueBy}d`
  return 'Due soon'
}

export default function Today() {
  const navigate = useNavigate()
  const { activeConsultants, projectsForConsultant, state } = useData()
  const consultants = activeConsultants()
  const rows = todayList(consultants, projectsForConsultant)
  const overdueCount = consultants.filter((c) => contactStatus(c) === 'overdue').length
  const { stats } = state

  return (
    <div>
      <header className="rounded-b-3xl bg-gradient-to-br from-blue-700 to-blue-500 px-5 pb-6 pt-8 text-white">
        <p className="text-sm text-blue-100">{format(new Date(), 'EEEE, d MMMM')}</p>
        <h1 className="mt-0.5 text-2xl font-bold">{greeting()} 👋</h1>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat icon={<Flame size={18} />} value={stats.current_streak} label="day streak" />
          <Stat icon={<Star size={18} />} value={stats.total_points} label="points" />
          <Stat icon={<AlertCircle size={18} />} value={overdueCount} label="overdue" />
        </div>
      </header>

      <div className="px-4">
        <SectionTitle>Who to reach out to today</SectionTitle>

        {rows.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200">
            <EmptyState
              icon="🎉"
              title="All caught up!"
              subtitle="Every consultant is in touch. Great relationship work."
            />
          </div>
        ) : (
          <ul className="space-y-2.5">
            {rows.map(({ consultant }) => (
              <li key={consultant.id}>
                <div
                  onClick={() => navigate(`/consultants/${consultant.id}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 active:bg-slate-50"
                >
                  <Avatar name={consultant.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-800">{consultant.name}</p>
                    </div>
                    <p className="truncate text-xs text-slate-400">
                      {labelOf(DISCIPLINES, consultant.discipline)} · {consultant.firm}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-blue-600">
                      {reason(consultant, projectsForConsultant(consultant.id))}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusPill consultant={consultant} />
                    {consultant.whatsapp && (
                      <a
                        href={`https://wa.me/${consultant.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle size={17} />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 px-1 text-center text-xs text-slate-400">
          Ranked by urgency, tier, and live-project spec risk.
        </p>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur">
      <div className="flex items-center gap-1 text-blue-50">{icon}</div>
      <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-blue-100">{label}</p>
    </div>
  )
}
