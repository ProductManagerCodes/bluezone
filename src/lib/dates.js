/** Returns today's date as "YYYY-MM-DD" in local time. */
export function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * daysBetween(a, b)
 *
 * Returns the integer number of days between two "YYYY-MM-DD" strings.
 * Always positive (absolute value).
 */
export function daysBetween(a, b) {
  const ms = Math.abs(new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00'))
  return Math.round(ms / 86_400_000)
}
