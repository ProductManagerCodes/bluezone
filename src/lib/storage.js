/**
 * storage.js — Thin localStorage wrapper with JSON serialisation
 *
 * All reads return null on missing key or parse failure (never throws).
 * All writes fail silently when storage is full or unavailable (e.g.
 * private browsing, exceeded quota, or security restrictions).
 *
 * This is the raw persistence layer. Application code should import from
 * db.js instead, which adds per-user key namespacing on top of this module.
 */

/**
 * Reads a JSON value from localStorage.
 * @param {string} key
 * @returns {*} Parsed value, or null if key is missing or value is unparseable.
 */
export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Serialises `value` as JSON and writes it to localStorage.
 * @param {string} key
 * @param {*} value  Any JSON-serialisable value.
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — fail silently
  }
}

/**
 * Removes a key from localStorage.
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // unavailable — fail silently
  }
}
