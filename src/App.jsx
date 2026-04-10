import { useState } from 'react'
import { getItem } from './lib/storage.js'
import Onboard from './components/Onboard.jsx'
import Today from './components/Today.jsx'

function isOnboarded() {
  return Boolean(getItem('user') && getItem('goals')?.length)
}

export default function App() {
  const [ready, setReady] = useState(isOnboarded)

  if (!ready) {
    return <Onboard onComplete={() => setReady(true)} />
  }

  return <Today />
}
