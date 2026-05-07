/**
 * ShareModal.jsx — Streak share card generator
 *
 * A modal overlay that lets users download a branded PNG share card for
 * any habit with a streak ≥ 3 days. Two tones are available:
 *
 *   BRAG       — Hot-orange card with large streak number and habit name.
 *                Caption: "🔥 {n}-day streak on '{habit}' — tracked with RegularMonk"
 *
 *   SELF-SHAME — Ink-black card calling out the user for slipping on a habit,
 *                designed to be sent to friends as an accountability nudge.
 *
 * Image export uses html2canvas to rasterise the live DOM card node at 2×
 * scale, then triggers a blob download. If canvas export fails (e.g. CORS on
 * web fonts), it falls back to copying the caption text to the clipboard.
 *
 * The modal locks body scroll while open and closes on Escape or backdrop click.
 */

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import html2canvas from 'html2canvas'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'
const MONO  = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

// ── Preview cards ─────────────────────────────────────────────────────────────

function BragCard({ goal, streak }) {
  return (
    <div
      style={{
        background: HOT,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '1.05rem',
          color: CREAM,
          opacity: 0.8,
          lineHeight: 1,
          marginBottom: 20,
        }}
      >
        RegularMonk
      </span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>🔥</span>
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '5rem',
            color: CREAM,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {streak}
        </span>
      </div>

      <span
        style={{
          fontFamily: MONO,
          fontSize: '0.65rem',
          color: CREAM,
          letterSpacing: '0.14em',
          opacity: 0.85,
          marginTop: 6,
        }}
      >
        DAY STREAK
      </span>

      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: '1px solid rgba(243,237,226,0.3)',
          fontFamily: SERIF,
          fontSize: '1.05rem',
          color: CREAM,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>{goal.emoji}</span>
        <span>{goal.title}</span>
      </div>
    </div>
  )
}

function ShameCard({ goal, user }) {
  return (
    <div
      style={{
        background: INK,
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: 20 }}>👀</span>

      <p
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '1.35rem',
          color: CREAM,
          lineHeight: 1.3,
          margin: '0 0 22px',
        }}
      >
        {user} is slipping<br />on {goal.emoji} {goal.title}
      </p>

      <span
        style={{
          fontFamily: MONO,
          fontSize: '0.58rem',
          color: HOT,
          letterSpacing: '0.14em',
        }}
      >
        HOLD THEM ACCOUNTABLE
      </span>
    </div>
  )
}

// ── ShareModal ────────────────────────────────────────────────────────────────

export default function ShareModal({ goal, streak, user, onClose }) {
  const [tone,   setTone]   = useState('brag') // 'brag' | 'shame'
  const [status, setStatus] = useState('idle') // 'idle' | 'working' | 'done'
  const cardRef = useRef(null)

  const bragCaption  = `🔥 ${streak}-day streak on "${goal.title}" — tracked with RegularMonk`
  const shameCaption = `👀 ${user} needs help with "${goal.title}" — remind them today`
  const caption      = tone === 'brag' ? bragCaption : shameCaption

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape to close
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleAction() {
    if (status === 'working') return
    setStatus('working')
    let downloaded = false
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      })
      await new Promise(resolve => {
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob)
          const a   = document.createElement('a')
          a.href     = url
          a.download = `monk-${tone}-${goal.id}.png`
          a.click()
          URL.revokeObjectURL(url)
          downloaded = true
          resolve()
        })
      })
    } catch {
      // Fallback: copy caption to clipboard
    }
    if (!downloaded) {
      try { await navigator.clipboard.writeText(caption) } catch {}
    }
    setStatus('done')
    setTimeout(() => setStatus('idle'), 2000)
  }

  const btnLabel =
    status === 'working' ? 'WORKING…' :
    status === 'done'    ? '✓ DONE'   :
    'DOWNLOAD IMAGE'

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,22,20,0.75)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: CREAM,
          border: `2px solid ${INK}`,
          boxShadow: `6px 6px 0 ${INK}`,
          width: '100%',
          maxWidth: 360,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 16px',
            borderBottom: `2px solid ${INK}`,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: HOT,
            }}
          >
            SHARE STREAK
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: INK,
              opacity: 0.45,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Tone toggle ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: `2px solid ${INK}`,
          }}
        >
          {[['brag', 'BRAG'], ['shame', 'SELF-SHAME']].map(([t, label], i) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              style={{
                border: 'none',
                borderRight: i === 0 ? `2px solid ${INK}` : 'none',
                background: tone === t ? INK : CREAM,
                color: tone === t ? CREAM : INK,
                fontFamily: MONO,
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                padding: '11px 8px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Preview card ── */}
        <div style={{ padding: 20, paddingBottom: 14 }}>
          <div ref={cardRef}>
            {tone === 'brag'
              ? <BragCard  goal={goal} streak={streak} />
              : <ShameCard goal={goal} user={user}     />
            }
          </div>
        </div>

        {/* ── Caption ── */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: '0.6rem',
              color: INK,
              opacity: 0.5,
              lineHeight: 1.6,
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            {caption}
          </p>
        </div>

        {/* ── Action button ── */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={handleAction}
            disabled={status === 'working'}
            style={{
              width: '100%',
              border: `2px solid ${status === 'done' ? INK : HOT}`,
              boxShadow: status === 'done' ? 'none' : `3px 3px 0 ${HOT}`,
              background: status === 'done' ? INK : HOT,
              color: CREAM,
              fontFamily: MONO,
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              padding: '13px 16px',
              cursor: status === 'working' ? 'wait' : 'pointer',
              opacity: status === 'working' ? 0.7 : 1,
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
