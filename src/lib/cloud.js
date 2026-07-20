import { supabase } from './supabase.js'

// Fire-and-forget writes: log errors but don't block the (optimistic) UI.
function run(promiseFactory, label) {
  Promise.resolve()
    .then(promiseFactory)
    .then(({ error } = {}) => {
      if (error) console.error(`[cloud] ${label} failed:`, error.message)
    })
    .catch((e) => console.error(`[cloud] ${label} threw:`, e))
}

const DEFAULT_STATS = {
  total_points: 0,
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
}

// Load the full app state for a user into the app's in-memory shape.
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

  // Ensure a stats row exists for this user.
  let statsRow = stats.data
  if (!statsRow) {
    statsRow = { user_id: userId, ...DEFAULT_STATS }
    run(() => supabase.from('user_stats').insert(statsRow), 'insert stats')
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

export const insert = (table, row) =>
  run(() => supabase.from(table).insert(row), `insert ${table}`)

export const update = (table, id, patch) =>
  run(() => supabase.from(table).update(patch).eq('id', id), `update ${table}`)

export const remove = (table, id) =>
  run(() => supabase.from(table).delete().eq('id', id), `delete ${table}`)

export const unlink = (projectId, consultantId) =>
  run(
    () =>
      supabase
        .from('project_consultants')
        .delete()
        .eq('project_id', projectId)
        .eq('consultant_id', consultantId),
    'unlink consultant',
  )

export const upsertStats = (statsRow) =>
  run(() => supabase.from('user_stats').upsert(statsRow), 'upsert stats')

export const insertAchievements = (userId, codes) =>
  run(
    () => supabase.from('achievements').insert(codes.map((code) => ({ user_id: userId, code }))),
    'insert achievements',
  )
