

## Bottom Nav Bar — Visual Polish

The bottom nav is already floating and functional. Minor refinements needed for a cleaner, more professional look:

### Current Issues Found
1. Profile fallback circle uses `bg-muted` (dark gray) with `text-muted-foreground` — looks heavy against the frosted glass nav
2. The "?" fallback for guests looks unprofessional

### Changes to `src/components/layout/BottomNavBar.tsx`

1. **Improve fallback avatar styling**: Change from `bg-muted` to `bg-[#E5E7EB]` with `text-[#6B7280]` — lighter, cleaner look that matches the minimal design system
2. **Reduce avatar size slightly**: `w-7 h-7` instead of `w-8 h-8` to better proportion with the other icons
3. **Add border to avatar**: `border border-[#E5E7EB]` for a cleaner defined circle
4. **Better fallback for guests**: Show a `User` icon (from lucide) instead of "?" when no user data exists — more professional than a question mark
5. **Ring offset background**: Add `ring-offset-background` to the active ring so it doesn't clash with the frosted glass

### File Changed
- `src/components/layout/BottomNavBar.tsx` — minor styling tweaks only

