import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Smartphone, Upload, Check, Users } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { Avatar, Badge, EmptyState } from '../components/ui.jsx'
import { DISCIPLINES, TIERS, TIER_LABEL } from '../lib/constants.js'
import {
  contactPickerSupported,
  pickFromDevice,
  parseGoogleCsv,
  toWhatsapp,
  existingNumberSet,
} from '../lib/contacts.js'

let keySeq = 0

export default function ImportContacts() {
  const navigate = useNavigate()
  const { activeConsultants, bulkAddConsultants } = useData()
  const fileRef = useRef(null)

  const [stage, setStage] = useState('source') // 'source' | 'review' | 'done'
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [importedCount, setImportedCount] = useState(0)

  // Build review rows from raw {name, number, firm?, title?}, flagging duplicates.
  function buildRows(raw) {
    const existing = existingNumberSet(activeConsultants())
    const seen = new Set()
    const built = []
    for (const c of raw) {
      const number = toWhatsapp(c.number)
      const dup = number ? existing.has(number) || seen.has(number) : false
      if (number) seen.add(number)
      built.push({
        key: ++keySeq,
        name: (c.name || '').trim(),
        number,
        firm: (c.firm || '').trim(),
        title: (c.title || '').trim(),
        discipline: 'other',
        tier: 'C',
        duplicate: dup,
        selected: !dup && Boolean((c.name || '').trim() || number),
      })
    }
    return built
  }

  async function fromPhone() {
    setError(null)
    try {
      const raw = await pickFromDevice()
      if (!raw.length) return
      const built = buildRows(raw)
      if (!built.length) return setError('No usable contacts were selected.')
      setRows(built)
      setStage('review')
    } catch (e) {
      if (e?.name === 'AbortError') return // user cancelled the picker
      setError('Could not open contacts: ' + (e?.message || 'unknown error'))
    }
  }

  function onCsvFile(e) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseGoogleCsv(String(reader.result || ''))
        if (!parsed.length) return setError('No contacts found in that CSV file.')
        setRows(buildRows(parsed))
        setStage('review')
      } catch {
        setError('Could not read that CSV file.')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // allow re-selecting the same file
  }

  const setRow = (key, patch) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const setAll = (patch) => setRows((rs) => rs.map((r) => ({ ...r, ...patch })))

  const selectedRows = rows.filter((r) => r.selected)

  function doImport() {
    const payloads = selectedRows.map((r) => ({
      name: r.name.trim() || 'Unknown contact',
      firm: r.firm.trim(),
      title: r.title.trim(),
      discipline: r.discipline,
      tier: r.tier,
      whatsapp: r.number,
    }))
    const created = bulkAddConsultants(payloads)
    setImportedCount(created.length)
    setStage('done')
  }

  // ---------- DONE ----------
  if (stage === 'done') {
    return (
      <div className="p-4">
        <div className="mt-10 rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check size={28} />
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Imported {importedCount} contact{importedCount === 1 ? '' : 's'} 🎉
          </h1>
          <p className="mt-1 text-sm text-slate-400">They're in your directory and syncing to the cloud.</p>
          <button
            onClick={() => navigate('/consultants')}
            className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:scale-[0.99]"
          >
            Go to consultants
          </button>
        </div>
      </div>
    )
  }

  // ---------- SOURCE PICK ----------
  if (stage === 'source') {
    return (
      <div>
        <Header title="Import contacts" onBack={() => navigate(-1)} />
        <div className="space-y-3 p-4">
          {error && <ErrorBox text={error} />}

          {contactPickerSupported() ? (
            <SourceButton
              icon={<Smartphone size={22} />}
              title="From phone contacts"
              subtitle="Pick contacts from your phone"
              onClick={fromPhone}
            />
          ) : (
            <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
              Your browser doesn't support picking phone contacts directly (this works on Chrome
              for Android). Use CSV upload instead — export your contacts from Google Contacts.
            </div>
          )}

          <SourceButton
            icon={<Upload size={22} />}
            title="Upload CSV file"
            subtitle="Google Contacts export (.csv)"
            onClick={() => fileRef.current?.click()}
          />
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onCsvFile} className="hidden" />

          <p className="px-1 pt-2 text-center text-xs text-slate-400">
            Only the name and WhatsApp/mobile number are imported. You'll set tier, discipline and
            firm on the next screen.
          </p>
        </div>
      </div>
    )
  }

  // ---------- REVIEW ----------
  return (
    <div>
      <Header title="Review import" onBack={() => setStage('source')} />

      {/* Bulk controls */}
      <div className="sticky top-0 z-10 space-y-2 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {selectedRows.length} of {rows.length} selected
          </span>
          <div className="flex gap-2 text-xs font-medium text-blue-600">
            <button onClick={() => setAll({ selected: true })}>Select all</button>
            <span className="text-slate-300">·</span>
            <button onClick={() => setRows((rs) => rs.map((r) => ({ ...r, selected: false })))}>
              None
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => e.target.value && setAll({ tier: e.target.value })}
            defaultValue=""
            className={bulkSelectCls}
          >
            <option value="" disabled>Set all tiers…</option>
            {TIERS.map((t) => <option key={t} value={t}>Tier {t}</option>)}
          </select>
          <select
            onChange={(e) => e.target.value && setAll({ discipline: e.target.value })}
            defaultValue=""
            className={bulkSelectCls}
          >
            <option value="" disabled>Set all disciplines…</option>
            {DISCIPLINES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2 p-4 pb-28">
        {rows.length === 0 ? (
          <EmptyState icon="📇" title="Nothing to import" />
        ) : (
          rows.map((r) => (
            <div
              key={r.key}
              className={`rounded-2xl bg-white p-3 ring-1 ${
                r.selected ? 'ring-blue-300' : 'ring-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={r.selected}
                  onChange={(e) => setRow(r.key, { selected: e.target.checked })}
                  className="h-5 w-5 shrink-0 accent-blue-600"
                />
                <Avatar name={r.name || '?'} size={38} />
                <div className="min-w-0 flex-1">
                  <input
                    value={r.name}
                    onChange={(e) => setRow(r.key, { name: e.target.value })}
                    placeholder="Name"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                  />
                  {r.number ? (
                    <p className="text-xs text-slate-400">+{r.number}</p>
                  ) : (
                    <p className="text-xs text-amber-500">No number</p>
                  )}
                </div>
                {r.duplicate && <Badge tone="warn">Already added</Badge>}
              </div>

              <div className="mt-2 space-y-2 pl-8">
                <input
                  value={r.firm}
                  onChange={(e) => setRow(r.key, { firm: e.target.value })}
                  placeholder="Firm (optional)"
                  className={rowInputCls}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={r.discipline}
                    onChange={(e) => setRow(r.key, { discipline: e.target.value })}
                    className={rowInputCls}
                  >
                    {DISCIPLINES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <select
                    value={r.tier}
                    onChange={(e) => setRow(r.key, { tier: e.target.value })}
                    className={rowInputCls}
                  >
                    {TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}

        {rows.length > 0 && (
          <button
            onClick={doImport}
            disabled={selectedRows.length === 0}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white ${
              selectedRows.length ? 'bg-blue-600 active:scale-[0.99]' : 'bg-slate-300'
            }`}
          >
            <Users size={16} /> Import {selectedRows.length} contact{selectedRows.length === 1 ? '' : 's'}
          </button>
        )}
      </div>
    </div>
  )
}

function Header({ title, onBack }) {
  return (
    <header className="flex items-center gap-3 bg-white px-4 py-4 ring-1 ring-slate-200">
      <button onClick={onBack} className="text-slate-500" aria-label="Back">
        <ArrowLeft />
      </button>
      <h1 className="font-semibold text-slate-800">{title}</h1>
    </header>
  )
}

function SourceButton({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200 active:bg-slate-50"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </button>
  )
}

function ErrorBox({ text }) {
  return <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">{text}</div>
}

const rowInputCls =
  'w-full rounded-lg border-0 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'
const bulkSelectCls =
  'flex-1 rounded-lg border-0 bg-white px-2.5 py-2 text-xs text-slate-600 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500'
