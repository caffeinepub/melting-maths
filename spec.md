# Melting Maths

## Current State
- Backend has `trackVisit()` and `getTotalVisits()` -- but visits are tracked via frontend localStorage offset (230), not fully backend-synced
- No concept of "active users now" anywhere in the app
- Home screen shows a Total Visits card reading from backend
- PublicAnalyticsScreen shows total visits + leaderboard but no active users

## Requested Changes (Diff)

### Add
- `heartbeat(name: Text) : async ()` backend method -- called every 30s by each connected client, storing a timestamp keyed by name
- `getActiveUsers() : async Nat` backend query -- returns count of principals whose heartbeat was within the last 60 seconds
- `useActiveUsers` React hook -- polls `getActiveUsers()` every 15s
- `useHeartbeat` React hook -- fires `heartbeat()` every 30s while app is open
- Live "🟢 X online now" pill badge on HomeScreen (below Total Visits card)
- "Active Now" card on PublicAnalyticsScreen (alongside Total Visits, Players, XP, Grade stats)

### Modify
- `useTotalVisits` hook -- stop calling `trackVisit()` on every query; instead call it once via a dedicated mutation on app load (to avoid double-counting on refetch)
- `usePublicStats` hook -- remove manual `trackVisit()` call (now handled by App.tsx single call)
- `PublicStats` backend type -- add `activeUsers: Nat` field
- `getPublicStats()` backend method -- include activeUsers count in response
- Home screen Total Visits card -- also show active users pill below it

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend:
   - Add `heartbeats` Map<Text, Time.Time> to track last-seen per named user
   - Add `heartbeat(name)` update method -- upserts timestamp
   - Add `getActiveUsers()` query -- count entries where `Time.now() - last < 60_000_000_000` (60s in nanoseconds)
   - Add `activeUsers` to `PublicStats` type and `getPublicStats()` return
2. Update `backend.d.ts` bindings to include new methods
3. Add `useHeartbeat(name)` hook -- calls `actor.heartbeat(name)` every 30s
4. Add `useActiveUsers()` hook -- polls `actor.getActiveUsers()` every 15s
5. Update `useTotalVisits` -- call `trackVisit` only once on mount, not inside queryFn
6. Update `usePublicStats` -- remove duplicate `trackVisit` call
7. Update HomeScreen -- render "🟢 X online now" pill below Total Visits card
8. Update PublicAnalyticsScreen -- add Active Now stat card in the 2x2 grid (making it 2x3 or wrap to include it)
9. Wire `useHeartbeat` in App.tsx once profile is loaded
