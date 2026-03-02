# Melting Maths – Version 2

## Current State

Version 1 includes:
- 5 playable games: NumberCatcher (Gr 1-3), FractionBattle (Gr 4-5), AlgebraEscape (Gr 6-8), QuadraticBoss (Gr 9-10), CalculusRunner (Gr 11-12)
- Shinchen scripted AI tutor with keyword-based responses and a chat interface
- XP, streak, 8 badge types, local leaderboard
- Dark neon UI with floating math symbols

All 10 remaining "Coming Soon" games are locked (implemented: false). The Shinchen data layer has 5 topic areas, each with 4 hints. Onboarding collects name + grade. No sound effects or level-up animations exist.

## Requested Changes (Diff)

### Add

**Games (10 new, completing the full set of 15):**
- Grades 1–3: AdditionRocket, SubtractionBlocks
- Grades 4–5: DecimalDash, TimeMaster
- Grades 6–8: GeometryBuilder, IntegerWar
- Grades 9–10: GraphBuilder, TrigSniper
- Grades 11–12: MatrixCode, ProbabilityStrategy

Each new game must have 3 levels of increasing difficulty with 8 questions per level, returning { score, correct, incorrect }.

**Shinchen V2 upgrades:**
- Extended topic tip libraries: geometry, integers, decimals/time, trigonometry, matrices, probability (6 new topic sections in shinchen.ts)
- More detailed step-by-step explanations in all existing topics (expand from 4 to 8 hints each)
- More natural "step-by-step mode": if user says "explain", "step by step", "how do I", give a numbered walk-through response

**New badge types (8 new, total 16):**
- perfect_score: Score 100% on any game
- speed_demon_v2: Finish any Level 3 game in under 30s
- fraction_master: Complete all fraction levels
- calculus_legend: Complete all calculus levels
- ten_games: Play 10 total games
- xp_1000: Earn 1000 XP
- xp_2500: Earn 2500 XP
- all_games: Play all 15 games at least once

**Sound effects (browser-based Web Audio API, no external libs):**
- Correct answer: short ascending beep
- Wrong answer: short descending buzz
- Level complete: fanfare sequence
- XP earned: chime
- All sounds opt-in, muted by default, toggled via a sound icon in the game header

**Level-up animations:**
- When XP crosses a level threshold, show a full-screen overlay with animated "LEVEL UP!" text and particle burst (CSS/framer-motion only)
- When a badge is earned, toast with badge icon and name

**Onboarding improvements:**
- Add animated Shinchen character intro panel (step 0) before name/grade entry
- Smoother multi-step flow with progress indicator

### Modify

- **GameSelectScreen**: Mark all 15 games as `implemented: true`, allow any grade to play any game (remove grade-gating, just visually highlight current grade's games)
- **GameScreen**: Wire in all 10 new game components; add sound toggle icon in header; fire level-up animation when XP threshold is crossed; award new badges based on game result
- **ShinchenScreen**: Expand quick prompts; add "Explain step by step" prompt; use extended topic library
- **ProfileScreen**: Show all 16 badges in grid
- **HomeScreen**: Show a "Daily Challenge" card above the utility grid (rotating daily from Shinchen daily challenges list)

### Remove

- Nothing removed

## Implementation Plan

1. Create 10 new game components in `src/frontend/src/components/games/`:
   - AdditionRocket, SubtractionBlocks (Gr 1–3)
   - DecimalDash, TimeMaster (Gr 4–5)
   - GeometryBuilder, IntegerWar (Gr 6–8)
   - GraphBuilder, TrigSniper (Gr 9–10)
   - MatrixCode, ProbabilityStrategy (Gr 11–12)
   Each follows the same prop signature: `{ level: number, onComplete: (res) => void, onBack: () => void }`

2. Expand `shinchen.ts` with 6 new topic hint arrays and extend existing ones to 8 hints each; add step-by-step response logic

3. Add `useSoundEffects` hook using Web Audio API in `src/frontend/src/hooks/useSoundEffects.ts`

4. Add `LevelUpOverlay` component and `BadgeToast` logic for earned badges

5. Update `GameSelectScreen`: set all `implemented: true`, remove grade-gating click restriction

6. Update `GameScreen`: import 10 new games, add sound toggle, fire level-up overlay, award new badges

7. Update `ProfileScreen`: add 8 new badge definitions to `ALL_BADGES`

8. Update `HomeScreen`: add Daily Challenge card

9. Update `OnboardingScreen`: add Shinchen intro step and multi-step progress bar

10. Validate: typecheck + build
