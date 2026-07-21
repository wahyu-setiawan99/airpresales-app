import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatISO } from 'date-fns'
import { loadState, saveState, resetState, newId } from '../lib/store.js'
import { INTERACTION_TYPES, TIER_CADENCE } from '../lib/constants.js'
import { applyStreak, checkAchievements } from '../lib/gamification.js'
import { contactStatus } from '../lib/cadence.js'
import { isCloud } from '../lib/supabase.js'
import * as cloud from '../lib/cloud.js'
import * as sync from '../lib/sync.js'
import { loadCache, saveCache } from '../lib/cache.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

const EMPTY = {
  consultants: [],
  interactions: [],
  projects: [],
  project_consultants: [],
  stats: { total_points: 0, current_streak: 0, longest_streak: 0, last_activity_date: null },
  achievements: [],
}

const pointsFor = (type) => INTERACTION_TYPES.find((t) => t.value === type)?.points ?? 10

export function DataProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [state, setState] = useState(() => (isCloud ? EMPTY : loadState()))
  const [ready, setReady] = useState(!isCloud)
  const [lastUnlocked, setLastUnlocked] = useState([])

  // Cloud: show cached data instantly, then refresh from Supabase.
  useEffect(() => {
    if (!isCloud) return
    if (!userId) {
      setState(EMPTY)
      setReady(false)
      return
    }
    let active = true

    // 1) Instant paint from the local snapshot (also enables offline open).
    const cached = loadCache(userId)
    if (cached) {
      setState(cached)
      setReady(true)
    } else {
      setReady(false)
    }

    // 2) Refresh from the server — but don't clobber unsynced local edits.
    cloud
      .loadAll(userId)
      .then((fresh) => {
        if (!active) return
        if (sync.getStatus().pending === 0) setState(fresh)
        setReady(true)
      })
      .catch((e) => {
        console.warn('[data] cloud load failed (offline?):', e?.message)
        if (active) setReady(true) // fall back to cache/empty; never get stuck
      })

    // 3) Flush any writes queued from a previous (possibly offline) session.
    sync.process()

    return () => {
      active = false
    }
  }, [userId])

  // Persist locally: demo → localStorage; cloud → per-user offline snapshot.
  useEffect(() => {
    if (!isCloud) {
      saveState(state)
    } else if (userId && ready) {
      saveCache(userId, state)
    }
  }, [state, userId, ready])

  // ---- Actions (optimistic local update + background cloud write) ----
  const actions = {
    addConsultant(data) {
      const row = {
        id: newId(),
        user_id: userId,
        is_active: true,
        cadence_days: null,
        last_contacted_at: null,
        created_at: formatISO(new Date()),
        ...data,
      }
      setState((s) => ({ ...s, consultants: [...s.consultants, row] }))
      if (isCloud) cloud.insert('consultants', row)
      return row.id
    },
    updateConsultant(id, data) {
      setState((s) => ({
        ...s,
        consultants: s.consultants.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }))
      if (isCloud) cloud.update('consultants', id, data)
    },
    archiveConsultant(id) {
      setState((s) => ({
        ...s,
        consultants: s.consultants.map((c) => (c.id === id ? { ...c, is_active: false } : c)),
      }))
      if (isCloud) cloud.update('consultants', id, { is_active: false })
    },

    // ---- Projects ----
    addProject(data) {
      const row = { id: newId(), user_id: userId, spec_status: 'unknown', ...data }
      setState((s) => ({ ...s, projects: [...s.projects, row] }))
      if (isCloud) cloud.insert('projects', row)
      return row.id
    },
    updateProject(id, data) {
      const prev = state.projects.find((p) => p.id === id)
      const becameAwarded = data.stage === 'awarded' && prev?.stage !== 'awarded'
      const nextStats = becameAwarded
        ? { ...state.stats, total_points: state.stats.total_points + 100 }
        : state.stats
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        stats: becameAwarded ? { ...s.stats, total_points: s.stats.total_points + 100 } : s.stats,
      }))
      if (isCloud) {
        cloud.update('projects', id, data)
        if (becameAwarded) cloud.upsertStats({ user_id: userId, ...nextStats })
      }
    },
    deleteProject(id) {
      setState((s) => ({
        ...s,
        projects: s.projects.filter((p) => p.id !== id),
        project_consultants: s.project_consultants.filter((pc) => pc.project_id !== id),
      }))
      if (isCloud) cloud.remove('projects', id)
    },
    linkConsultant(projectId, consultantId, extra = {}) {
      const link = {
        user_id: userId,
        project_id: projectId,
        consultant_id: consultantId,
        role_in_project: extra.role_in_project || '',
        influence: extra.influence || 'med',
      }
      setState((s) => {
        const exists = s.project_consultants.some(
          (pc) => pc.project_id === projectId && pc.consultant_id === consultantId,
        )
        if (exists) return s
        return { ...s, project_consultants: [...s.project_consultants, link] }
      })
      if (isCloud) cloud.insert('project_consultants', link)
    },
    unlinkConsultant(projectId, consultantId) {
      setState((s) => ({
        ...s,
        project_consultants: s.project_consultants.filter(
          (pc) => !(pc.project_id === projectId && pc.consultant_id === consultantId),
        ),
      }))
      if (isCloud) cloud.unlink(projectId, consultantId)
    },

    // ---- Interactions (+ gamification) ----
    logInteraction({ consultantId, type, notes, occurredAt }) {
      const when = occurredAt || formatISO(new Date())
      const interaction = {
        id: newId(),
        user_id: userId,
        consultant_id: consultantId,
        type,
        notes: notes || '',
        occurred_at: when,
        created_at: formatISO(new Date()),
      }
      const consultants = state.consultants.map((c) =>
        c.id === consultantId ? { ...c, last_contacted_at: when } : c,
      )
      const interactions = [interaction, ...state.interactions]

      let stats = { ...state.stats, total_points: state.stats.total_points + pointsFor(type) }
      stats = applyStreak(stats)

      const overdueCount = consultants.filter(
        (c) => c.is_active !== false && contactStatus(c) === 'overdue',
      ).length
      const newly = checkAchievements(
        { stats, interactionsCount: interactions.length, overdueCount },
        state.achievements,
      )
      if (newly.length) setLastUnlocked(newly)

      setState((s) => ({
        ...s,
        consultants,
        interactions,
        stats,
        achievements: [...s.achievements, ...newly],
      }))

      if (isCloud) {
        cloud.insert('interactions', interaction)
        cloud.update('consultants', consultantId, { last_contacted_at: when })
        cloud.upsertStats({ user_id: userId, ...stats })
        if (newly.length) cloud.insertAchievements(userId, newly)
      }
    },

    resetAll() {
      if (isCloud) return // reset only applies to the local demo dataset
      setState(resetState())
      setLastUnlocked([])
    },
    clearUnlocked() {
      setLastUnlocked([])
    },
  }

  const selectors = useMemo(
    () => ({
      consultantById: (id) => state.consultants.find((c) => c.id === id),
      activeConsultants: () => state.consultants.filter((c) => c.is_active !== false),
      interactionsFor: (id) => state.interactions.filter((i) => i.consultant_id === id),
      projectById: (id) => state.projects.find((p) => p.id === id),
      projectsForConsultant: (id) => {
        const ids = state.project_consultants
          .filter((pc) => pc.consultant_id === id)
          .map((pc) => pc.project_id)
        return state.projects.filter((p) => ids.includes(p.id))
      },
      consultantsForProject: (id) => {
        const ids = state.project_consultants
          .filter((pc) => pc.project_id === id)
          .map((pc) => pc.consultant_id)
        return state.consultants.filter((c) => ids.includes(c.id))
      },
      linksForProject: (id) => state.project_consultants.filter((pc) => pc.project_id === id),
    }),
    [state],
  )

  // Cloud mode: wait until the first load finishes.
  if (isCloud && !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-400">
        <div className="animate-pulse text-sm">Loading your data…</div>
      </div>
    )
  }

  const value = { state, ...actions, ...selectors, lastUnlocked, TIER_CADENCE }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
