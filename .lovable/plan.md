

# Unify Header Dropdowns and Add Back Button

## Problem
- Map pages (`/map/providers`, `/map/emergency`, `/map/blood`) use a simpler `Header` component with basic dropdown menus, while the rest of the site uses `AntigravityHeader` with rich mega-menus
- No "back to previous page" button exists on map pages or other inner pages

## Changes

### 1. Replace Header in MapMother with AntigravityHeader
**File: `src/components/map/MapMother.tsx`**
- Replace `import { Header } from '@/components/layout/Header'` with `import { AntigravityHeader } from '@/components/AntigravityHeader'`
- Replace `<Header />` with `<AntigravityHeader />` in the render
- Remove `/map/` from the `hiddenPrefixes` array in `App.tsx` `ConditionalHeader` so the logic stays clean (since MapMother renders its own header, we keep the prefix exclusion but switch to AntigravityHeader inside MapMother)

### 2. Add a Back Button to Map Pages
**File: `src/components/map/MapMother.tsx`**
- Add a "back to previous page" button next to the page title (below the header, before the map)
- Uses `useNavigate()` with `navigate(-1)` and an `ArrowLeft` icon
- Trilingual label: Retour / العودة / Back

### 3. Add a Back Button to Other Inner Pages Without One
**File: `src/components/layout/Header.tsx`** (kept as fallback but no longer used by map)
- No changes needed since map pages now use AntigravityHeader

### 4. Add Back Button to AntigravityHeader for Non-homepage routes
**File: `src/components/AntigravityHeader.tsx`**
- When `location.pathname !== '/'`, render a small back button (ArrowLeft) in the header bar, left of the logo or as part of the nav area
- This provides universal "back" navigation on all pages using AntigravityHeader

## Files Modified
- `src/components/map/MapMother.tsx` — switch to AntigravityHeader
- `src/components/AntigravityHeader.tsx` — add conditional back button for inner pages

