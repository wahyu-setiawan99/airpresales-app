import { useEffect } from 'react'
import { useData } from '../context/DataContext.jsx'
import { ACHIEVEMENTS } from '../lib/gamification.js'

export default function AchievementToast() {
  const { lastUnlocked, clearUnlocked } = useData()

  useEffect(() => {
    if (lastUnlocked.length) {
      const t = setTimeout(clearUnlocked, 4000)
      return () => clearTimeout(t)
    }
  }, [lastUnlocked, clearUnlocked])

  if (!lastUnlocked.length) return null
  const a = ACHIEVEMENTS.find((x) => x.code === lastUnlocked[0])
  if (!a) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-40 mx-auto flex max-w-md justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl animate-[fadeIn_0.3s_ease]">
        <span className="text-2xl">{a.icon}</span>
        <div>
          <p className="text-xs font-medium text-blue-300">Achievement unlocked</p>
          <p className="text-sm font-semibold">{a.label}</p>
        </div>
      </div>
    </div>
  )
}
