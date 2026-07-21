// Per-user local snapshot of cloud data, so the app opens instantly (and works
// offline) with the last-known data while it refreshes from Supabase.
const key = (userId) => `airpresales.cache.${userId}`

export function loadCache(userId) {
  try {
    const raw = localStorage.getItem(key(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCache(userId, state) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}
