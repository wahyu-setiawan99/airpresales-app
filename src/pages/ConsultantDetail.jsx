import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft, Phone, MessageCircle, Pencil,
  CalendarClock, Cake, Briefcase, Plus,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { Avatar, StatusPill, Badge, SectionTitle, EmptyState } from '../components/ui.jsx'
import { contactStatus, cadenceDays, daysSince, STATUS_META } from '../lib/cadence.js'
import {
  labelOf, DISCIPLINES, INTERACTION_TYPES, SPEC_STATUS, PROJECT_STAGE, TIER_LABEL,
} from '../lib/constants.js'

export default function ConsultantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { consultantById, interactionsFor, projectsForConsultant } = useData()
  const c = consultantById(id)

  if (!c) {
    return (
      <div className="p-6">
        <EmptyState icon="🤷" title="Consultant not found" />
        <Link to="/consultants" className="mt-4 block text-center text-blue-600">Back to list</Link>
      </div>
    )
  }

  const history = interactionsFor(id)
  const projects = projectsForConsultant(id)
  const status = contactStatus(c)
  const meta = STATUS_META[status]
  const since = daysSince(c.last_contacted_at)

  return (
    <div>
      <header className="bg-white px-4 pb-4 pt-6 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-slate-500" aria-label="Back">
            <ArrowLeft />
          </button>
          <Link to={`/consultants/${id}/edit`} className="text-slate-500" aria-label="Edit">
            <Pencil size={20} />
          </Link>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Avatar name={c.name} size={60} />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-800">{c.name}</h1>
            <p className="truncate text-sm text-slate-500">{c.title}</p>
            <p className="truncate text-sm text-slate-400">{c.firm}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill consultant={c} />
          <Badge>{TIER_LABEL[c.tier]}</Badge>
          <Badge>{labelOf(DISCIPLINES, c.discipline)}</Badge>
        </div>

        {/* Quick contact actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <ContactBtn href={c.whatsapp ? `https://wa.me/${c.whatsapp}` : null} icon={<MessageCircle size={18} />} label="WhatsApp" tone="bg-emerald-50 text-emerald-600" external />
          <ContactBtn href={c.whatsapp ? `tel:+${c.whatsapp}` : null} icon={<Phone size={18} />} label="Call" tone="bg-blue-50 text-blue-600" />
          <button
            onClick={() => navigate(`/log/${id}`)}
            className="flex flex-col items-center gap-1 rounded-xl bg-slate-800 py-2.5 text-white active:scale-95"
          >
            <Plus size={18} />
            <span className="text-[11px] font-medium">Log</span>
          </button>
        </div>
      </header>

      <div className="px-4">
        {/* Cadence card */}
        <div className={`mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200`}>
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ring-2 ${meta.ring} ${meta.text}`}>
            <CalendarClock size={20} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${meta.text}`}>{meta.label}</p>
            <p className="text-xs text-slate-500">
              {c.last_contacted_at
                ? `Last contact ${since} day${since === 1 ? '' : 's'} ago · target every ${cadenceDays(c)}d`
                : `Never contacted · target every ${cadenceDays(c)}d`}
            </p>
          </div>
        </div>

        {c.birthday && (
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">
            <Cake size={16} className="text-rose-500" /> Birthday: {format(new Date(c.birthday), 'd MMMM')}
          </div>
        )}

        {c.notes && (
          <div className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
            {c.notes}
          </div>
        )}

        {/* Linked projects */}
        <SectionTitle>Projects</SectionTitle>
        {projects.length === 0 ? (
          <p className="px-1 text-sm text-slate-400">Not linked to any project yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => {
              const spec = SPEC_STATUS.find((s) => s.value === p.spec_status)
              return (
                <li key={p.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-slate-400" />
                      <p className="font-medium text-slate-800">{p.name}</p>
                    </div>
                    <Badge tone={spec?.tone}>{spec?.label}</Badge>
                  </div>
                  <p className="mt-1 pl-6 text-xs text-slate-400">
                    {labelOf(PROJECT_STAGE, p.stage)} · {p.owner_client}
                  </p>
                </li>
              )
            })}
          </ul>
        )}

        {/* Interaction history */}
        <SectionTitle>History</SectionTitle>
        {history.length === 0 ? (
          <p className="px-1 pb-4 text-sm text-slate-400">No interactions logged yet.</p>
        ) : (
          <ul className="space-y-2 pb-4">
            {history.map((i) => (
              <li key={i.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {labelOf(INTERACTION_TYPES, i.type)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {format(new Date(i.occurred_at), 'd MMM yyyy')}
                  </span>
                </div>
                {i.notes && <p className="mt-1 text-sm text-slate-500">{i.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ContactBtn({ href, icon, label, tone, external }) {
  const disabled = !href
  const cls = `flex flex-col items-center gap-1 rounded-xl py-2.5 ${tone} ${
    disabled ? 'opacity-40' : 'active:scale-95'
  }`
  if (disabled) {
    return (
      <div className={cls}>
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
    )
  }
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className={cls}>
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </a>
  )
}
