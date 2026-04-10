import { useState } from 'react'
import { getItem, setItem } from './lib/storage.js'
import Onboard from './components/Onboard.jsx'
import Today from './components/Today.jsx'
import Picker from './components/Picker.jsx'

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

function isOnboarded() {
  return Boolean(getItem('user') && getItem('goals')?.length)
}

function formatDate() {
  const d = new Date()
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

// ── Friends placeholder ───────────────────────────────────────────────────────

function Friends() {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px 80px' }}>
      <p style={{ fontFamily: MONO, fontSize: '0.68rem', color: HOT, letterSpacing: '0.12em', margin: '0 0 12px' }}>
        COMING SOON
      </p>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: '2.2rem',
          fontStyle: 'italic',
          fontWeight: 300,
          color: INK,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Friends
      </h2>
      <p
        style={{
          fontFamily: MONO,
          fontSize: '0.7rem',
          color: INK,
          opacity: 0.4,
          marginTop: 20,
          lineHeight: 1.6,
          letterSpacing: '0.03em',
          maxWidth: 280,
        }}
      >
        Share streaks and keep each other accountable.
      </p>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [ready, setReady] = useState(isOnboarded)
  const [tab,   setTab]   = useState('today')
  const [goals, setGoals] = useState(() => getItem('goals') ?? [])

  const user = getItem('user') ?? ''

  // Called by Onboard when the user completes setup
  function handleOnboarded() {
    setGoals(getItem('goals') ?? [])
    setReady(true)
  }

  if (!ready) {
    return <Onboard onComplete={handleOnboarded} />
  }

  // ── Goal state helpers ────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

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
            Ember
          </span>

          {/* Date + user */}
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
          </div>
        </div>
      </header>

      {/* ── Screen content ── */}
      <main>
        {tab === 'today'   && <Today   goals={goals} onGoalPatch={patchGoal}    />}
        {tab === 'goals'   && <Picker  goals={goals} onGoalsChange={updateGoals} />}
        {tab === 'friends' && <Friends />}
      </main>

      {/* ── Tab nav (fixed bottom) ── */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: CREAM,
          borderTop: `2px solid ${INK}`,
        }}
      >
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
  )
}
