// Offline-tolerant write queue for Supabase.
// Every cloud write is queued and persisted to localStorage, then flushed to
// Supabase. Failed writes (e.g. no signal) are retried with backoff and survive
// reloads, so nothing is lost in the field.
import { supabase, isCloud } from './supabase.js'

const KEY = 'airpresales.syncqueue.v1'
const MAX_ATTEMPTS = 6

let queue = load()
let processing = false
let retryTimer = null
const listeners = new Set()

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(queue))
  } catch {
    // storage unavailable — keep going in-memory
  }
}
function opId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getStatus() {
  return {
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    pending: queue.length,
    processing,
  }
}
export function subscribe(listener) {
  listeners.add(listener)
  listener(getStatus())
  return () => listeners.delete(listener)
}
function emit() {
  const s = getStatus()
  listeners.forEach((l) => l(s))
}

export function enqueue(op) {
  queue.push({ ...op, _id: opId(), attempts: 0 })
  persist()
  emit()
  process()
}

async function execute(op) {
  switch (op.kind) {
    case 'insert':
      return supabase.from(op.table).insert(op.row)
    case 'update':
      return supabase.from(op.table).update(op.patch).eq('id', op.id)
    case 'delete':
      return supabase.from(op.table).delete().eq('id', op.id)
    case 'upsertStats':
      return supabase.from('user_stats').upsert(op.row)
    case 'unlink':
      return supabase
        .from('project_consultants')
        .delete()
        .eq('project_id', op.project_id)
        .eq('consultant_id', op.consultant_id)
    case 'insertAchievements':
      return supabase.from('achievements').insert(op.rows)
    default:
      return { error: { message: 'unknown op ' + op.kind } }
  }
}

export async function process() {
  if (!isCloud || processing) return
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    emit()
    return
  }
  if (queue.length === 0) return

  processing = true
  emit()

  while (queue.length > 0) {
    const op = queue[0]
    let result
    try {
      result = await execute(op)
    } catch (e) {
      result = { error: e }
    }

    if (result && result.error) {
      op.attempts = (op.attempts || 0) + 1
      if (op.attempts >= MAX_ATTEMPTS) {
        console.error('[sync] dropping op after max attempts:', op.kind, result.error?.message)
        queue.shift() // drop the poison pill so the queue can drain
        persist()
        continue
      }
      persist()
      scheduleRetry(op.attempts) // keep order: retry this op (and the tail) later
      break
    }

    queue.shift()
    persist()
    emit()
  }

  processing = false
  emit()
}

function scheduleRetry(attempts) {
  clearTimeout(retryTimer)
  const delay = Math.min(30000, 1000 * 2 ** attempts)
  retryTimer = setTimeout(process, delay)
}

// Flush automatically when connectivity returns.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    emit()
    process()
  })
  window.addEventListener('offline', emit)
}
