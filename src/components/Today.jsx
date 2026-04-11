import { useState } from 'react'
import { Flame, Share2, X } from 'lucide-react'
import { getItem, setItem } from '../lib/db.js'
import { computeStreak, suggestAdjustment } from '../lib/streaks.js'
import { todayKey, daysBetween } from '../lib/dates.js'
import ShareModal from './ShareModal.jsx'

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

function GoalCard({ goal, todayValue, streak, index, onMinus, onPlus, onDone, onUndo, onShare }) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!done && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={() => canMinus && onMinus(increment)}
              disabled={!canMinus}
              style={{
                border: `2px solid ${!canMinus ? '#bdb5ac' : INK}`,
                boxShadow: !canMinus ? 'none' : `2px 2px 0 ${INK}`,
                background: CREAM,
                color: !canMinus ? '#bdb5ac' : INK,
                fontFamily: MONO,
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                padding: '9px 6px',
                cursor: !canMinus ? 'not-allowed' : 'pointer',
                lineHeight: 1,
              }}
            >
              −{increment} {goal.unit.toUpperCase()}
            </button>
            <button
              onClick={() => onPlus(increment)}
              style={{
                border: `2px solid ${INK}`,
                boxShadow: `2px 2px 0 ${INK}`,
                background: CREAM,
                color: INK,
                fontFamily: MONO,
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                padding: '9px 6px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              +{increment} {goal.unit.toUpperCase()}
            </button>
          </div>
        )}
        <button
          onClick={done ? onUndo : onDone}
          style={{
            border: `2px solid ${INK}`,
            boxShadow: done ? 'none' : `3px 3px 0 ${HOT}`,
            background: done ? INK : HOT,
            color: CREAM,
            fontFamily: MONO,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            padding: '13px 8px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          {done ? '✓ DONE — UNDO' : 'DONE FOR TODAY'}
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
              color: HOT,
              cursor: 'pointer',
            }}
          >
            <Share2 size={11} /> SHARE {streak}-DAY STREAK
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

  // null | { goal, streak } — controls the share modal
  const [shareModal, setShareModal] = useState(null)

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


  // ── Derived ──────────────────────────────────────────────────────────────────

  const completedCount = goals.filter(g => getTodayValue(g.id) >= g.target).length
  const total          = goals.length

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
    <div style={{ background: CREAM }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 24px 96px' }}>

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
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 16px' }}>🌱</p>
            <p style={{ fontFamily: SERIF, fontSize: '1.2rem', fontWeight: 700, color: INK, margin: '0 0 8px' }}>
              Nothing tracked yet.
            </p>
            <p style={{ fontFamily: MONO, fontSize: '0.65rem', color: INK, opacity: 0.45, letterSpacing: '0.08em', margin: 0 }}>
              HEAD TO THE GOALS TAB TO ADD HABITS.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {completedCount === total && total > 0 && (
              <div style={{
                border: `2px solid ${INK}`,
                boxShadow: `4px 4px 0 ${INK}`,
                background: HOT,
                color: CREAM,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🔥</span>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.12em', margin: '0 0 4px', opacity: 0.85 }}>
                    ALL HABITS COMPLETE
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                    You lit the day. Keep the fire.
                  </p>
                </div>
              </div>
            )}
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
                    onMinus={inc => updateProgress(goal.id, todayVal - inc)}
                    onPlus={inc  => updateProgress(goal.id, todayVal + inc)}
                    onDone={() => updateProgress(goal.id, goal.target)}
                    onUndo={() => updateProgress(goal.id, 0)}
                    onShare={() => setShareModal({ goal, streak })}
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

    {shareModal && (
      <ShareModal
        goal={shareModal.goal}
        streak={shareModal.streak}
        user={user}
        onClose={() => setShareModal(null)}
      />
    )}
    </>
  )
}
