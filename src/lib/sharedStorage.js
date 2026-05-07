/**
 * sharedStorage.js — Simulated cross-user storage via a shared localStorage prefix
 *
 * In production the "shared" data (leaderboard entries, challenges) would live in
 * a real database such as Firestore. Until that backend exists, all browsers on
 * the same device share the same localStorage, so we use a "shared:" key prefix
 * to logically separate public social data from private per-user habit data.
 *
 * API mirrors storage.js exactly so the two modules are interchangeable.
 */

const PREFIX = 'shared:'

/**
 * Reads a JSON value from the shared namespace.
 * @param {string} key  Key without the "shared:" prefix.
 * @returns {*} Parsed value, or null if missing / unparseable.
 */
export function getItem(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Writes a JSON value into the shared namespace.
 * @param {string} key
 * @param {*} value
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — fail silently
  }
}

/**
 * Removes a key from the shared namespace.
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {}
}

/**
 * Returns all keys in the shared namespace that start with `prefix`.
 *
 * The returned strings omit the "shared:" namespace so they can be passed
 * directly back to getItem / setItem.
 *
 * @param {string} prefix  e.g. 'leaderboard:' or 'challenge:'
 * @returns {string[]}     e.g. ['leaderboard:abc123', 'leaderboard:xyz789']
 *
 * @example
 * const entries = listKeys('leaderboard:').map(k => getItem(k))
 */
export function listKeys(prefix) {
  const fullPrefix = PREFIX + prefix
  const result = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(fullPrefix)) {
        result.push(key.slice(PREFIX.length))
      }
    }
  } catch {}
  return result
}
