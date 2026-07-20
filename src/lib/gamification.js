import { differenceInCalendarDays, format } from 'date-fns'

export const ACHIEVEMENTS = [
  { code: 'first_contact', label: 'First Contact', desc: 'Log your first interaction', icon: '🤝' },
  { code: 'streak_7', label: 'Consistent', desc: 'Reach a 7-day streak', icon: '🔥' },
  { code: 'networker_25', label: 'Networker', desc: 'Log 25 interactions', icon: '📇' },
  { code: 'networker_100', label: 'Super Connector', desc: 'Log 100 interactions', icon: '🌐' },
  { code: 'inbox_zero', label: 'No One Left Behind', desc: 'Clear all overdue consultants', icon: '✅' },
  { code: 'century', label: 'Century', desc: 'Earn 1000 points', icon: '💯' },
]

const today = () => format(new Date(), 'yyyy-MM-dd')

// Update streak given the previous stats and the moment of a new activity.
export function applyStreak(stats) {
  const t = today()
  if (stats.last_activity_date === t) return stats // already counted today
  let current = 1
  if (stats.last_activity_date) {
    const gap = differenceInCalendarDays(new Date(t), new Date(stats.last_activity_date))
    current = gap === 1 ? stats.current_streak + 1 : 1
  }
  return {
    ...stats,
    current_streak: current,
    longest_streak: Math.max(stats.longest_streak || 0, current),
    last_activity_date: t,
  }
}

// Return newly-unlocked achievement codes given current state.
export function checkAchievements(state, unlocked) {
  const { stats, interactionsCount, overdueCount } = state
  const has = (c) => unlocked.includes(c)
  const out = []
  if (interactionsCount >= 1 && !has('first_contact')) out.push('first_contact')
  if (stats.current_streak >= 7 && !has('streak_7')) out.push('streak_7')
  if (interactionsCount >= 25 && !has('networker_25')) out.push('networker_25')
  if (interactionsCount >= 100 && !has('networker_100')) out.push('networker_100')
  if (interactionsCount >= 1 && overdueCount === 0 && !has('inbox_zero')) out.push('inbox_zero')
  if (stats.total_points >= 1000 && !has('century')) out.push('century')
  return out
}
