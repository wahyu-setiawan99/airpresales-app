import { supabase } from './supabase.js'
import * as sync from './sync.js'

const DEFAULT_STATS = {
  total_points: 0,
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
}

// Load the full app state for a user. Throws if offline / unreachable so the
// caller can fall back to the local cache.
export async function loadAll(userId) {
  const [consultants, interactions, projects, project_consultants, achievements, stats] =
    await Promise.all([
      supabase.from('consultants').select('*'),
      supabase.from('interactions').select('*').order('occurred_at', { ascending: false }),
      supabase.from('projects').select('*'),
      supabase.from('project_consultants').select('*'),
      supabase.from('achievements').select('code'),
      supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
    ])

  const firstError =
    consultants.error || interactions.error || projects.error || project_consultants.error
  if (firstError) throw firstError

  // Ensure a stats row exists for this user (queued so it survives offline).
  let statsRow = stats.data
  if (!statsRow) {
    statsRow = { user_id: userId, ...DEFAULT_STATS }
    sync.enqueue({ kind: 'upsertStats', row: statsRow })
  }

  return {
    consultants: consultants.data ?? [],
    interactions: interactions.data ?? [],
    projects: projects.data ?? [],
    project_consultants: project_consultants.data ?? [],
    achievements: (achievements.data ?? []).map((a) => a.code),
    stats: {
      total_points: statsRow.total_points ?? 0,
      current_streak: statsRow.current_streak ?? 0,
      longest_streak: statsRow.longest_streak ?? 0,
      last_activity_date: statsRow.last_activity_date ?? null,
    },
  }
}

// ---- Writes: all queued (offline-tolerant, retried, persisted) ----
export const insert = (table, row) => sync.enqueue({ kind: 'insert', table, row })
export const update = (table, id, patch) => sync.enqueue({ kind: 'update', table, id, patch })
export const remove = (table, id) => sync.enqueue({ kind: 'delete', table, id })
export const unlink = (projectId, consultantId) =>
  sync.enqueue({ kind: 'unlink', project_id: projectId, consultant_id: consultantId })
export const upsertStats = (statsRow) => sync.enqueue({ kind: 'upsertStats', row: statsRow })
export const insertAchievements = (userId, codes) =>
  sync.enqueue({ kind: 'insertAchievements', rows: codes.map((code) => ({ user_id: userId, code })) })
