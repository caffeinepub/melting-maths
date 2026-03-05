# Melting Maths

## Current State
Fully built math gaming app with 36 games across grades 1-12, Shinchen AI tutor, XP/badge system, streaks, local leaderboard, weekly challenges, teacher dashboard, profile settings (sound, theme, avatar, reset), combo multiplier, time attack mode, mistake replay, grade certificates, and animated slideshow on every load.

Analytics data is partially tracked in localStorage (games_played, accuracy, play_counts, completed_games) but there is no dedicated Analytics screen or dashboard for the student to view their own detailed progress over time.

## Requested Changes (Diff)

### Add
- **Analytics screen** (`AnalyticsScreen.tsx`) accessible from the Home screen via a new "Analytics" button in the utility grid
- **Analytics data tracking** (session-level tracking already partially exists; extend to record per-game scores, time-played per session, daily activity log for heatmap)
- The analytics screen should include:
  - **Overview cards**: Total XP, games played, accuracy %, current streak, total time played (estimated from sessions)
  - **XP over time chart**: Simple bar/line chart showing XP earned per day over the last 7 days
  - **Accuracy by game category**: Bar chart showing accuracy % per grade group (1-3, 4-5, 6-8, 9-10, 11-12)
  - **Activity heatmap**: A 7-day row showing which days the student played (filled = played, empty = missed)
  - **Top games**: List of top 3 most-played games with play counts
  - **Per-game stats table**: Scrollable list of every game played with score and last played date
  - **Weak vs strong topics**: Visual comparison panel
- Navigation: Add "Analytics" to the Home screen utility grid (4th item, replacing the 3-column layout with a 2x2 or scrolling row)
- **App.tsx** route: add `"analytics"` screen type and render `<AnalyticsScreen>`

### Modify
- `HomeScreen.tsx`: Add Analytics button to utility nav grid (expand from 3 to 4 items, use a 2x2 grid layout)
- `App.tsx`: Add `"analytics"` to the `Screen` type and render `<AnalyticsScreen>`
- `GameScreen.tsx`: Record session end time to localStorage for time-played tracking (add `mm_session_log` key with array of `{date, gameId, durationMs, score, correct, total}`)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/screens/AnalyticsScreen.tsx` with all chart and stat components (using CSS/SVG for charts, no external chart library needed)
2. Create `src/utils/analyticsUtils.ts` with helpers to read/write session logs from localStorage and compute chart data
3. Update `GameScreen.tsx` to write session end records to `mm_session_log`
4. Update `HomeScreen.tsx` to add Analytics to the nav grid (4 items in 2x2)
5. Update `App.tsx` to add the `"analytics"` screen type and render it
