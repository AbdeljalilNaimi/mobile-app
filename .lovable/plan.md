

## Plan: Rebuild 4-Slide Onboarding with Inline SVG Illustrations

### What changes

**1. Rewrite `src/pages/OnboardingPage.tsx`**

Replace the current 3-slide PNG-based onboarding with a new 4-slide experience matching the spec exactly:

- **Slide data**: 4 slides with inline SVG illustrations (no external images), titles, subtitles, and optional highlight chips
- **Slide 1** (Bienvenue): Stethoscope/heart pulse SVG in blue tones
- **Slide 2** (Trouver un Médecin): Map pin + doctor SVG, chip "🔍 500+ médecins référencés"
- **Slide 3** (Urgences & Don de Sang): Blood drop + alert bell SVG in red accent, chip "❤️ Sauvez des vies près de chez vous"
- **Slide 4** (IA & Communauté): Chat bubble + sparkle SVG in blue, chip "🤖 Disponible 24h/24"

- **Layout**: White background, illustration top ~40%, text bottom ~60%, full screen, no nav bar
- **Navigation**: Swipe gestures via touch handlers (touchstart/touchend with threshold), "Passer" skip top-right, "Suivant →" button, last slide shows full-width "Commencer"
- **Dots**: 6px height, active dot = 20px pill in primary, inactive = 6px circle in gray
- **Transitions**: `translateX` with 300ms ease-in-out via framer-motion
- **Finish action**: Sets `localStorage("onboarding_complete", "true")` and navigates to `/accueil`

**2. Update `src/App.tsx`**

- Update `OnboardingGuard` to check `onboarding_complete` key (instead of `cityhealth_onboarding_done`)
- Add route alias `/accueil` pointing to the home page (or keep `/` and redirect `/accueil` → `/`)
- Ensure `/onboarding` route remains outside `MobileAppShell`

**3. SVG Illustrations**

Created inline as React components directly in the OnboardingPage file (or a small companion file) — simple flat vector art in blue/red tones, no external assets needed.

### Files to modify
- `src/pages/OnboardingPage.tsx` — full rewrite
- `src/App.tsx` — update localStorage key in guard, add `/accueil` route

