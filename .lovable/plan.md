

# Plan: Fix guest vs authenticated access logic across all protected routes

## Problem
Several routes still use `CitizenGuard` which hard-redirects guests to `/citizen/login`. Per the new guest strategy, these should show the `AuthRequiredModal` bottom sheet or a guest-friendly page instead of redirecting.

## Affected Routes

| Route | Current | Fix |
|---|---|---|
| `/favorites` | `CitizenGuard` → redirect to login | Remove guard, show guest empty state with auth modal trigger |
| `/citizen/appointments` | `CitizenGuard` → redirect to login | Remove guard, show guest state |
| `/citizen/appointments/history` | `CitizenGuard` → redirect to login | Remove guard, show guest state |
| `/citizen/appointments/new` | `CitizenGuard` → redirect to login | Remove guard, show guest state |
| `/citizen/dashboard` | `CitizenGuard` → redirect to login | Remove guard, show guest state |

Routes that are correct and need no changes:
- `/profile` — already shows `GuestProfilePage` ✓
- `/search`, `/map/*`, `/medical-assistant` — public ✓
- Provider/Admin routes — keep their guards (different user types) ✓

## Changes

### 1. `src/App.tsx`
Remove `CitizenGuard` wrapper from the 5 routes listed above. Each page will handle its own guest state internally.

### 2. `src/pages/FavoritesPage.tsx`
Add auth check at the top: if `!isAuthenticated`, render a guest empty state card ("Connectez-vous pour sauvegarder vos médecins favoris") with login/register buttons, using the same visual style as GuestProfilePage locked features.

### 3. `src/pages/citizen/appointments/CitizenAppointmentsPage.tsx`
Add auth check: if `!isAuthenticated`, show guest state ("Connectez-vous pour gérer vos rendez-vous").

### 4. `src/pages/citizen/appointments/NewAppointmentPage.tsx`
Add auth check: if `!isAuthenticated`, show `AuthRequiredModal` automatically (or a guest state prompting login to book).

### 5. `src/pages/citizen/appointments/AppointmentHistoryPage.tsx`
Add auth check: if `!isAuthenticated`, show guest state.

### 6. `src/pages/PatientDashboard.tsx`
Add auth check: if `!isAuthenticated`, show guest state.

### 7. Create `src/components/guest/GuestBlockMessage.tsx`
A small reusable component for guest empty states on protected pages:
- Lock icon, title, description, login + register buttons
- Consistent styling across all guest states
- Avoids duplicating the same pattern in every page

## Technical Notes
- Import `useAuth` in each page to check `isAuthenticated`
- No changes to the `AuthRequiredModal` or `useAuthRequired` hook
- No changes to login/register pages
- Provider and Admin guards remain untouched
- The `GuestBlockMessage` component keeps the UI DRY

