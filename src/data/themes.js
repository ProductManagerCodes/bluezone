/**
 * themes.js — Curated habit library
 *
 * Defines the 18 built-in habits grouped into 4 life areas.
 * Each goal object is immutable template data — when a user selects a goal
 * it is cloned into their personal goals array (stored via db.js) so
 * per-user fields like `target`, `avoid`, and `shieldUsed` can be patched
 * without affecting the shared template.
 *
 * To add a new habit: append to the relevant theme's `goals` array.
 * Keep `id` values lowercase, hyphen-free, and globally unique.
 *
 * POPULAR lists the 6 habit IDs shown on the "Popular" fast-pick path
 * in the onboarding flow.
 */

export const THEMES = [
  {
    id: 'health',
    label: 'Health & Body',
    emoji: '🏃',
    goals: [
      { id: 'walk',       emoji: '🚶', title: 'Daily walk',        unit: 'steps',   target: 8000 },
      { id: 'water',      emoji: '💧', title: 'Drink water',       unit: 'glasses', target: 8    },
      { id: 'workout',    emoji: '💪', title: 'Work out',          unit: 'minutes', target: 30   },
      { id: 'sleep',      emoji: '😴', title: 'Sleep',             unit: 'hours',   target: 8    },
      { id: 'stretch',    emoji: '🧘', title: 'Stretch / mobility', unit: 'minutes', target: 10  },
    ],
  },
  {
    id: 'mind',
    label: 'Mind & Focus',
    emoji: '🧠',
    goals: [
      { id: 'meditate',   emoji: '🪷', title: 'Meditate',            unit: 'minutes', target: 10 },
      { id: 'read',       emoji: '📚', title: 'Read',                unit: 'minutes', target: 20 },
      { id: 'journal',    emoji: '✍️', title: 'Journal',             unit: 'minutes', target: 10 },
      { id: 'nophone',    emoji: '📵', title: 'No phone first hour', unit: 'days',    target: 1  },
    ],
  },
  {
    id: 'craft',
    label: 'Craft & Work',
    emoji: '🛠',
    goals: [
      { id: 'deepwork',   emoji: '🎯', title: 'Deep work',           unit: 'minutes', target: 90 },
      { id: 'code',       emoji: '💻', title: 'Code / build',        unit: 'minutes', target: 60 },
      { id: 'learn',      emoji: '📖', title: 'Learn something new', unit: 'minutes', target: 20 },
      { id: 'create',     emoji: '🎨', title: 'Create / make',       unit: 'minutes', target: 30 },
    ],
  },
  {
    id: 'life',
    label: 'Life & People',
    emoji: '🌿',
    goals: [
      { id: 'outside',    emoji: '🌤', title: 'Go outside',           unit: 'minutes', target: 20 },
      { id: 'connect',    emoji: '🤝', title: 'Connect with someone', unit: 'times',   target: 1  },
      { id: 'gratitude',  emoji: '🙏', title: 'Gratitude practice',  unit: 'minutes', target: 5  },
      { id: 'noalcohol',  emoji: '🚫', title: 'No alcohol',           unit: 'days',    target: 1  },
      { id: 'cook',       emoji: '🍳', title: 'Cook a meal',          unit: 'times',   target: 1  },
    ],
  },
]

export const POPULAR = ['walk', 'water', 'meditate', 'read', 'deepwork', 'outside']
