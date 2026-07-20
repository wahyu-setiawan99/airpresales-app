import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { PRODUCT_SCOPE, PROJECT_STAGE, SPEC_STATUS } from '../lib/constants.js'

const empty = {
  name: '', owner_client: '', product_scope: 'hvac', stage: 'lead',
  spec_status: 'unknown', est_value: '', close_date: '', notes: '',
}

export default function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projectById, addProject, updateProject, deleteProject } = useData()
  const existing = id ? projectById(id) : null

  const [form, setForm] = useState(() =>
    existing
      ? { ...empty, ...existing, est_value: existing.est_value ?? '', close_date: existing.close_date ?? '' }
      : empty,
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.name.trim().length > 0

  function save() {
    if (!canSave) return
    const payload = {
      ...form,
      name: form.name.trim(),
      est_value: form.est_value ? Number(form.est_value) : null,
      close_date: form.close_date || null,
    }
    if (existing) {
      updateProject(id, payload)
      navigate(`/projects/${id}`)
    } else {
      const newId = addProject(payload)
      navigate(`/projects/${newId}`)
    }
  }

  return (
    <div>
      <header className="flex items-center justify-between bg-white px-4 py-4 ring-1 ring-slate-200">
        <button onClick={() => navigate(-1)} className="text-slate-500" aria-label="Back">
          <ArrowLeft />
        </button>
        <h1 className="font-semibold text-slate-800">{existing ? 'Edit project' : 'New project'}</h1>
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
        <Field label="Project name *">
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Sudirman Mixed-Use Tower" />
        </Field>
        <Field label="Owner / client">
          <input className={inputCls} value={form.owner_client} onChange={set('owner_client')} placeholder="e.g. PT Sinar Mas Land" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Product scope">
            <select className={inputCls} value={form.product_scope} onChange={set('product_scope')}>
              {PRODUCT_SCOPE.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Stage">
            <select className={inputCls} value={form.stage} onChange={set('stage')}>
              {PROJECT_STAGE.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Spec status">
          <select className={inputCls} value={form.spec_status} onChange={set('spec_status')}>
            {SPEC_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Est. value (Rp)">
            <input type="number" inputMode="numeric" className={inputCls} value={form.est_value} onChange={set('est_value')} placeholder="0" />
          </Field>
          <Field label="Target close date">
            <input type="date" className={inputCls} value={form.close_date || ''} onChange={set('close_date')} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea className={`${inputCls} h-24 resize-none`} value={form.notes} onChange={set('notes')} placeholder="Scope, competitors, key risks..." />
        </Field>

        {existing && (
          <button
            onClick={() => {
              if (confirm('Delete this project? This also removes its consultant links.')) {
                deleteProject(id)
                navigate('/projects')
              }
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 active:scale-[0.99]"
          >
            <Trash2 size={16} /> Delete project
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
