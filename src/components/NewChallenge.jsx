/**
 * NewChallenge.jsx — Challenge creation form (sub-screen of Friends tab)
 *
 * Mounted in place of the Friends list when the user taps "+ NEW".
 * Three fields: challenge name, which habit, and duration (3–90 days).
 *
 * On submit, writes a challenge object to sharedStorage under the key
 * `challenge:{id}` so it becomes visible to all users on the same browser.
 * The creator is automatically added as the first participant.
 *
 * Challenge shape:
 * {
 *   id, title, goalId, goalTitle,
 *   creatorId, creatorName,
 *   duration, startDate, endDate, createdAt,
 *   participants: [creatorId]
 * }
 */

import { useState } from 'react'
import { setItem } from '../lib/sharedStorage.js'
import { todayKey } from '../lib/dates.js'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export default function NewChallenge({ goals, userId, userName, onBack }) {
  const [title,    setTitle]    = useState('')
  const [goalId,   setGoalId]   = useState(goals[0]?.id ?? '')
  const [duration, setDuration] = useState(7)

  const canSubmit = title.trim().length > 0 && goalId !== ''

  function handleSubmit() {
    if (!canSubmit) return
    const id        = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const startDate = todayKey()
    const endDate   = addDays(startDate, duration)
    const goalObj   = goals.find(g => g.id === goalId)
    setItem(`challenge:${id}`, {
      id,
      title:       title.trim(),
      goalId,
      goalTitle:   goalObj?.title ?? '',
      creatorId:   userId,
      creatorName: userName,
      duration,
      startDate,
      endDate,
      createdAt:   new Date().toISOString(),
      participants: [userId],
    })
    onBack()
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 24px 96px' }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          fontFamily: MONO,
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: HOT,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 28,
          display: 'block',
        }}
      >
        ← BACK
      </button>

      {/* Heading */}
      <p style={{ fontFamily: MONO, fontSize: '0.68rem', color: HOT, letterSpacing: '0.12em', margin: '0 0 8px' }}>
        NEW CHALLENGE
      </p>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: '2rem',
          fontWeight: 700,
          color: INK,
          margin: '0 0 32px',
          lineHeight: 1.1,
        }}
      >
        Set the stage.
      </h2>

      {/* Title input */}
      <div style={{ marginBottom: 28 }}>
        <label
          style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            color: INK,
            opacity: 0.5,
            marginBottom: 8,
          }}
        >
          CHALLENGE NAME
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Name this challenge…"
          maxLength={60}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${INK}`,
            outline: 'none',
            fontFamily: SERIF,
            fontSize: '1.4rem',
            color: INK,
            padding: '6px 0',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Goal selector */}
      <div style={{ marginBottom: 28 }}>
        <label
          style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            color: INK,
            opacity: 0.5,
            marginBottom: 10,
          }}
        >
          WHICH HABIT
        </label>
        {goals.length === 0 ? (
          <p style={{ fontFamily: MONO, fontSize: '0.7rem', color: INK, opacity: 0.4 }}>
            Add goals first.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map(g => {
              const selected = g.id === goalId
              return (
                <button
                  key={g.id}
                  onClick={() => setGoalId(g.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 14px',
                    border: `2px solid ${INK}`,
                    boxShadow: selected ? 'none' : `2px 2px 0 ${INK}`,
                    background: selected ? INK : CREAM,
                    color: selected ? CREAM : INK,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{g.emoji}</span>
                  <span style={{ fontFamily: SERIF, fontSize: '0.95rem', fontWeight: selected ? 400 : 600, flex: 1 }}>
                    {g.title}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: '0.58rem', opacity: 0.6, whiteSpace: 'nowrap' }}>
                    {g.target} {g.unit}/day
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Duration slider */}
      <div style={{ marginBottom: 36 }}>
        <label
          style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            color: INK,
            opacity: 0.5,
            marginBottom: 10,
          }}
        >
          DURATION
        </label>
        <div
          style={{
            fontFamily: MONO,
            fontSize: '2rem',
            fontWeight: 700,
            color: INK,
            letterSpacing: '-0.02em',
            marginBottom: 10,
            lineHeight: 1,
          }}
        >
          {duration}{' '}
          <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.5, letterSpacing: '0.08em' }}>DAYS</span>
        </div>
        <input
          type="range"
          min={3}
          max={90}
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="monk-slider"
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: MONO,
            fontSize: '0.55rem',
            color: INK,
            opacity: 0.35,
            marginTop: 6,
            letterSpacing: '0.06em',
          }}
        >
          <span>3 DAYS</span>
          <span>90 DAYS</span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: '15px 20px',
          border: `2px solid ${canSubmit ? INK : '#bdb5ac'}`,
          boxShadow: canSubmit ? `4px 4px 0 ${INK}` : 'none',
          background: canSubmit ? HOT : '#ede7dc',
          color: canSubmit ? CREAM : '#9e968e',
          fontFamily: MONO,
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        CREATE CHALLENGE
      </button>

    </div>
  )
}
