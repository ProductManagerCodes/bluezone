/**
 * Onboard.jsx — First-run setup wizard
 *
 * A four-phase flow that collects the user's name and up to 5 habits:
 *
 *   Phase 1 — Name: free-text input, stored as 'user' in db.js
 *   Phase 2 — Mode: choose "Popular" (6 pre-selected habits) or "By theme"
 *   Phase 3 — Themes (theme mode only): multi-select life areas to filter by
 *   Phase 4 — Goals: pick up to 5 habits from the filtered list
 *             Optionally use the AI "✦ SUGGEST HABITS FOR ME" feature (Groq)
 *             which accepts a plain-English description and pre-selects
 *             matching habits from the available list.
 *
 * On completion, writes 'user' and 'goals' to db.js and calls onComplete()
 * so App.jsx can transition to the main tab UI.
 */

import { useState } from 'react'
import { THEMES, POPULAR } from '../data/themes.js'
import { setItem } from '../lib/db.js'
import { chat, llmEnabled } from '../lib/llm.js'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'

const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

// ── Derived data (computed once at module load) ───────────────────────────────
const ALL_GOALS = THEMES.flatMap(t =>
  t.goals.map(g => ({ ...g, themeId: t.id, themeEmoji: t.emoji }))
)

const POPULAR_GOALS = POPULAR.map(id => ALL_GOALS.find(g => g.id === id)).filter(Boolean)

function formatTarget({ target, unit }) {
  // Singularize when target is 1 and unit is plural (e.g. "glasses" → "glass")
  if (target === 1 && unit.endsWith('s') && unit !== 'steps') {
    return `${target} ${unit.slice(0, -1)}/day`
  }
  return `${target} ${unit}/day`
}

// ── Shared card style ─────────────────────────────────────────────────────────
function card(selected) {
  return {
    border: `2px solid ${INK}`,
    boxShadow: `4px 4px 0 ${INK}`,
    background: selected ? INK : CREAM,
    color:      selected ? CREAM : INK,
    cursor: 'pointer',
    // reset browser button defaults
    fontFamily: 'inherit',
    textAlign: 'left',
    outline: 'none',
  }
}

// ── Primitives ────────────────────────────────────────────────────────────────

function StepLabel({ children }) {
  return (
    <p style={{
      fontFamily: MONO,
      fontSize: '0.7rem',
      letterSpacing: '0.12em',
      color: HOT,
      marginBottom: 20,
      marginTop: 0,
    }}>
      {children}
    </p>
  )
}

function Heading({ children }) {
  return (
    <h1 style={{
      fontFamily: SERIF,
      fontSize: 'clamp(2rem, 5vw, 2.75rem)',
      lineHeight: 1.05,
      marginTop: 0,
      marginBottom: 40,
      fontWeight: 700,
      color: INK,
    }}>
      {children}
    </h1>
  )
}

function Italic({ children }) {
  // Fraunces italic in a lighter weight reads beautifully against the bold roman
  return (
    <em style={{ fontStyle: 'italic', fontWeight: 300 }}>
      {children}
    </em>
  )
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'block',
        width: '100%',
        marginTop: 32,
        padding: '16px 24px',
        fontFamily: MONO,
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
        background: disabled ? '#bdb5ac' : INK,
        color: CREAM,
        border: `2px solid ${disabled ? '#bdb5ac' : INK}`,
        boxShadow: disabled ? 'none' : `4px 4px 0 ${HOT}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'none',
      }}
    >
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        marginBottom: 36,
        fontFamily: MONO,
        fontSize: '0.72rem',
        letterSpacing: '0.08em',
        color: INK,
        opacity: 0.45,
        cursor: 'pointer',
        display: 'block',
      }}
    >
      ← BACK
    </button>
  )
}

// ── Phase 1: Name ─────────────────────────────────────────────────────────────

function NamePhase({ name, setName, onNext }) {
  return (
    <>
      <StepLabel>01 / YOUR NAME</StepLabel>

      <Heading>
        What should we<br />
        <Italic>call you?</Italic>
      </Heading>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && onNext()}
        placeholder="Your name"
        autoFocus
        style={{
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
          background: 'transparent',
          border: 'none',
          borderBottom: `2px solid ${INK}`,
          fontFamily: SERIF,
          fontSize: '2rem',
          fontWeight: 400,
          color: INK,
          padding: '8px 0 12px',
          outline: 'none',
          caretColor: HOT,
        }}
      />

      <PrimaryBtn disabled={!name.trim()} onClick={onNext}>
        CONTINUE →
      </PrimaryBtn>
    </>
  )
}

// ── Phase 2: Mode ─────────────────────────────────────────────────────────────

function ModePhase({ onBack, onSelect }) {
  const options = [
    {
      mode: 'popular',
      icon: '⚡',
      title: 'Popular',
      desc: 'Jump in with the 6 most-tracked habits.',
    },
    {
      mode: 'themes',
      icon: '🗂',
      title: 'By theme',
      desc: 'Browse habits grouped by area of life.',
    },
  ]

  return (
    <>
      <BackBtn onClick={onBack} />
      <StepLabel>02 / YOUR PATH</StepLabel>

      <Heading>
        How do you want to<br />
        <Italic>find your habits?</Italic>
      </Heading>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {options.map(({ mode, icon, title, desc }) => (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            style={{
              ...card(false),
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontFamily: SERIF, fontSize: '1.2rem', fontWeight: 700, color: INK }}>
              {title}
            </span>
            <span style={{ fontFamily: MONO, fontSize: '0.67rem', lineHeight: 1.55, opacity: 0.6, color: INK }}>
              {desc}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

// ── Phase 3a: Theme picker ────────────────────────────────────────────────────

function ThemeSelectPhase({ selectedThemeIds, onToggle, onBack, onNext }) {
  return (
    <>
      <BackBtn onClick={onBack} />
      <StepLabel>03 / YOUR THEMES</StepLabel>

      <Heading>
        Which areas<br />
        <Italic>interest you?</Italic>
      </Heading>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {THEMES.map(t => {
          const selected = selectedThemeIds.includes(t.id)
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              style={{
                ...card(selected),
                padding: '22px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{t.emoji}</span>
              <span style={{
                fontFamily: SERIF,
                fontSize: '0.95rem',
                fontWeight: 700,
                lineHeight: 1.2,
                color: selected ? CREAM : INK,
              }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>

      <PrimaryBtn disabled={selectedThemeIds.length === 0} onClick={onNext}>
        CONTINUE →
      </PrimaryBtn>
    </>
  )
}

// ── Phase 3b / 4: Goal picker ─────────────────────────────────────────────────

function GoalsPhase({ goals, selectedGoalIds, onToggle, onBack, onComplete }) {
  const count  = selectedGoalIds.length
  const atMax  = count >= 5

  const [showAi,    setShowAi]    = useState(false)
  const [aiPrompt,  setAiPrompt]  = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  async function handleSuggest() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    const habitList = goals.map(g => `${g.id}: ${g.title}`).join(', ')
    const text = await chat([{
      role: 'user',
      content: `Available habits: ${habitList}. User wants: "${aiPrompt.trim()}". Reply with exactly 3 habit IDs from the list (comma-separated, no spaces). Only IDs, nothing else.`,
    }], { maxTokens: 30 })
    if (text) {
      text.split(',').map(s => s.trim()).forEach(id => {
        if (goals.find(g => g.id === id) && !selectedGoalIds.includes(id) && selectedGoalIds.length < 5) {
          onToggle(id)
        }
      })
    }
    setAiLoading(false)
    setShowAi(false)
    setAiPrompt('')
  }

  const stepLabel = count === 0
    ? '— / YOUR HABITS'
    : `${String(count).padStart(2, '0')} / 05 SELECTED`

  return (
    <>
      <BackBtn onClick={onBack} />
      <StepLabel>{stepLabel}</StepLabel>

      <Heading>
        Pick up to<br />
        <Italic>5 habits.</Italic>
      </Heading>

      {llmEnabled && (
        <div style={{ marginBottom: 20 }}>
          {!showAi ? (
            <button
              onClick={() => setShowAi(true)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: MONO,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: HOT,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ✦ SUGGEST HABITS FOR ME
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                autoFocus
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSuggest()}
                placeholder="e.g. sleep better, stress less…"
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${INK}`,
                  fontFamily: SERIF,
                  fontSize: '1rem',
                  color: INK,
                  padding: '4px 0',
                  outline: 'none',
                  caretColor: HOT,
                }}
              />
              <button
                onClick={handleSuggest}
                disabled={aiLoading || !aiPrompt.trim()}
                style={{
                  background: INK,
                  color: CREAM,
                  border: 'none',
                  fontFamily: MONO,
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  padding: '6px 12px',
                  cursor: aiLoading ? 'wait' : 'pointer',
                  flexShrink: 0,
                }}
              >
                {aiLoading ? '...' : 'GO →'}
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.map(goal => {
          const selected = selectedGoalIds.includes(goal.id)
          const dimmed   = atMax && !selected

          return (
            <button
              key={goal.id}
              onClick={() => !dimmed && onToggle(goal.id)}
              style={{
                ...card(selected),
                padding: '13px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: dimmed ? 0.35 : 1,
                cursor: dimmed ? 'default' : 'pointer',
              }}
            >
              <span style={{ fontSize: '1.3rem', flexShrink: 0, lineHeight: 1 }}>
                {goal.emoji}
              </span>

              <span style={{
                flex: 1,
                fontFamily: SERIF,
                fontSize: '1rem',
                fontWeight: 600,
                color: selected ? CREAM : INK,
              }}>
                {goal.title}
              </span>

              <span style={{
                fontFamily: MONO,
                fontSize: '0.62rem',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                color: selected ? CREAM : INK,
                opacity: 0.6,
              }}>
                {formatTarget(goal)}
              </span>
            </button>
          )
        })}
      </div>

      <PrimaryBtn disabled={count === 0} onClick={onComplete}>
        START REGULARMONK →
      </PrimaryBtn>
    </>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function Onboard({ onComplete }) {
  const [phase, setPhase] = useState('name')   // 'name' | 'mode' | 'theme-select' | 'goals'
  const [name, setName] = useState('')
  const [mode, setMode] = useState(null)        // 'popular' | 'themes'
  const [selectedThemeIds, setSelectedThemeIds] = useState([])
  const [selectedGoalIds, setSelectedGoalIds] = useState([])

  function toggleTheme(id) {
    setSelectedThemeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleGoal(id) {
    setSelectedGoalIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleModeSelect(m) {
    setMode(m)
    setPhase(m === 'popular' ? 'goals' : 'theme-select')
  }

  function handleComplete() {
    setItem('user', name.trim())
    setItem('goals', selectedGoalIds.map(id => {
      const g = ALL_GOALS.find(x => x.id === id)
      return { id: g.id, emoji: g.emoji, title: g.title, unit: g.unit, target: g.target }
    }))
    onComplete()
  }

  const goalsToShow = mode === 'popular'
    ? POPULAR_GOALS
    : ALL_GOALS.filter(g => selectedThemeIds.includes(g.themeId))

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px 120px' }}>

        {/* Brand mark */}
        <div style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: HOT,
          marginBottom: 52,
          letterSpacing: '0.02em',
        }}>
          RegularMonk
        </div>

        {phase === 'name' && (
          <NamePhase
            name={name}
            setName={setName}
            onNext={() => setPhase('mode')}
          />
        )}

        {phase === 'mode' && (
          <ModePhase
            onBack={() => setPhase('name')}
            onSelect={handleModeSelect}
          />
        )}

        {phase === 'theme-select' && (
          <ThemeSelectPhase
            selectedThemeIds={selectedThemeIds}
            onToggle={toggleTheme}
            onBack={() => setPhase('mode')}
            onNext={() => setPhase('goals')}
          />
        )}

        {phase === 'goals' && (
          <GoalsPhase
            goals={goalsToShow}
            selectedGoalIds={selectedGoalIds}
            onToggle={toggleGoal}
            onBack={() => setPhase(mode === 'popular' ? 'mode' : 'theme-select')}
            onComplete={handleComplete}
          />
        )}

      </div>
    </div>
  )
}
