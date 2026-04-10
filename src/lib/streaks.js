import { todayKey } from './dates.js'

/**
 * computeStreak(history)
 *
 * history: { "YYYY-MM-DD": { done: boolean, value: number, target: number } }
 *
 * Returns the number of consecutive completed days ending on today or yesterday.
 * A gap of more than one day resets the streak to 0.
 */
export function computeStreak(history) {
  const today = todayKey()
  let cursor = new Date(today + 'T00:00:00')

  // Allow streak to end on today or yesterday
  const todayEntry = history[today]
  if (!todayEntry?.done) {
    // Step back one day — streak might end on yesterday
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (history[key]?.done) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * suggestAdjustment(goal, history)
 *
 * goal:    { target: number, ... }
 * history: { "YYYY-MM-DD": { done: boolean, value: number, target: number } }
 *
 * Looks at the last 7 calendar days.
 * Requires at least 4 days of data before making a suggestion.
 *
 * Returns:
 *   { type: "upgrade",   newTarget: number } — if 70%+ of days hit ≥120% of target
 *   { type: "downgrade", newTarget: number } — if <40% of days were marked done
 *   null — otherwise
 */
export function suggestAdjustment(goal, history) {
  const today = new Date(todayKey() + 'T00:00:00')
  const window = []

  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (history[key] !== undefined) {
      window.push(history[key])
    }
  }

  if (window.length < 4) return null

  const target = goal.target
  const doneCount = window.filter(e => e.done).length
  const overCount = window.filter(e => e.value >= target * 1.2).length
  const doneRate  = doneCount / window.length
  const overRate  = overCount / window.length

  if (overRate >= 0.7) {
    return { type: 'upgrade', newTarget: Math.ceil(target * 1.2) }
  }
  if (doneRate < 0.4) {
    return { type: 'downgrade', newTarget: Math.max(1, Math.floor(target * 0.75)) }
  }

  return null
}
