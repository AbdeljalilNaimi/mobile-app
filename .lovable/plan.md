

## Plan: Create dedicated Email Verification Page (`/verify-email`)

### Context
The app uses **Firebase Auth** for authentication. Currently, the email verification UI is embedded inline in `CitizenRegisterPage` (the `emailSent` state renders a basic confirmation view). The user wants a dedicated, polished `/verify-email` page with auto-check polling.

### Changes

**1. Create `src/pages/VerifyEmailPage.tsx`**

New standalone page with:
- **State**: email read from `sessionStorage` (`cityhealth_pending_email`), password from `cityhealth_pending_password`
- **Animated email icon**: 64px envelope with `framer-motion` bounce animation (color `#1D4ED8`)
- **Card layout**: white card, rounded-2xl, shadow-md, centered vertically, bg `#F8F9FA`
- **Content**: "Vérifiez votre email" title, subtitle with user's email in blue bold
- **"J'ai vérifié mon email" button**: Signs in with stored credentials via Firebase `signInWithEmailAndPassword`, checks `user.emailVerified` — if true redirects to `/onboarding`, if false shows inline error
- **"Renvoyer l'email" ghost button**: Calls Firebase `sendEmailVerification` with 60s cooldown timer (formatted `mm:ss`)
- **"Changer d'adresse email" link**: Navigates to `/citizen/register`
- **Footer spam notice**
- **Auto-check polling**: `setInterval` every 5 seconds — silently signs in, checks `emailVerified`, if true auto-redirects to `/onboarding`. Shows pulsing "Vérification en cours..." dots at bottom
- Cleanup interval on unmount

**2. Update `src/pages/CitizenRegisterPage.tsx`**

- After successful signup, instead of showing inline `emailSent` UI, navigate to `/verify-email`
- Remove the inline email verification UI block (lines ~123-225)
- Keep storing email/password in sessionStorage before navigating

**3. Update `src/App.tsx`**

- Add lazy import for `VerifyEmailPage`
- Add route `<Route path="/verify-email" element={<VerifyEmailPage />} />` in the auth routes section (no shell)

### Technical Notes
- Firebase Auth is used, not Supabase Auth — all auth calls use Firebase SDK
- The `signInWithEmailAndPassword` + `user.emailVerified` pattern is used for checking verification status
- After auto-check confirms verification, clear sessionStorage credentials and redirect to `/onboarding`
- No database changes needed

