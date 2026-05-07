/**
 * auth.js — Firebase Authentication helpers
 *
 * Thin wrappers around the Firebase Auth SDK that keep component code free
 * of SDK-specific imports. All functions throw the raw Firebase error on
 * failure so callers can map error codes to user-friendly messages
 * (see AuthScreen.jsx → friendlyError).
 *
 * When Firebase is disabled (`firebaseEnabled === false`):
 *   - isAuthAvailable() returns false
 *   - onAuthChange fires immediately with null (anonymous user)
 *   - All other functions are unreachable (AuthScreen is never rendered)
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  FacebookAuthProvider,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, firebaseEnabled } from './firebase.js'

/** Returns true when Firebase config is present and auth is available. */
export const isAuthAvailable = () => firebaseEnabled

/**
 * Signs in an existing user with email + password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Creates a new account with email + password, then sets the display name.
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName]  Written to the Firebase user profile if provided.
 * @returns {Promise<UserCredential>}
 */
export async function signUpEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) await updateProfile(cred.user, { displayName })
  return cred
}

/**
 * Opens a Facebook OAuth popup. Requires the Facebook provider to be
 * enabled in the Firebase console and a Facebook App configured with
 * the Firebase OAuth redirect URI.
 * @returns {Promise<UserCredential>}
 */
export async function signInFacebook() {
  return signInWithPopup(auth, new FacebookAuthProvider())
}

/**
 * Signs out the current user.
 * Safe to call when Firebase is disabled (resolves immediately).
 * @returns {Promise<void>}
 */
export function logout() {
  return auth ? signOut(auth) : Promise.resolve()
}

/**
 * Subscribes to auth state changes.
 *
 * When Firebase is disabled, the callback fires once synchronously with
 * null so the rest of the app can initialise in anonymous mode without
 * waiting for an async response.
 *
 * @param {(user: FirebaseUser | null) => void} callback
 * @returns {() => void}  Unsubscribe function — pass as the return value
 *                        of a useEffect to clean up on unmount.
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}
