# Melting Maths

## Current State
- 15 games fully playable across all 5 grade groups (Grades 1-3, 4-5, 6-8, 9-10, 11-12), 3 per group
- Shinchen scripted AI tutor with keyword-based responses, step-by-step explanations for 13 topics, hints, encouragement
- XP system, daily streak counter, 16 badges, local leaderboard (top 20)
- Level-up overlay animation, sound effects (Web Audio API) with toggle
- Profile screen: avatar (single 🧠 emoji), badges grid, weak topics, stats (XP, badges, streak, level)
- Daily challenge card on home screen
- Shinchen intro on onboarding

## Requested Changes (Diff)

### Add
- **21 additional games** (bringing total from 15 to 36): Some may share mechanic styles (quiz/select/type-answer) for scope management but each has unique math content per grade:
  - Grades 1-3: Number Race (counting), Shape Sorter (shapes), Skip Counter (multiplication intro)
  - Grades 4-5: Multiplication Madness, Division Dungeon, Word Problem Wizard
  - Grades 6-8: Ratio Rumble, Percentage Power, Pattern Detective
  - Grades 9-10: Statistics Showdown, Sequence Solver, Coordinate Quest
  - Grades 11-12: Complex Numbers Clash, Logarithm Lab, Vectors Voyage
  - Boss game per grade group (5 total): Math Mega Boss (unlocked after completing all 3 grade games) -- uses mixed questions from all topics
- **PIN-protected parent/teacher dashboard**: accessible via a lock icon on profile screen; PIN is 1234 (can be changed); shows student name, grade, XP, badges earned, weak topics, games played
- **Friend challenge feature**: after completing a game, option to copy a shareable "challenge link" (URL with score params encoded) so friends can try to beat it
- **Shinchen V3 upgrades**:
  - Daily 5-question quiz mode accessible from Shinchen screen
  - Weak topic drill mode: if profile.weakTopics.length > 0, Shinchen can start a targeted drill
  - Animated Shinchen avatar with 3 expression states (happy, thinking, celebrating) using CSS animations
- **Custom unlock themes**: 3 color themes (Neon Blue default, Cosmic Purple, Solar Gold) unlockable at XP 500, 1500 -- selectable from profile
- **Grade progression**: when all 3 games in the player's current grade group are completed (Level 3 beaten on each), show a "Grade Promotion" celebration and increment grade
- **Stats screen expansion**: add games played count, unique games played count, favourite game (most played), accuracy % (from local session history)
- **2 new unlockable avatars** (unlocked by earning XP milestones):
  - 🚀 Rocket (unlocked at XP 200)
  - 🧙 Wizard (unlocked at XP 1000)
  - Both added alongside existing 🧠 Brain default
- **More badge types** (8 additional for total ~24):
  - grade_up: First grade promotion
  - quiz_master: Complete Shinchen daily quiz with 5/5
  - theme_collector: Unlock all themes
  - boss_slayer: Beat any boss game
  - week_warrior: 7 unique games in 7 days
  - challenge_accepted: Share a friend challenge
  - drill_sergeant: Complete 3 weak-topic drills
  - explorer: Play a game 2 grades above your current grade
- **Visual polish**: improve FloatingMath with more symbols + subtle parallax, add entry cutscene on first load (animated logo reveal), improve game cards with subtle glow pulse on hover, add shimmer effect on XP bar fill

### Modify
- **ProfileScreen**: add avatar selector (3 avatars, 2 unlockable), add stats expansion, add theme selector, add teacher dashboard access button
- **ShinchenScreen**: add animated avatar (CSS expression states), add quiz mode tab, add drill mode tab, update chat to reference 36 games
- **GameSelectScreen**: update game list to show all 36 games including new ones + boss games; show "BOSS" badge on boss games
- **GameScreen**: add friend challenge share button on result screen; add "All Games" badge trigger update for 36 games
- **HomeScreen**: add grade progression notification if eligible
- **App.tsx**: add theme support (CSS class on root), add teacher dashboard screen routing

### Remove
- Nothing removed; all V2 content retained

## Implementation Plan
1. Add 21 new game components (quiz-style with unique math content per topic; 5 boss games with mixed questions)
2. Add theme system (3 OKLCH themes, localStorage persistence, profile selector)
3. Add avatar selector to ProfileScreen (3 avatars, unlock logic based on XP)
4. Add teacher/parent dashboard screen (PIN 1234, shows read-only stats)
5. Add friend challenge share on result screen (encode score/game/level as URL params)
6. Upgrade Shinchen: animated avatar expressions (CSS), quiz mode (5 random questions), drill mode (weak topics)
7. Add grade progression logic and celebration overlay
8. Add 8 new badges, update badge checking
9. Update GameSelectScreen for 36 games + boss games
10. Expand stats on ProfileScreen
11. Visual polish: FloatingMath upgrade, entry cutscene, XP shimmer, card glow pulse
