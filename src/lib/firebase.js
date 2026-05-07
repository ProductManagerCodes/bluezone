/**
 * firebase.js — Conditional Firebase initialisation
 *
 * Firebase is treated as an optional dependency. If the required VITE_
 * environment variables are absent (e.g. during local development without
 * a .env file), `firebaseEnabled` is false and no Firebase SDK code runs.
 * The rest of the app degrades gracefully to anonymous localStorage mode.
 *
 * Required env vars (copy .env.example → .env and fill in from the
 * Firebase console → Project settings → Your apps → Web):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *
 * Optional (needed for storage & analytics, not for auth alone):
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *
 * Note: VITE_ prefix exposes values to the browser bundle. These are public
 * API keys (Firebase is designed for client-side use), but enable App Check
 * and security rules in production to prevent abuse.
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
]

/** True when all required Firebase env vars are present. */
export const firebaseEnabled = required.every(k => !!import.meta.env[k])

let app, auth

if (firebaseEnabled) {
  app = initializeApp({
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  })
  auth = getAuth(app)
}

export { auth }
