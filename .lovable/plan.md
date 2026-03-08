

# Plan: Guest-friendly navigation and profile page

## Overview
Remove the login redirect from the Profile tab for guests. Instead, show a dedicated guest profile page. Add a reusable "login required" bottom sheet modal for protected actions across the app.

## Changes

### 1. Remove CitizenGuard from /profile route
**File: `src/App.tsx`**
- Change the `/profile` route from `<CitizenGuard><CitizenProfilePage /></CitizenGuard>` to render without the guard
- The CitizenProfilePage itself will handle guest vs authenticated state

### 2. Create GuestProfilePage component
**File: `src/components/guest/GuestProfilePage.tsx`**
- Top section: gray avatar circle (56px) with User icon, "Visiteur" bold, "Non connecté" gray, two buttons (Se connecter → `/citizen/login`, S'inscrire → `/citizen/register`)
- "Débloquez votre espace santé" section: list of locked features (dossier médical, rendez-vous, carte d'urgence, profil sanguin, favoris, historique IA) — white cards with lock icon
- "Accessible sans compte" section: list of available features (rechercher médecin, carte, assistant IA, annonces, recherche médicale) — white cards with green checkmark
- Bottom: "Réglages" link → `/settings`

### 3. Update CitizenProfilePage to show guest state
**File: `src/pages/CitizenProfilePage.tsx`**
- At the top of the component, check `isAuthenticated`. If not authenticated, render `<GuestProfilePage />` instead
- All existing authenticated logic remains unchanged

### 4. Create AuthRequiredModal (bottom sheet)
**File: `src/components/auth/AuthRequiredModal.tsx`**
- Uses Vaul drawer (already installed) for bottom sheet behavior
- Lock icon centered (blue, 32px)
- "Connexion requise" title
- Description text
- "Se connecter" button → `/citizen/login`
- "Créer un compte" ghost button → `/citizen/register`
- "Continuer sans compte" dismiss link
- Exported with a hook `useAuthRequired()` that returns `{ requireAuth: (callback) => void, AuthModal }` — if authenticated, runs callback; if not, shows modal

### 5. Create useAuthRequired hook
**File: `src/hooks/useAuthRequired.tsx`**
- Returns `{ requireAuth, AuthRequiredModal }` 
- `requireAuth(action?)` — checks auth state, shows modal if guest, executes action if authenticated
- Can be used anywhere: favorites, booking, emergency card, etc.

### 6. Update existing protected action points
- Favorites button, appointment booking, emergency card access — replace direct redirects with `requireAuth()` calls where applicable (targeted updates, not a full sweep)

## Technical notes
- Uses `vaul` Drawer component (already in dependencies) for the bottom sheet
- No changes to login/register pages
- No changes to BottomNavBar — it already routes to `/profile` without guards
- The CitizenGuard redirect is the only thing causing the current bad UX

