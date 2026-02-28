

## Problem

When a user clicks the verification link in their email, Firebase shows its own intermediate page saying "Your email has been verified. You can now sign in with your new account." with a "Continue" button. The user wants to skip this and go directly to their dashboard, already logged in.

## Root Cause

The current `sendEmailVerification` uses `handleCodeInApp: false`, which means Firebase handles verification on its own hosted page. The `continueUrl` only adds a "Continue" link on that Firebase page.

## Solution

Use `handleCodeInApp: true` so the email link points directly to our app with an `oobCode` query parameter. Our `/email-verified` page will then:
1. Extract `oobCode` from the URL
2. Call `applyActionCode(auth, oobCode)` to verify the email programmatically
3. Auto-login with stored credentials from `sessionStorage`
4. Redirect straight to the dashboard

### Changes

**1. `src/contexts/AuthContext.tsx`**
- Change `handleCodeInApp: true` in the `sendEmailVerification` call so Firebase redirects directly to our app instead of its own page

**2. `src/pages/EmailVerifiedPage.tsx`** — Rewrite to:
- Import `applyActionCode` from Firebase Auth
- On mount, read `oobCode` from URL search params
- Call `applyActionCode(auth, oobCode)` to verify the email server-side
- Then auto-login using stored credentials from `sessionStorage`
- Show a simple loading spinner ("Vérification en cours...") while processing
- On success, redirect to `/citizen/dashboard` (or `/provider/dashboard`)
- On failure (expired link, already verified, etc.), show an error with a link to login
- Remove the manual login form — keep it simple

