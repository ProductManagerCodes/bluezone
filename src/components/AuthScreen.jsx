/**
 * AuthScreen.jsx — Sign-in / account creation screen
 *
 * Shown when Firebase auth is enabled and no user is currently signed in.
 * On successful auth, onAuthStateChanged in App.jsx fires automatically —
 * no explicit callback needed here.
 *
 * Modes (toggled via the two-button tab strip):
 *   SIGN IN        — email + password
 *   CREATE ACCOUNT — email + password + optional display name
 *
 * Also supports Facebook OAuth via a popup flow (requires the Facebook
 * provider to be enabled in Firebase console and a configured Facebook App).
 *
 * Firebase error codes are mapped to plain-English messages via friendlyError()
 * so users never see raw SDK strings like "auth/wrong-password".
 */

import { useState } from 'react'
import { signInEmail, signUpEmail, signInFacebook } from '../lib/auth.js'

const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const FB    = '#1877F2'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Wrong email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default function AuthScreen() {
  const [mode,     setMode]     = useState('signin')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInEmail(email, password)
      } else {
        await signUpEmail(email, password, name.trim() || undefined)
      }
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleFacebook() {
    setError('')
    setLoading(true)
    try {
      await signInFacebook()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${INK}`,
    fontFamily: SERIF,
    fontSize: '1.2rem',
    color: INK,
    padding: '6px 0 10px',
    outline: 'none',
    caretColor: HOT,
    marginBottom: 28,
  }

  const labelStyle = {
    display: 'block',
    fontFamily: MONO,
    fontSize: '0.58rem',
    letterSpacing: '0.1em',
    color: INK,
    opacity: 0.45,
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Brand */}
        <div style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: HOT,
          marginBottom: 48,
          letterSpacing: '0.02em',
        }}>
          RegularMonk
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          border: `2px solid ${INK}`,
          boxShadow: `4px 4px 0 ${INK}`,
          marginBottom: 40,
        }}>
          {[['signin', 'SIGN IN'], ['signup', 'CREATE ACCOUNT']].map(([m, label], i) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                border: 'none',
                borderRight: i === 0 ? `2px solid ${INK}` : 'none',
                background: mode === m ? INK : CREAM,
                color: mode === m ? CREAM : INK,
                fontFamily: MONO,
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                padding: '14px 8px',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <label style={labelStyle}>YOUR NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="How should we call you?"
                style={inputStyle}
                autoFocus
              />
            </>
          )}

          <label style={labelStyle}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            autoFocus={mode === 'signin'}
            required
          />

          <label style={labelStyle}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
            style={{ ...inputStyle, marginBottom: 0 }}
            required
          />

          {error && (
            <p style={{
              fontFamily: MONO,
              fontSize: '0.65rem',
              color: HOT,
              margin: '12px 0 0',
              letterSpacing: '0.04em',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 28,
              padding: '16px 24px',
              fontFamily: MONO,
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              background: loading ? '#bdb5ac' : INK,
              color: CREAM,
              border: `2px solid ${loading ? '#bdb5ac' : INK}`,
              boxShadow: loading ? 'none' : `4px 4px 0 ${HOT}`,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'PLEASE WAIT…' : mode === 'signin' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          margin: '28px 0',
        }}>
          <div style={{ flex: 1, height: 2, background: INK, opacity: 0.12 }} />
          <span style={{ fontFamily: MONO, fontSize: '0.6rem', color: INK, opacity: 0.35, letterSpacing: '0.08em' }}>
            OR
          </span>
          <div style={{ flex: 1, height: 2, background: INK, opacity: 0.12 }} />
        </div>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 24px',
            fontFamily: MONO,
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            background: FB,
            color: '#ffffff',
            border: `2px solid ${INK}`,
            boxShadow: loading ? 'none' : `4px 4px 0 ${INK}`,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          CONTINUE WITH FACEBOOK
        </button>

      </div>
    </div>
  )
}
