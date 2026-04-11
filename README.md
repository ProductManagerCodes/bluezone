# RegularMonk — Habit Journal

A minimal daily habit tracker with streak tracking, social sharing, and group challenges. Built with an editorial/brutalist aesthetic: cream paper, ink-black borders, one hot-orange accent.

## What it does

- **Onboarding** — pick a name and choose up to 5 habits from curated themes (Health, Mind, Craft, Life)
- **Today screen** — log progress toward each habit's daily target; see live streaks; smart nudges suggest raising or lowering targets based on your last 7 days
- **Goals tab** — add or remove habits at any time (up to 5)
- **Friends tab** — leaderboard sorted by total streak across all habits; group challenges with join support
- **Share streak** — generate a Brag or Self-shame card and download it as a PNG

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app stores all data in `localStorage` — no account needed.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 (JSX, no TypeScript) |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 + inline styles |
| Icons | lucide-react |
| Fonts | Fraunces (variable serif) + JetBrains Mono via Google Fonts |
| Image export | html2canvas |
| Persistence | localStorage (private) + `shared:` prefix (simulated cross-user) |

## Roadmap

These features are **not yet built**:

- **Real backend** — currently all data lives in the browser. A proper API (e.g. Supabase, Firebase, or a custom server) would enable real accounts, cross-device sync, and persistent history.
- **Push notifications** — nudge users to log habits before the day ends. Requires a service worker and a notification service.
- **Mobile app** — the web app is responsive but not installable. A React Native port would provide native feel, offline support, and home-screen presence.
- **Joining other people's challenges** — challenges can be created and seen by anyone on the same browser, but real cross-user joining requires a shared backend.
- **Image export reliability** — the PNG download via html2canvas works for most cards, but web fonts sometimes fall back to system fonts inside the canvas. A server-side rendering approach (e.g. Satori or a headless browser) would produce consistent results.
