import { useState, useEffect } from 'react'
import { getItem, setItem, initUserStore, clearUserStore } from './lib/db.js'
import { setItem as sharedSet } from './lib/sharedStorage.js'
import { onAuthChange, logout, isAuthAvailable } from './lib/auth.js'
import { computeStreak } from './lib/streaks.js'
import { todayKey } from './lib/dates.js'
import Onboard from './components/Onboard.jsx'
import Today from './components/Today.jsx'
import Picker from './components/Picker.jsx'
import Friends from './components/Friends.jsx'
import AuthScreen from './components/AuthScreen.jsx'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

const TABS = [
  { id: 'today',   label: 'TODAY'   },
  { id: 'goals',   label: 'GOALS'   },
  { id: 'friends', label: 'FRIENDS' },
]

function formatDate() {
  const d = new Date()
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function publishLeaderboard(goals, userId, userName) {
  const today     = todayKey()
  const histories = goals.map(g => getItem(`history_${g.id}`) ?? {})
  const totalStreak = goals.reduce((sum, g, i) => sum + computeStreak(histories[i]), 0)
  const todayDone   = goals.filter((g, i) => histories[i][today]?.done).length
  sharedSet(`leaderboard:${userId}`, {
    userId,
    name:      userName,
    totalStreak,
    todayDone,
    goalCount: goals.length,
    updatedAt: new Date().toISOString(),
  })
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [userId,    setUserId]    = useState(null)
  const [ready,     setReady]     = useState(false)
  const [tab,       setTab]       = useState('today')
  const [goals,     setGoals]     = useState([])

  // ── Auth listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthChange(fbUser => {
      if (fbUser) {
        initUserStore(fbUser.uid)
        setUserId(fbUser.uid)
      } else {
        clearUserStore()
        setUserId(null)
      }
      const onboarded = Boolean(getItem('user') && getItem('goals')?.length)
      if (onboarded) setGoals(getItem('goals') ?? [])
      setReady(onboarded)
      setAuthReady(true)
    })
  }, [])

  const user = getItem('user') ?? ''

  // ── Leaderboard sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (ready) publishLeaderboard(goals, userId ?? 'anon', user)
  }, [goals, ready])

  // ── Callbacks ─────────────────────────────────────────────────────────────

  function handleOnboarded() {
    setGoals(getItem('goals') ?? [])
    setReady(true)
  }

  function patchGoal(goalId, patch) {
    setGoals(prev => {
      const updated = prev.map(g => g.id === goalId ? { ...g, ...patch } : g)
      setItem('goals', updated)
      return updated
    })
  }

  function updateGoals(newGoals) {
    setGoals(newGoals)
    setItem('goals', newGoals)
  }

  async function handleSignOut() {
    await logout()
    // onAuthChange fires automatically after logout and resets all state
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!authReady) {
    return <div style={{ minHeight: '100vh', background: CREAM }} />
  }

  if (isAuthAvailable() && !userId) {
    return <AuthScreen />
  }

  if (!ready) {
    return <Onboard onComplete={handleOnboarded} />
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>

      {/* ── Global header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: CREAM,
          borderBottom: `1px solid ${INK}`,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '13px 24px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand */}
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '1.6rem',
              color: HOT,
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            RegularMonk
          </span>

          {/* Date + user + optional sign-out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: '0.62rem',
                color: INK,
                opacity: 0.4,
                letterSpacing: '0.1em',
              }}
            >
              {formatDate()}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: '0.62rem',
                color: INK,
                letterSpacing: '0.07em',
                opacity: 0.75,
              }}
            >
              {user.toUpperCase()}
            </span>
            {isAuthAvailable() && (
              <button
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: MONO,
                  fontSize: '0.55rem',
                  letterSpacing: '0.1em',
                  color: INK,
                  opacity: 0.4,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                EXIT
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Screen content ── */}
      <main>
        {tab === 'today'   && <Today   goals={goals} onGoalPatch={patchGoal}    />}
        {tab === 'goals'   && <Picker  goals={goals} onGoalsChange={updateGoals} />}
        {tab === 'friends' && <Friends goals={goals} userId={userId ?? 'anon'} userName={user} />}
      </main>

      {/* ── Bottom chrome: footer + tab nav ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: CREAM,
        }}
      >
        {/* Footer */}
        <div style={{ borderTop: `2px solid ${INK}` }}>
          <div
            style={{
              maxWidth: 520,
              margin: '0 auto',
              padding: '6px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: '0.48rem',
                letterSpacing: '0.1em',
                color: INK,
                opacity: 0.3,
              }}
            >
              REGULARMONK · HABIT JOURNAL
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: '0.48rem',
                letterSpacing: '0.1em',
                color: INK,
                opacity: 0.3,
              }}
            >
              KEEP THE FIRE LIT
            </span>
          </div>
        </div>

        {/* Tab nav */}
        <nav style={{ borderTop: `2px solid ${INK}` }}>
          <div
            style={{
              maxWidth: 520,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
            }}
          >
            {TABS.map(({ id, label }, i) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    border: 'none',
                    borderRight: i < TABS.length - 1 ? `2px solid ${INK}` : 'none',
                    background: active ? INK : CREAM,
                    color: active ? CREAM : INK,
                    fontFamily: MONO,
                    fontSize: '0.62rem',
                    letterSpacing: '0.1em',
                    padding: '17px 8px 16px',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

    </div>
  )
}
