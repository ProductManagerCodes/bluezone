# RegularMonk — Daily Habit Journal

> A minimalist habit tracker with streak mechanics, AI coaching, and social challenges.
> Built with an editorial/brutalist aesthetic: cream paper, ink-black borders, one hot-orange accent.

---

## Features

### Core tracking
- **Onboarding wizard** — pick a name, then choose up to 5 habits from 18 curated options across 4 life areas (Health, Mind, Craft, Life), or describe your goals to the AI and let it suggest habits for you
- **Two habit types** — *positive* habits track progress toward a daily target (steps, minutes, glasses); *avoid* habits track resistance to bad behaviour with a binary KEPT IT / BROKE IT UI
- **Streak engine** — counts consecutive completed days; tolerates a same-day grace window so checking in late doesn't break your streak
- **Streak shield** — one forgiveness token per habit: if you miss exactly one day the app offers to retroactively heal it and preserve the streak
- **Smart nudges** — after 7 days of data the app suggests raising your target (consistently crushing it) or lowering it (consistently missing), with one tap to accept

### AI coaching  *(requires free Groq API key)*
- **Streak facts** — once a streak hits 3+ days, an LLM-generated habit-science stat appears below the progress bar, cached per habit+streak so it's only fetched once
- **Habit suggester** — during onboarding, describe what you want to improve in plain English and the model picks the 3 best-matching habits from the library

### Social
- **Leaderboard** — ranks all users by total streak across all habits; your row is highlighted; refresh any time
- **Group challenges** — create a named challenge tied to one of your habits, set a 3–90 day duration, share with others who can join with one tap
- **Share cards** — generate a downloadable PNG brag card (hot-orange, big streak number) or a self-shame card (ink-black, accountability nudge) via html2canvas

### Auth  *(optional — app works without it)*
- Firebase Authentication with email/password and Facebook OAuth
- Each signed-in user's data is namespaced under `u:{uid}:` in localStorage so multiple accounts on the same device never collide
- Designed for a Firestore migration path: swap the internals of `src/lib/db.js` without touching any component

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 (JSX, no TypeScript) |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 + inline styles |
| Icons | lucide-react |
| Fonts | Fraunces (variable serif) + JetBrains Mono via Google Fonts |
| Image export | html2canvas |
| Auth | Firebase Authentication (email/password + Facebook OAuth) |
| AI | Groq API — llama-3.3-70b-versatile |
| Persistence | localStorage (private) + `shared:` prefix (simulated cross-user) |

---

## Project structure

```
src/
├── App.jsx                  # Root shell: auth lifecycle, goal state, nav chrome
├── main.jsx                 # React entry point + SVG grain overlay
├── index.css                # Global resets + slider / animation styles
│
├── components/
│   ├── Onboard.jsx          # 4-phase first-run wizard
│   ├── Today.jsx            # Daily tracking screen (GoalCard, ShieldBanner, NudgeBanner)
│   ├── Picker.jsx           # Goals tab: add / remove / toggle avoid
│   ├── Friends.jsx          # Social tab: leaderboard + challenges
│   ├── NewChallenge.jsx     # Challenge creation sub-screen
│   ├── AuthScreen.jsx       # Sign-in / create account UI
│   └── ShareModal.jsx       # Streak share card + PNG download
│
├── data/
│   └── themes.js            # 18 curated habits in 4 theme groups
│
└── lib/
    ├── storage.js           # Raw localStorage wrapper (JSON, never throws)
    ├── db.js                # User-scoped storage: prefixes keys with u:{uid}:
    ├── sharedStorage.js     # Shared namespace (shared:) for leaderboard/challenges
    ├── firebase.js          # Conditional Firebase init (no-op when .env absent)
    ├── auth.js              # Firebase Auth helpers (signIn, signUp, Facebook, logout)
    ├── llm.js               # Groq/LLAMA chat wrapper (no-op when key absent)
    ├── streaks.js           # computeStreak + suggestAdjustment algorithms
    └── dates.js             # todayKey, daysBetween, offsetDay utilities
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/productmanagercodes/bluezone.git
cd bluezone
npm install
npm run dev        # http://localhost:5173
```

### 2. Configure environment variables  *(both optional)*

```bash
cp .env.example .env
```

```env
# Firebase — enables real accounts (email + Facebook login)
# Leave blank to run in anonymous localStorage-only mode
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Groq — enables AI streak facts + habit suggestions
# Free key at https://console.groq.com  (14 400 req/day)
VITE_GROQ_API_KEY=
```

Both integrations are fully optional. Without them the app runs in a zero-config anonymous mode with all core tracking features intact.

### 3. Firebase setup (if you want real accounts)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. **Security → Authentication → Get started** → enable **Email/Password**
3. Optionally enable **Facebook**: create a Facebook App at [developers.facebook.com](https://developers.facebook.com), add the Facebook Login product, paste the App ID + Secret into Firebase, and copy the OAuth redirect URI back into Facebook
4. **Gear → Project settings → Your apps → `</>` Web** → register the app → copy the `firebaseConfig` values into `.env`

---

## Architecture notes

### Graceful degradation

Every external dependency is optional. `firebase.js` checks for env vars before initialising; `llm.js` checks for the Groq key. Both export a `*Enabled` boolean that components use to show or hide features. The app is fully functional with an empty `.env`.

### Storage layers

```
Components
    │
    ├── db.js ─── u:{uid}:{key} ──▶ storage.js ──▶ localStorage
    │                                                    │
    └── sharedStorage.js ─── shared:{key} ───────────────┘
```

`db.js` is a drop-in replacement for `storage.js` that prefixes every key with the signed-in user's Firebase UID. Swapping its internals to Firestore would give real cross-device sync without changing any component.

### Streak algorithm (`src/lib/streaks.js`)

`computeStreak` walks backwards from today (or yesterday, if today isn't completed yet), counting consecutive `done: true` history entries. A shielded entry (`shielded: true`) is treated identically to a real completion, so the streak shield is transparent to the algorithm.

`suggestAdjustment` looks at the last 7 days: if ≥70% of days hit ≥120% of target it suggests an upgrade; if <40% of days were marked done it suggests a downgrade.

### AI caching

Streak facts are cached in localStorage under `llm_fact_{goalId}_{streak}`. The key includes the streak count so a new fact is generated at each milestone, but the same milestone is never re-fetched.

---

## Design system

All UI is built with a consistent set of brand tokens defined at the top of each file:

| Token | Value | Usage |
|---|---|---|
| `CREAM` | `#f3ede2` | Page background, inverted text |
| `INK` | `#1a1614` | Primary text, borders, box-shadows |
| `HOT` | `#dc4628` | Accent colour, CTAs, streak highlights |
| `MONO` | JetBrains Mono | Labels, stats, button text |
| `SERIF` | Fraunces | Headings, names, large display text |

The paper-grain texture in `main.jsx` is a pure SVG `feTurbulence` filter at 4.5% opacity — no image assets required.

---

## Roadmap

| Feature | Status |
|---|---|
| Core habit tracking + streak engine | ✅ Done |
| Smart nudges (auto target adjustment) | ✅ Done |
| Avoid habits + streak shield | ✅ Done |
| Share cards (PNG export via html2canvas) | ✅ Done |
| Firebase auth (email + Facebook OAuth) | ✅ Done |
| AI coaching (Groq / LLAMA 3.3) | ✅ Done |
| Firestore migration (cross-device sync) | 🔲 Planned |
| Real-time friend challenges | 🔲 Planned (needs Firestore) |
| Accountability partner (read-only share link) | 🔲 Planned |
| Push notifications (service worker) | 🔲 Planned |
| Apple Health / wearable auto-complete | 🔲 Planned |
| React Native mobile app | 🔲 Planned |
