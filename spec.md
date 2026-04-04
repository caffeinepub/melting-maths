# Melting Maths — AdSense Compliance & Navigation Update

## Current State
- Single-page app with screen-based navigation (state: `Screen` union type in App.tsx)
- All navigation happens via `onNavigate` callbacks — no URL routing, no browser history
- HomeScreen has About Us and Contact Us sections near the bottom of a long scrollable page
- No persistent navbar exists — each screen has its own back button or ad-hoc nav
- No Privacy Policy or Terms & Conditions pages
- GameSelectScreen shows games with name, icon, topic but no 2-3 line description
- Footer only exists on HomeScreen, contains Caffeine attribution
- No global footer with copyright, About, Privacy, Terms links

## Requested Changes (Diff)

### Add
- **Global fixed bottom Navbar** (NavBar component): visible on ALL screens after onboarding
  - 4 main icon+text tabs: Home, Games, Leaderboard, Profile
  - 3 secondary links (text only, smaller): About, Privacy Policy, Terms & Conditions
  - Active screen highlighted with neon glow
  - Smooth transition animations between screens
  - Dark neon RGB theme matching existing design
  - Fixed at bottom on mobile; sticky top bar on desktop (or always bottom)
- **New Screen: `about`** — Expanded About Us page (full screen, not just home section)
  - Laksh Agarwal founder bio (existing content)
  - Mission & vision expanded paragraphs
  - Orange taglines
- **New Screen: `privacy`** — Privacy Policy page
  - Cookies, Google AdSense ads, data collection, user privacy
  - Proper legal-style text
- **New Screen: `terms`** — Terms & Conditions page  
  - Content ownership, no copying, user responsibility
- **Home Page intro block** — 200-300 word introduction section at top of HomeScreen (below welcome banner)
  - What Melting Maths is
  - 40+ interactive maths games
  - Covers Grade 1–12
  - AI tutor Shinchen
- **Game descriptions** — Add a 2-3 line `description` field to each game entry in GRADE_GAMES in GameSelectScreen.tsx, shown as subtitle on game card
- **Global Footer** — Added to every main screen (or as part of navbar component)
  - © 2026 Melting Maths. All Rights Reserved.
  - Links: Home | About | Privacy Policy | Terms

### Modify
- **App.tsx**: Add `about`, `privacy`, `terms` to the `Screen` union type; add screen rendering for these three; pass `navigate` down to Navbar
- **HomeScreen.tsx**: Add intro block (200-300 words) near top; update existing About Us section to be shorter teaser with link to full About screen
- **GameSelectScreen.tsx**: Add `description` field to all 30 games in GRADE_GAMES array; render it in each game card below the topic
- All screens that currently show a back button: Navbar replaces the need for back navigation on top-level screens (home, game-select, leaderboard, profile); keep back buttons on sub-screens (game, teacher, tournament, etc.)

### Remove
- Nothing removed — existing game logic untouched
- Ads NOT added to loading screens, coming-soon, or empty states (they should already be absent; ensure no ad placeholders on those)

## Implementation Plan
1. Update `Screen` type in App.tsx to add `about | privacy | terms`
2. Create `NavBar.tsx` component — fixed bottom navbar with Home/Games/Leaderboard/Profile icons+text + About/Privacy/Terms text links, active state highlight, neon theme
3. Create `AboutScreen.tsx` — full-page About Us with expanded founder bio, mission/vision, orange taglines
4. Create `PrivacyScreen.tsx` — Privacy Policy with proper sections
5. Create `TermsScreen.tsx` — Terms & Conditions with proper sections
6. Update App.tsx — add new screens to render block, pass navigate to NavBar, render NavBar on all screens except onboarding/game/cutscene
7. Update HomeScreen.tsx — add 200-300 word intro block near top; shorten existing About section to teaser
8. Update GameSelectScreen.tsx — add `description` to GRADE_GAMES data and render in cards
9. Add global footer (© 2026 + links) inside NavBar or as separate Footer component shown on all main screens
