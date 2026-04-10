import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Trophy, Users } from 'lucide-react'
import { listKeys, getItem, setItem } from '../lib/sharedStorage.js'
import { todayKey } from '../lib/dates.js'
import NewChallenge from './NewChallenge.jsx'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysRemaining(endDate) {
  const today = todayKey()
  if (endDate <= today) return 0
  const ms = new Date(endDate + 'T00:00:00') - new Date(today + 'T00:00:00')
  return Math.round(ms / 86400000)
}

// ── LeaderboardRow ────────────────────────────────────────────────────────────

function LeaderboardRow({ rank, entry, isMe }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: isMe ? '#fdeee9' : CREAM,
        borderBottom: `1px solid ${INK}`,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: '0.62rem',
          color: rank <= 3 ? HOT : INK,
          opacity: rank <= 3 ? 1 : 0.4,
          width: 18,
          flexShrink: 0,
          letterSpacing: '0.04em',
        }}
      >
        #{rank}
      </span>

      <span
        style={{
          flex: 1,
          fontFamily: SERIF,
          fontSize: '0.95rem',
          fontWeight: isMe ? 700 : 400,
          color: INK,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.name}
        {isMe && <span style={{ fontFamily: MONO, fontSize: '0.52rem', color: HOT, letterSpacing: '0.08em', marginLeft: 6 }}>YOU</span>}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: '0.75rem' }}>🔥</span>
        <span style={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>
          {entry.totalStreak}
        </span>
      </span>

      <span
        style={{
          fontFamily: MONO,
          fontSize: '0.58rem',
          color: INK,
          opacity: 0.45,
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}
      >
        {entry.todayDone}/{entry.goalCount} today
      </span>
    </div>
  )
}

// ── ChallengeRow ──────────────────────────────────────────────────────────────

function ChallengeRow({ challenge, userId, onJoin }) {
  const joined  = challenge.participants.includes(userId)
  const days    = daysRemaining(challenge.endDate)
  const expired = days === 0

  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${INK}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: expired ? 0.4 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: '1rem',
            fontWeight: 600,
            color: INK,
            lineHeight: 1.2,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {challenge.title}
        </div>
        <div style={{ fontFamily: MONO, fontSize: '0.58rem', color: INK, opacity: 0.45, letterSpacing: '0.03em' }}>
          by {challenge.creatorName}
          {' · '}
          {expired ? 'ended' : `${days}d left`}
          {' · '}
          <Users size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
          {challenge.participants.length}
        </div>
      </div>

      {!expired && (
        <button
          onClick={() => !joined && onJoin(challenge)}
          disabled={joined}
          style={{
            flexShrink: 0,
            border: `2px solid ${joined ? '#bdb5ac' : INK}`,
            boxShadow: joined ? 'none' : `2px 2px 0 ${INK}`,
            background: joined ? '#ede7dc' : CREAM,
            color: joined ? '#9e968e' : INK,
            fontFamily: MONO,
            fontSize: '0.6rem',
            letterSpacing: '0.09em',
            padding: '6px 12px',
            cursor: joined ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {joined ? '✓ JOINED' : 'JOIN'}
        </button>
      )}
    </div>
  )
}

// ── Friends ───────────────────────────────────────────────────────────────────

export default function Friends({ goals, userId, userName }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [challenges,  setChallenges]  = useState([])
  const [showNew,     setShowNew]     = useState(false)

  const loadLeaderboard = useCallback(() => {
    const keys    = listKeys('leaderboard:')
    const entries = keys.map(k => getItem(k)).filter(Boolean)
    entries.sort((a, b) => b.totalStreak - a.totalStreak)
    setLeaderboard(entries)
  }, [])

  const loadChallenges = useCallback(() => {
    const today  = todayKey()
    const keys   = listKeys('challenge:')
    const items  = keys.map(k => getItem(k)).filter(Boolean)
    const active = items.filter(c => c.endDate >= today)
    active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setChallenges(active)
  }, [])

  useEffect(() => {
    loadLeaderboard()
    loadChallenges()
  }, [loadLeaderboard, loadChallenges])

  function handleJoin(challenge) {
    if (challenge.participants.includes(userId)) return
    const updated = { ...challenge, participants: [...challenge.participants, userId] }
    setItem(`challenge:${challenge.id}`, updated)
    setChallenges(prev => prev.map(c => c.id === challenge.id ? updated : c))
  }

  function handleNewBack() {
    setShowNew(false)
    loadChallenges()
  }

  if (showNew) {
    return <NewChallenge goals={goals} userId={userId} userName={userName} onBack={handleNewBack} />
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* ── Leaderboard ── */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={13} color={HOT} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: '0.68rem',
                color: HOT,
                letterSpacing: '0.12em',
              }}
            >
              LEADERBOARD
            </span>
          </div>

          <button
            onClick={loadLeaderboard}
            aria-label="Refresh leaderboard"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: INK,
              opacity: 0.4,
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <p
            style={{
              fontFamily: MONO,
              fontSize: '0.7rem',
              color: INK,
              opacity: 0.35,
              letterSpacing: '0.03em',
            }}
          >
            No one on the board yet.
          </p>
        ) : (
          <div style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
            {leaderboard.map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                rank={i + 1}
                entry={entry}
                isMe={entry.userId === userId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Challenges ── */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: '0.68rem',
              color: HOT,
              letterSpacing: '0.12em',
            }}
          >
            CHALLENGES
          </span>

          <button
            onClick={() => setShowNew(true)}
            style={{
              border: `2px solid ${INK}`,
              boxShadow: `2px 2px 0 ${INK}`,
              background: CREAM,
              color: INK,
              fontFamily: MONO,
              fontSize: '0.6rem',
              letterSpacing: '0.09em',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            + NEW
          </button>
        </div>

        {challenges.length === 0 ? (
          <p
            style={{
              fontFamily: MONO,
              fontSize: '0.7rem',
              color: INK,
              opacity: 0.35,
              letterSpacing: '0.03em',
            }}
          >
            No active challenges yet.
          </p>
        ) : (
          <div style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
            {challenges.map(c => (
              <ChallengeRow
                key={c.id}
                challenge={c}
                userId={userId}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
