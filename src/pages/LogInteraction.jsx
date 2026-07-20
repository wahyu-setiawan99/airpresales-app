import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Check } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { Avatar, EmptyState } from '../components/ui.jsx'
import { INTERACTION_TYPES } from '../lib/constants.js'

export default function LogInteraction() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeConsultants, consultantById, logInteraction } = useData()

  const [consultantId, setConsultantId] = useState(id || '')
  const [type, setType] = useState('whatsapp')
  const [occurredAt, setOccurredAt] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')

  const consultants = activeConsultants()
  const selected = consultantId ? consultantById(consultantId) : null
  const canSave = consultantId && type

  function save() {
    if (!canSave) return
    logInteraction({
      consultantId,
      type,
      notes,
      occurredAt: new Date(occurredAt).toISOString(),
    })
    navigate(selected ? `/consultants/${consultantId}` : '/')
  }

  if (consultants.length === 0) {
    return <EmptyState icon="📇" title="Add a consultant first" subtitle="You need someone to log an interaction with." />
  }

  return (
    <div>
      <header className="flex items-center justify-between bg-white px-4 py-4 ring-1 ring-slate-200">
        <button onClick={() => navigate(-1)} className="text-slate-500" aria-label="Back">
          <ArrowLeft />
        </button>
        <h1 className="font-semibold text-slate-800">Log interaction</h1>
        <button
          onClick={save}
          disabled={!canSave}
          className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium text-white ${
            canSave ? 'bg-blue-600 active:scale-95' : 'bg-slate-300'
          }`}
        >
          <Check size={16} /> Save
        </button>
      </header>

      <div className="space-y-4 p-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Consultant</p>
          {selected ? (
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <Avatar name={selected.name} size={40} />
              <div>
                <p className="font-medium text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-400">{selected.firm}</p>
              </div>
            </div>
          ) : (
            <select
              value={consultantId}
              onChange={(e) => setConsultantId(e.target.value)}
              className="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a consultant…</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.firm}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Type</p>
          <div className="grid grid-cols-2 gap-2">
            {INTERACTION_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`rounded-xl px-3 py-3 text-sm font-medium ring-1 ${
                  type === t.value
                    ? 'bg-blue-600 text-white ring-blue-600'
                    : 'bg-white text-slate-600 ring-slate-200'
                }`}
              >
                {t.label}
                <span className={`ml-1 text-xs ${type === t.value ? 'text-blue-100' : 'text-slate-400'}`}>
                  +{t.points}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Date</p>
          <input
            type="date"
            value={occurredAt}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Notes (optional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you discuss? Any follow-up?"
            className="h-24 w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
