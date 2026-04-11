import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { THEMES } from '../data/themes.js'
import { getItem } from '../lib/db.js'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

// Flat goal list with theme metadata for the picker
const ALL_THEME_GOALS = THEMES.flatMap(t =>
  t.goals.map(g => ({ ...g, themeId: t.id, themeEmoji: t.emoji, themeLabel: t.label }))
)

function daysLogged(goalId) {
  const h = getItem(`history_${goalId}`) ?? {}
  return Object.keys(h).length
}

// ── Current goal row ──────────────────────────────────────────────────────────

function GoalRow({ goal, onRemove }) {
  const days = daysLogged(goal.id)
  return (
    <div
      style={{
        padding: '15px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: CREAM,
      }}
    >
      <span style={{ fontSize: '1.3rem', lineHeight: 1, flexShrink: 0 }}>{goal.emoji}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: '1rem',
            fontWeight: 700,
            color: INK,
            lineHeight: 1.2,
          }}
        >
          {goal.title}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: '0.6rem',
            color: INK,
            opacity: 0.5,
            marginTop: 4,
            letterSpacing: '0.04em',
          }}
        >
          {goal.target} {goal.unit}/day
          {' · '}
          {days} day{days !== 1 ? 's' : ''} logged
        </div>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Remove ${goal.title}`}
        style={{
          background: 'none',
          border: 'none',
          color: INK,
          opacity: 0.4,
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  )
}

// ── Picker row inside the "add" panel ─────────────────────────────────────────

function PickerGoalRow({ goal, added, onAdd }) {
  return (
    <button
      disabled={added}
      onClick={() => !added && onAdd(goal)}
      style={{
        width: '100%',
        border: `2px solid ${added ? '#ccc5bc' : INK}`,
        background: added ? '#ede7dc' : CREAM,
        color: added ? '#9e968e' : INK,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: added ? 'default' : 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        boxShadow: added ? 'none' : `2px 2px 0 ${INK}`,
      }}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>{goal.emoji}</span>
      <span
        style={{
          flex: 1,
          fontFamily: SERIF,
          fontSize: '0.95rem',
          fontWeight: added ? 400 : 600,
          fontStyle: added ? 'italic' : 'normal',
        }}
      >
        {goal.title}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: '0.58rem',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          opacity: 0.65,
        }}
      >
        {goal.target} {goal.unit}/day
      </span>
      {added && (
        <span style={{ fontFamily: MONO, fontSize: '0.55rem', opacity: 0.5, marginLeft: 4 }}>
          ✓
        </span>
      )}
    </button>
  )
}

// ── Picker ────────────────────────────────────────────────────────────────────

export default function Picker({ goals, onGoalsChange }) {
  const [addOpen, setAddOpen] = useState(false)
  const canAdd   = goals.length < 5
  const addedIds = new Set(goals.map(g => g.id))

  function handleRemove(goalId) {
    onGoalsChange(goals.filter(g => g.id !== goalId))
  }

  function handleAdd(templateGoal) {
    if (goals.length >= 5) return
    const newGoal = {
      id:     templateGoal.id,
      emoji:  templateGoal.emoji,
      title:  templateGoal.title,
      unit:   templateGoal.unit,
      target: templateGoal.target,
    }
    const updated = [...goals, newGoal]
    onGoalsChange(updated)
    if (updated.length >= 5) setAddOpen(false)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 24px 96px' }}>

      {/* ── Section header ── */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: '0.68rem',
            color: HOT,
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          YOUR GOALS · {goals.length}/5
        </p>
      </div>

      {/* ── Current goals list ── */}
      {goals.length === 0 ? (
        <p
          style={{
            fontFamily: MONO,
            fontSize: '0.72rem',
            color: INK,
            opacity: 0.4,
            letterSpacing: '0.04em',
          }}
        >
          No habits yet — add your first below.
        </p>
      ) : (
        <div
          style={{
            border: `2px solid ${INK}`,
            boxShadow: `4px 4px 0 ${INK}`,
          }}
        >
          {goals.map((goal, i) => (
            <div
              key={goal.id}
              style={{
                borderBottom: i < goals.length - 1 ? `2px solid ${INK}` : 'none',
              }}
            >
              <GoalRow goal={goal} onRemove={() => handleRemove(goal.id)} />
            </div>
          ))}
        </div>
      )}

      {/* ── Add goal toggle ── */}
      {canAdd && (
        <button
          onClick={() => setAddOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 14,
            padding: '13px 16px',
            fontFamily: MONO,
            fontSize: '0.72rem',
            letterSpacing: '0.09em',
            background: addOpen ? INK : CREAM,
            color: addOpen ? CREAM : INK,
            border: `2px solid ${INK}`,
            boxShadow: addOpen ? 'none' : `4px 4px 0 ${INK}`,
            cursor: 'pointer',
          }}
        >
          <span>+ ADD A GOAL</span>
          {addOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {/* ── Expanded goal picker ── */}
      {addOpen && canAdd && (
        <div
          style={{
            border: `2px solid ${INK}`,
            borderTop: 'none',
            padding: '20px 18px 24px',
          }}
        >
          {THEMES.map((theme, ti) => {
            // Skip themes where every goal is already added
            const available = theme.goals.filter(g => !addedIds.has(g.id))
            const allAdded  = available.length === 0

            return (
              <div
                key={theme.id}
                style={{ marginBottom: ti < THEMES.length - 1 ? 28 : 0, opacity: allAdded ? 0.5 : 1 }}
              >
                {/* Theme label */}
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: '0.62rem',
                    letterSpacing: '0.12em',
                    color: INK,
                    opacity: 0.55,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{theme.emoji}</span>
                  <span>{theme.label.toUpperCase()}</span>
                </div>

                {/* Goal rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {theme.goals.map(g => (
                    <PickerGoalRow
                      key={g.id}
                      goal={g}
                      added={addedIds.has(g.id)}
                      onAdd={handleAdd}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
