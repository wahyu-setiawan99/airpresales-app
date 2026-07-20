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
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  )
}
