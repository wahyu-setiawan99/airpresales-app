import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatISO } from 'date-fns'
import { loadState, saveState, resetState, newId } from '../lib/store.js'
import { INTERACTION_TYPES, TIER_CADENCE } from '../lib/constants.js'
import { applyStreak, checkAchievements } from '../lib/gamification.js'
import { contactStatus } from '../lib/cadence.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [lastUnlocked, setLastUnlocked] = useState([])

  // Persist on every change.
  useEffect(() => {
    saveState(state)
  }, [state])

  const actions = useMemo(() => {
    const pointsFor = (type) =>
      INTERACTION_TYPES.find((t) => t.value === type)?.points ?? 10

    return {
      // ---- Consultants ----
      addConsultant(data) {
        const id = newId()
        setState((s) => ({
          ...s,
          consultants: [
            ...s.consultants,
            {
              id,
              is_active: true,
              cadence_days: null,
              last_contacted_at: null,
              created_at: formatISO(new Date()),
              ...data,
            },
          ],
        }))
        return id
      },
      updateConsultant(id, data) {
        setState((s) => ({
          ...s,
          consultants: s.consultants.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          ),
        }))
      },
      archiveConsultant(id) {
        setState((s) => ({
          ...s,
          consultants: s.consultants.map((c) =>
            c.id === id ? { ...c, is_active: false } : c,
          ),
        }))
      },

      // ---- Projects ----
      addProject(data) {
        const id = newId()
        setState((s) => ({
          ...s,
          projects: [...s.projects, { id, spec_status: 'unknown', ...data }],
        }))
        return id
      },
      updateProject(id, data) {
        setState((s) => {
          const prev = s.projects.find((p) => p.id === id)
          const becameAwarded = data.stage === 'awarded' && prev?.stage !== 'awarded'
          const projects = s.projects.map((p) => (p.id === id ? { ...p, ...data } : p))
          const stats = becameAwarded
            ? { ...s.stats, total_points: s.stats.total_points + 100 }
            : s.stats
          return { ...s, projects, stats }
        })
      },
      deleteProject(id) {
        setState((s) => ({
          ...s,
          projects: s.projects.filter((p) => p.id !== id),
          project_consultants: s.project_consultants.filter((pc) => pc.project_id !== id),
        }))
      },
      linkConsultant(projectId, consultantId, extra = {}) {
        setState((s) => {
          const exists = s.project_consultants.some(
            (pc) => pc.project_id === projectId && pc.consultant_id === consultantId,
          )
          if (exists) return s
          return {
            ...s,
            project_consultants: [
              ...s.project_consultants,
              {
                project_id: projectId,
                consultant_id: consultantId,
                role_in_project: extra.role_in_project || '',
                influence: extra.influence || 'med',
              },
            ],
          }
        })
      },
      unlinkConsultant(projectId, consultantId) {
        setState((s) => ({
          ...s,
          project_consultants: s.project_consultants.filter(
            (pc) => !(pc.project_id === projectId && pc.consultant_id === consultantId),
          ),
        }))
      },

      // ---- Interactions (+ gamification) ----
      logInteraction({ consultantId, type, notes, occurredAt }) {
        const when = occurredAt || formatISO(new Date())
        setState((s) => {
          const interaction = {
            id: newId(),
            consultant_id: consultantId,
            type,
            notes: notes || '',
            occurred_at: when,
            created_at: formatISO(new Date()),
          }
          const consultants = s.consultants.map((c) =>
            c.id === consultantId ? { ...c, last_contacted_at: when } : c,
          )
          const interactions = [interaction, ...s.interactions]

          // points + streak
          let stats = {
            ...s.stats,
            total_points: s.stats.total_points + pointsFor(type),
          }
          stats = applyStreak(stats)

          // achievements
          const overdueCount = consultants.filter(
            (c) => c.is_active !== false && contactStatus(c) === 'overdue',
          ).length
          const newly = checkAchievements(
            { stats, interactionsCount: interactions.length, overdueCount },
            s.achievements,
          )
          if (newly.length) setLastUnlocked(newly)

          return {
            ...s,
            consultants,
            interactions,
            stats,
            achievements: [...s.achievements, ...newly],
          }
        })
      },

      resetAll() {
        setState(resetState())
        setLastUnlocked([])
      },
      clearUnlocked() {
        setLastUnlocked([])
      },
    }
  }, [])

  const selectors = useMemo(
    () => ({
      consultantById: (id) => state.consultants.find((c) => c.id === id),
      activeConsultants: () =>
        state.consultants.filter((c) => c.is_active !== false),
      interactionsFor: (id) =>
        state.interactions.filter((i) => i.consultant_id === id),
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
      linksForProject: (id) =>
        state.project_consultants.filter((pc) => pc.project_id === id),
    }),
    [state],
  )

  const value = { state, ...actions, ...selectors, lastUnlocked, TIER_CADENCE }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
