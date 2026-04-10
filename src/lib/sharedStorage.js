const PREFIX = 'shared:'

export function getItem(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — fail silently
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {}
}

/**
 * listKeys(prefix)
 *
 * Returns all shared-storage keys whose name starts with `prefix`.
 * The returned strings do NOT include the "shared:" namespace prefix,
 * so they can be passed directly to getItem / setItem.
 *
 * e.g. listKeys('leaderboard:') → ['leaderboard:abc', 'leaderboard:xyz']
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
