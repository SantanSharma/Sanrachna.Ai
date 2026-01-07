# Anti-Goal

A reverse psychology goal tracking app that helps users take the right actions by showing how they are likely to fail.

## Philosophy

- **No motivation** - This app will not motivate you
- **No gamification** - No rewards, badges, or streaks
- **Mirror, not coach** - Shows you your patterns, not advice

## Features

### 1. Goal Setup
- Enter a single goal statement
- Select goal type (Health, Study, Work, Habit)
- Choose duration (7, 14, or 30 days)

### 2. Anti-Goal Dashboard
- View your goal and current day
- See "Most Likely Failure Path" predictions
- "Don't Do This" behavior warnings
- Daily check-in: Did you act toward your goal?
- Track excuses with usage count

### 3. Failure Timeline
- Chronological record of all days
- Planned vs actual actions
- Excuse patterns and frequency
- Predicted quit day based on behavior

## Tech Stack

- Angular 18
- Tailwind CSS
- TypeScript (strict mode)
- localStorage for persistence

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4203`

## Data Storage

All data is stored in localStorage:
- `antigoal_goal` - Current goal
- `antigoal_daily_actions` - Daily check-ins
- `antigoal_excuse_logs` - Excuse usage tracking

## Design Principles

- Calm, serious, slightly uncomfortable
- Grey, muted red, off-white colors
- No animations or celebratory effects
- Minimal, readable typography
