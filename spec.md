# Melting Maths

## Current State
The app has a Profile screen with a "Danger Zone" section at the bottom containing two reset options (Reset Game Progress Only, Reset Everything). Neither option deletes the account or redirects to onboarding -- the player name/grade persists and the user stays on the profile screen. There is no dedicated "Account" section.

## Requested Changes (Diff)

### Add
- A separate **Account** section in the Profile screen (distinct from the existing Danger Zone reset section)
- A **Delete Account** button inside the Account section
- A confirmation dialog ("Are you sure? This will permanently delete your account and all data. This cannot be undone.")
- A **Goodbye screen** shown after confirming deletion -- full-screen message thanking the student and wishing them well, displayed for ~2.5 seconds before redirecting
- After the goodbye screen, wipe ALL localStorage keys (profile, game progress, settings, theme, avatar, sound, streak, visits, etc.) and navigate to the `"onboarding"` screen so the user must sign in again

### Modify
- ProfileScreen.tsx: add the new Account section above or below the existing Danger Zone section, clearly separated

### Remove
- Nothing removed

## Implementation Plan
1. In `ProfileScreen.tsx`, add a new "Account" section card with a "Delete Account" red button
2. Wire an `AlertDialog` confirmation: "Are you sure? All your data will be permanently deleted and you will need to sign in again."
3. On confirm, set a local state flag `showGoodbye = true` which renders a full-screen goodbye overlay
4. After 2.5 seconds on the goodbye screen, clear ALL localStorage keys (every `mm_*` key and `meltingmaths_profile`) and call `onDeleteAccount()` callback
5. In `App.tsx`, add `onDeleteAccount` prop handler that navigates to `"onboarding"` screen
