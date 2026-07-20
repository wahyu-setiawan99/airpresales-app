import { Flame, Star, Award, Users, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { ACHIEVEMENTS } from '../lib/gamification.js'
import { SectionTitle } from '../components/ui.jsx'

export default function Profile() {
  const { state, activeConsultants, resetAll } = useData()
  const { stats, achievements, interactions } = state
  const unlocked = new Set(achievements)

  return (
    <div>
      <header className="rounded-b-3xl bg-gradient-to-br from-slate-800 to-slate-700 px-5 pb-6 pt-8 text-white">
        <h1 className="text-2xl font-bold">Your progress</h1>
        <p className="text-sm text-slate-300">Presales relationship scorecard</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Metric icon={<Star size={18} />} value={stats.total_points} label="Total points" />
          <Metric icon={<Flame size={18} />} value={stats.current_streak} label="Current streak" />
          <Metric icon={<Award size={18} />} value={stats.longest_streak} label="Longest streak" />
          <Metric icon={<Users size={18} />} value={activeConsultants().length} label="Consultants" />
        </div>
      </header>

      <div className="px-4">
        <SectionTitle>
          Achievements
          <span className="ml-2 text-slate-300">
            {unlocked.size}/{ACHIEVEMENTS.length}
          </span>
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.has(a.code)
            return (
              <div
                key={a.code}
                className={`rounded-2xl p-3 ring-1 ${
                  got ? 'bg-white ring-slate-200' : 'bg-slate-100 ring-slate-200 opacity-60'
                }`}
              >
                <div className={`text-2xl ${got ? '' : 'grayscale'}`}>{a.icon}</div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{a.label}</p>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
            )
          })}
        </div>

        <SectionTitle>Activity</SectionTitle>
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
          You've logged <span className="font-semibold text-slate-800">{interactions.length}</span> interaction
          {interactions.length === 1 ? '' : 's'} so far. Keep the streak alive! 🔥
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all data back to the sample set? This cannot be undone.')) resetAll()
          }}
          className="mt-5 mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-red-500 ring-1 ring-slate-200 active:scale-[0.99]"
        >
          <RotateCcw size={16} /> Reset sample data
        </button>
        <p className="pb-4 text-center text-xs text-slate-400">
          Data is stored on this device. Cloud sync (Supabase) comes next.
        </p>
      </div>
    </div>
  )
}

function Metric({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
      <div className="text-slate-300">{icon}</div>
      <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-slate-300">{label}</p>
    </div>
  )
}
