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

export const isAuthAvailable = () => firebaseEnabled

export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) await updateProfile(cred.user, { displayName })
  return cred
}

export async function signInFacebook() {
  return signInWithPopup(auth, new FacebookAuthProvider())
}

export function logout() {
  return auth ? signOut(auth) : Promise.resolve()
}

export function onAuthChange(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}
