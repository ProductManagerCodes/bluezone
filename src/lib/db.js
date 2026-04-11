import { getItem as _get, setItem as _set, removeItem as _remove } from './storage.js'

let _uid = null

export function initUserStore(uid) { _uid = uid }
export function clearUserStore()   { _uid = null }

function k(key) { return _uid ? `u:${_uid}:${key}` : key }

export const getItem    = key        => _get(k(key))
export const setItem    = (key, val) => _set(k(key), val)
export const removeItem = key        => _remove(k(key))
