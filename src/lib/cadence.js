import { differenceInCalendarDays } from 'date-fns'
import { TIER_CADENCE } from './constants.js'

// Effective cadence for a consultant (custom overrides the tier default).
export function cadenceDays(consultant) {
  if (consultant.cadence_days) return consultant.cadence_days
  return TIER_CADENCE[consultant.tier] ?? 30
}

// Whole days since the last logged contact. Never contacted => Infinity.
export function daysSince(dateStr) {
  if (!dateStr) return Infinity
  return differenceInCalendarDays(new Date(), new Date(dateStr))
}

// 'fresh' | 'due_soon' | 'overdue'
export function contactStatus(consultant) {
  const cadence = cadenceDays(consultant)
  const ratio = daysSince(consultant.last_contacted_at) / cadence
  if (ratio >= 1) return 'overdue'
  if (ratio >= 0.6) return 'due_soon'
  return 'fresh'
}

export const STATUS_META = {
  fresh: { label: 'In touch', dot: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-500' },
  due_soon: { label: 'Due soon', dot: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-500' },
  overdue: { label: 'Overdue', dot: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-500' },
}

// Priority score used to rank "who should I meet today".
// Higher = more urgent. See docs in the build plan.
export function priorityScore(consultant, linkedProjects = []) {
  const cadence = cadenceDays(consultant)
  const overdueRatio = daysSince(consultant.last_contacted_at) / cadence
  const tierWeight = { A: 3, B: 2, C: 1 }[consultant.tier] ?? 1

  const hasLiveProject = linkedProjects.some((p) =>
    ['design', 'tender'].includes(p.stage),
  )
  const specAtRisk = linkedProjects.some((p) =>
    ['unknown', 'competitor_specified'].includes(p.spec_status),
  )

  const projectBoost = hasLiveProject ? 2 : 0
  const riskBoost = specAtRisk ? 3 : 0

  return overdueRatio * 4 + tierWeight + projectBoost + riskBoost
}

// Consultants that are due/overdue, ranked by priority.
export function todayList(consultants, projectsByConsultant) {
  return consultants
    .filter((c) => c.is_active !== false)
    .map((c) => ({
      consultant: c,
      status: contactStatus(c),
      score: priorityScore(c, projectsByConsultant(c.id)),
    }))
    .filter((row) => row.status !== 'fresh')
    .sort((a, b) => b.score - a.score)
}
