import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { DISCIPLINES, TIERS, TIER_CADENCE } from '../lib/constants.js'

const empty = {
  name: '', firm: '', title: '', discipline: 'mechanical', tier: 'B',
  phone: '', whatsapp: '', email: '', birthday: '', cadence_days: '', notes: '',
}

export default function ConsultantForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { consultantById, addConsultant, updateConsultant, archiveConsultant } = useData()
  const existing = id ? consultantById(id) : null

  const [form, setForm] = useState(() =>
    existing
      ? { ...empty, ...existing, cadence_days: existing.cadence_days ?? '' }
      : empty,
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const canSave = form.name.trim().length > 0

  function save() {
    if (!canSave) return
    const payload = {
      ...form,
      name: form.name.trim(),
      cadence_days: form.cadence_days ? Number(form.cadence_days) : null,
      birthday: form.birthday || null, // Postgres `date` rejects empty strings
    }
    if (existing) {
      updateConsultant(id, payload)
      navigate(`/consultants/${id}`)
    } else {
      const newId = addConsultant(payload)
      navigate(`/consultants/${newId}`)
    }
  }

  return (
    <div>
      <header className="flex items-center justify-between bg-white px-4 py-4 ring-1 ring-slate-200">
        <button onClick={() => navigate(-1)} className="text-slate-500" aria-label="Back">
          <ArrowLeft />
        </button>
        <h1 className="font-semibold text-slate-800">
          {existing ? 'Edit consultant' : 'New consultant'}
        </h1>
        <button
          onClick={save}
          disabled={!canSave}
          className={`rounded-full px-4 py-1.5 text-sm font-medium text-white ${
            canSave ? 'bg-blue-600 active:scale-95' : 'bg-slate-300'
          }`}
        >
          Save
        </button>
      </header>

      <div className="space-y-3 p-4">
        <Field label="Full name *">
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Budi Santoso" />
        </Field>
        <Field label="Firm / company">
          <input className={inputCls} value={form.firm} onChange={set('firm')} placeholder="e.g. PT Meinhardt" />
        </Field>
        <Field label="Title / role">
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. Senior Mechanical Engineer" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Discipline">
            <select className={inputCls} value={form.discipline} onChange={set('discipline')}>
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Tier">
            <select className={inputCls} value={form.tier} onChange={set('tier')}>
              {TIERS.map((t) => (
                <option key={t} value={t}>Tier {t} (every {TIER_CADENCE[t]}d)</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Phone">
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+62812..." inputMode="tel" />
        </Field>
        <Field label="WhatsApp number (digits only, incl. country code)">
          <input className={inputCls} value={form.whatsapp} onChange={set('whatsapp')} placeholder="62812..." inputMode="numeric" />
        </Field>
        <Field label="Email">
          <input className={inputCls} value={form.email} onChange={set('email')} placeholder="name@firm.com" inputMode="email" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Birthday">
            <input type="date" className={inputCls} value={form.birthday || ''} onChange={set('birthday')} />
          </Field>
          <Field label="Custom cadence (days)">
            <input type="number" className={inputCls} value={form.cadence_days} onChange={set('cadence_days')} placeholder={`${TIER_CADENCE[form.tier]}`} inputMode="numeric" />
          </Field>
        </div>

        <Field label="Notes">
          <textarea className={`${inputCls} h-24 resize-none`} value={form.notes} onChange={set('notes')} placeholder="Context, preferences, projects they influence..." />
        </Field>

        {existing && (
          <button
            onClick={() => {
              archiveConsultant(id)
              navigate('/consultants')
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 active:scale-[0.99]"
          >
            <Trash2 size={16} /> Archive consultant
          </button>
        )}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}
