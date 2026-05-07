/**
 * db.js — User-scoped storage abstraction
 *
 * Drop-in replacement for storage.js that prefixes every key with the
 * currently signed-in user's UID: `u:{uid}:{key}`.
 *
 * This isolates each user's habit data inside the same localStorage so
 * that multiple accounts on the same browser never bleed into each other.
 *
 * When no UID is set (anonymous / Firebase disabled) keys are stored as-is,
 * preserving full backwards compatibility with the localStorage-only mode.
 *
 * Usage:
 *   import { initUserStore, clearUserStore, getItem, setItem } from './db.js'
 *
 *   // On sign-in:
 *   initUserStore(firebaseUser.uid)
 *
 *   // On sign-out:
 *   clearUserStore()
 *
 * Phase 2b migration path: swap the _get/_set/_remove imports below to point
 * at Firestore helpers — no component code needs to change.
 */

import { getItem as _get, setItem as _set, removeItem as _remove } from './storage.js'

/** The active user's UID, or null when running in anonymous mode. */
let _uid = null

/** Call once after Firebase auth resolves with a signed-in user. */
export function initUserStore(uid) { _uid = uid }

/** Call on sign-out to revert to unscoped (anonymous) key space. */
export function clearUserStore()   { _uid = null }

/** Builds the namespaced storage key for the current user. */
function k(key) { return _uid ? `u:${_uid}:${key}` : key }

export const getItem    = key        => _get(k(key))
export const setItem    = (key, val) => _set(k(key), val)
export const removeItem = key        => _remove(k(key))
