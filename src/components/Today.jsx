import { useState } from 'react'
import { Flame, Share2, X } from 'lucide-react'
import { getItem, setItem } from '../lib/storage.js'
import { computeStreak, suggestAdjustment } from '../lib/streaks.js'
import { todayKey, daysBetween } from '../lib/dates.js'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function shouldShowNudge(goal, today) {
  if (!goal.adjustDismissed) return true
  return daysBetween(goal.adjustDismissed, today) >= 7
}

// ── Primitive styles ──────────────────────────────────────────────────────────

function controlBtnStyle(active, disabled) {
  return {
    border: `2px solid ${disabled ? '#bdb5ac' : INK}`,
    boxShadow: disabled ? 'none' : `3px 3px 0 ${INK}`,
    background: active ? INK : CREAM,
    color: active ? CREAM : disabled ? '#bdb5ac' : INK,
    fontFamily: MONO,
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    padding: '11px 8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    lineHeight: 1,
  }
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ value, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div
      style={{
        position: 'relative',
        height: 10,
        border: `2px solid ${INK}`,
        background: CREAM,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${pct}%`,
          background: HOT,
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  )
}

// ── GoalCard ──────────────────────────────────────────────────────────────────

function GoalCard({ goal, todayValue, streak, index, shared, onMinus, onPlus, onDone, onShare }) {
  const done      = todayValue >= goal.target
  const increment = Math.max(1, Math.round(goal.target / 4))
  const canMinus  = todayValue > 0
  const flameColor = streak > 0 ? HOT : '#b0a89e'

  return (
    <div
      style={{
        border: `2px solid ${INK}`,
        boxShadow: `4px 4px 0 ${INK}`,
        background: CREAM,
        padding: 22,
        animation: 'rise 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        animationDelay: `${index * 90}ms`,
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: '1.35rem', lineHeight: 1, flexShrink: 0 }}>{goal.emoji}</span>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: '1.15rem',
            fontWeight: done ? 400 : 700,
            fontStyle: done ? 'italic' : 'normal',
            color: INK,
            lineHeight: 1.2,
          }}
        >
          {goal.title}
        </span>
      </div>

      {/* Progress text + streak */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: '0.76rem', color: INK, letterSpacing: '0.02em' }}>
          {todayValue} / {goal.target} {goal.unit}
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Flame size={13} color={flameColor} fill={flameColor} />
          <span style={{ fontFamily: MONO, fontSize: '0.65rem', color: INK, letterSpacing: '0.04em' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{streak}</span>
            {' DAY STREAK'}
          </span>
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 18 }}>
        <ProgressBar value={todayValue} target={goal.target} />
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8 }}>
        <button
          onClick={() => canMinus && onMinus(increment)}
          disabled={!canMinus}
          style={{ ...controlBtnStyle(false, !canMinus), fontSize: '1.15rem' }}
        >
          −
        </button>
        <button
          onClick={() => onPlus(increment)}
          style={{ ...controlBtnStyle(false, false), fontSize: '1.15rem' }}
        >
          +
        </button>
        <button onClick={onDone} style={controlBtnStyle(done, false)}>
          {done ? '✓ DONE' : 'DONE'}
        </button>
      </div>

      {/* Share */}
      {streak >= 3 && (
        <div style={{ marginTop: 13, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onShare}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: MONO,
              fontSize: '0.63rem',
              letterSpacing: '0.09em',
              color: shared ? INK : HOT,
              opacity: shared ? 0.5 : 1,
              cursor: 'pointer',
            }}
          >
            {shared ? 'COPIED!' : <><Share2 size={11} /> SHARE {streak}-DAY STREAK</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── NudgeBanner ───────────────────────────────────────────────────────────────

function NudgeBanner({ suggestion, goal, onAccept, onDismiss }) {
  const msg =
    suggestion.type === 'upgrade'
      ? `You're crushing this. Bump to ${suggestion.newTarget} ${goal.unit}?`
      : `Struggling a bit? Try ${suggestion.newTarget} ${goal.unit} instead.`

  return (
    <div
      style={{
        border: `2px solid ${INK}`,
        borderLeft: `4px solid ${HOT}`,
        borderTop: 'none',
        background: CREAM,
        padding: '11px 14px 11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span
        style={{
          flex: 1,
          fontFamily: MONO,
          fontSize: '0.67rem',
          lineHeight: 1.55,
          color: INK,
          letterSpacing: '0.02em',
        }}
      >
        {msg}
      </span>
      <button
        onClick={onAccept}
        style={{
          border: `2px solid ${HOT}`,
          boxShadow: `2px 2px 0 ${HOT}`,
          background: HOT,
          color: CREAM,
          fontFamily: MONO,
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          padding: '6px 12px',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        YES
      </button>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: INK,
          opacity: 0.45,
          cursor: 'pointer',
          padding: '2px 4px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Today ─────────────────────────────────────────────────────────────────────

export default function Today({ goals, onGoalPatch }) {
  const user  = getItem('user') ?? ''
  const today = todayKey()

  const [histories, setHistories] = useState(() =>
    Object.fromEntries(
      goals.map(g => [g.id, getItem(`history_${g.id}`) ?? {}])
    )
  )

  // goalId → true while "Copied!" flash is active
  const [sharedIds, setSharedIds] = useState({})

  // ── Data helpers ─────────────────────────────────────────────────────────────

  function getTodayValue(goalId) {
    return histories[goalId]?.[today]?.value ?? 0
  }

  function persistProgress(goalId, clamped, goalTarget) {
    const entry = { value: clamped, target: goalTarget, done: clamped >= goalTarget }
    const nextHist = { ...histories[goalId], [today]: entry }
    setHistories(prev => ({ ...prev, [goalId]: nextHist }))
    setItem(`history_${goalId}`, nextHist)
  }

  function updateProgress(goalId, newValue) {
    const goal = goals.find(g => g.id === goalId)
    persistProgress(goalId, Math.max(0, newValue), goal.target)
  }

  function acceptAdjustment(goalId, newTarget) {
    // Re-stamp today's history entry against the new target, then lift the patch
    const current = getTodayValue(goalId)
    persistProgress(goalId, current, newTarget)
    onGoalPatch(goalId, { target: newTarget, adjustDismissed: null })
  }

  function dismissAdjustment(goalId) {
    onGoalPatch(goalId, { adjustDismissed: today })
  }

  async function handleShare(goal, streak) {
    const text = `🔥 ${streak}-day streak on "${goal.title}" — tracked with Ember`
    try {
      if (navigator.share) await navigator.share({ text })
      else await navigator.clipboard.writeText(text)
    } catch {
      // user cancelled or clipboard unavailable — fail silently
    }
    setSharedIds(prev => ({ ...prev, [goal.id]: true }))
    setTimeout(() => setSharedIds(prev => ({ ...prev, [goal.id]: false })), 2000)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const completedCount = goals.filter(g => getTodayValue(g.id) >= g.target).length
  const total          = goals.length

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: CREAM }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: INK,
                margin: 0,
              }}
            >
              {greeting()},<br />
              <em style={{ fontWeight: 300, fontStyle: 'italic' }}>{user}.</em>
            </h1>

            <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 16 }}>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: completedCount === total && total > 0 ? HOT : INK,
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {completedCount}/{total}
              </p>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '0.58rem',
                  color: INK,
                  opacity: 0.45,
                  margin: '5px 0 0',
                  letterSpacing: '0.1em',
                }}
              >
                LIT TODAY
              </p>
            </div>
          </div>
        </div>

        {/* ── Goal cards ── */}
        {goals.length === 0 ? (
          <p style={{ fontFamily: MONO, fontSize: '0.75rem', color: INK, opacity: 0.5 }}>
            No habits yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {goals.map((goal, index) => {
              const history    = histories[goal.id] ?? {}
              const todayVal   = getTodayValue(goal.id)
              const streak     = computeStreak(history)
              const suggestion = suggestAdjustment(goal, history)
              const showNudge  = !!suggestion && shouldShowNudge(goal, today)

              return (
                <div key={goal.id}>
                  <GoalCard
                    goal={goal}
                    todayValue={todayVal}
                    streak={streak}
                    index={index}
                    shared={!!sharedIds[goal.id]}
                    onMinus={inc => updateProgress(goal.id, todayVal - inc)}
                    onPlus={inc  => updateProgress(goal.id, todayVal + inc)}
                    onDone={() => updateProgress(goal.id, goal.target)}
                    onShare={() => handleShare(goal, streak)}
                  />
                  {showNudge && (
                    <NudgeBanner
                      suggestion={suggestion}
                      goal={goal}
                      onAccept={() => acceptAdjustment(goal.id, suggestion.newTarget)}
                      onDismiss={() => dismissAdjustment(goal.id)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
