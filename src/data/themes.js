export const THEMES = [
  {
    id: 'health',
    label: 'Health & Body',
    emoji: '🏃',
    goals: [
      { id: 'walk',       title: 'Daily walk',        unit: 'steps',   target: 8000 },
      { id: 'water',      title: 'Drink water',        unit: 'glasses', target: 8    },
      { id: 'workout',    title: 'Work out',            unit: 'minutes', target: 30   },
      { id: 'sleep',      title: 'Sleep',               unit: 'hours',   target: 8    },
      { id: 'stretch',    title: 'Stretch / mobility',  unit: 'minutes', target: 10   },
    ],
  },
  {
    id: 'mind',
    label: 'Mind & Focus',
    emoji: '🧠',
    goals: [
      { id: 'meditate',   title: 'Meditate',            unit: 'minutes', target: 10   },
      { id: 'read',       title: 'Read',                unit: 'minutes', target: 20   },
      { id: 'journal',    title: 'Journal',             unit: 'minutes', target: 10   },
      { id: 'nophone',    title: 'No phone first hour', unit: 'days',    target: 1    },
    ],
  },
  {
    id: 'craft',
    label: 'Craft & Work',
    emoji: '🛠',
    goals: [
      { id: 'deepwork',   title: 'Deep work',           unit: 'minutes', target: 90   },
      { id: 'code',       title: 'Code / build',        unit: 'minutes', target: 60   },
      { id: 'learn',      title: 'Learn something new', unit: 'minutes', target: 20   },
      { id: 'create',     title: 'Create / make',       unit: 'minutes', target: 30   },
    ],
  },
  {
    id: 'life',
    label: 'Life & People',
    emoji: '🌿',
    goals: [
      { id: 'outside',    title: 'Go outside',          unit: 'minutes', target: 20   },
      { id: 'connect',    title: 'Connect with someone', unit: 'times',  target: 1    },
      { id: 'gratitude',  title: 'Gratitude practice',  unit: 'minutes', target: 5    },
      { id: 'noalcohol',  title: 'No alcohol',          unit: 'days',    target: 1    },
      { id: 'cook',       title: 'Cook a meal',         unit: 'times',   target: 1    },
    ],
  },
]

export const POPULAR = ['walk', 'water', 'meditate', 'read', 'deepwork', 'outside']
