# Melting Maths

## Current State
The Public Analytics / Live Stats page shows total visits, top players, leaderboard, and grade distribution. Data is not showing correctly:
- Leaderboard is empty or shows only 1 player
- Visit count may be stale
- Real-time refresh may not update

Root cause identified: All users access the app anonymously (no Internet Identity login), so every user shares the **same anonymous Principal** (`2vxsx-fae`). The backend stores `playerProfiles` keyed by Principal, meaning every new `createOrUpdateProfile` call **overwrites** the same entry. The leaderboard will never have more than 1 entry.

## Requested Changes (Diff)

### Add
- Backend: new `leaderboardEntries` storage (a `List` of `LeaderboardEntry`) separate from `playerProfiles`, keyed by name+grade string to allow multiple unique players
- Backend: `submitLeaderboardEntry(name, grade, xp, streakDays, badgeCount)` -- upserts by name key
- Backend: `getPublicStats()` -- returns visits + leaderboard in one call to reduce latency
- Frontend: `usePublicStats` hook calls `trackVisit` + `getPublicStats` in a single refresh cycle
- Frontend: Public Analytics page shows loading skeletons and error fallbacks

### Modify
- Backend: `getTopLeaderboardEntries` now reads from the new `leaderboardEntries` list instead of `playerProfiles`
- Backend: `getAllStudentProfiles` reads from `leaderboardEntries` instead of `playerProfiles`
- Frontend: `useQueries.ts` -- `usePublicStats` calls `trackVisit()` to ensure visit count increments on every page view; also adds `submitLeaderboardEntry` mutation
- Frontend: `App.tsx` -- on `handleOnboardingComplete`, also call `submitLeaderboardEntry` with the player's local XP/badges/streak
- Frontend: `GameScreen` -- after game session recorded, also call `submitLeaderboardEntry` with updated profile stats

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`:
   - Add `leaderboardEntries` map keyed by `Text` (name as key)
   - Add `submitLeaderboardEntry` shared func that upserts by name
   - Update `getTopLeaderboardEntries` to read from `leaderboardEntries`
   - Update `getAllStudentProfiles` to read from `leaderboardEntries`
2. Regenerate `backend.d.ts` to include new function
3. Update `useQueries.ts`:
   - `usePublicStats`: call `trackVisit()` before reading visits; use `refetchOnWindowFocus: true`
   - Add `useSubmitLeaderboardEntry` mutation
4. Update `App.tsx`: call `submitLeaderboardEntry` on onboarding complete and after profile updates
5. Validate and deploy
