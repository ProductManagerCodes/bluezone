export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — fail silently
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // unavailable — fail silently
  }
}
