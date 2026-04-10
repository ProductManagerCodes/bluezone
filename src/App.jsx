import { useState } from 'react'
import { getItem } from './lib/storage.js'
import Onboard from './components/Onboard.jsx'

const SERIF = "'Fraunces', serif"
const MONO  = "'JetBrains Mono', monospace"
const CREAM = '#f3ede2'
const INK   = '#1a1614'
const HOT   = '#dc4628'

function isOnboarded() {
  return Boolean(getItem('user') && getItem('goals')?.length)
}

export default function App() {
  const [ready, setReady] = useState(isOnboarded)

  if (!ready) {
    return <Onboard onComplete={() => setReady(true)} />
  }

  const user  = getItem('user')
  const goals = getItem('goals')

  return (
    <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: MONO, fontSize: '0.7rem', color: HOT, letterSpacing: '0.12em', marginBottom: 16 }}>
          EMBER / {user?.toUpperCase()}
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: '2.5rem', fontWeight: 700, color: INK, margin: 0 }}>
          Today screen coming soon
        </h1>
        <p style={{ fontFamily: MONO, fontSize: '0.7rem', color: INK, opacity: 0.4, marginTop: 24, letterSpacing: '0.06em' }}>
          {goals?.length} habit{goals?.length !== 1 ? 's' : ''} tracked
        </p>
      </div>
    </div>
  )
}
