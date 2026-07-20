import { seedState } from './seed.js'

const KEY = 'airpresales.v1'

// Load the whole app state from localStorage, seeding on first run.
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted storage — fall through to seed
  }
  const seeded = seedState()
  saveState(seeded)
  return seeded
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full / unavailable — ignore for now
  }
}

export function resetState() {
  const seeded = seedState()
  saveState(seeded)
  return seeded
}

export function newId() {
  // UUID so client-generated ids are valid Supabase `uuid` primary keys.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback for very old environments.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
