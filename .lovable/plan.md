

## Bottom Navigation Bar Redesign

Rewrite `src/components/layout/BottomNavBar.tsx` with the new dark style. No new files needed.

### Changes

**Visual**
- Background: `bg-[#1A1A1A]` — no border, no blur, no shadow
- Height: 64px bar + safe area padding (16px min)
- All inactive icons/labels: white. Active: `#2B7FFF` blue
- No background pill on active tab — color change only
- Active icon uses `strokeWidth: 2.5`, inactive `1.5`
- Labels: 11px bold

**IA Chat badge**
- Replace red dot with a numbered blue circle badge (`bg-[#2B7FFF]`, white bold 10px text)
- Positioned top-right overlapping icon

**Last tab → Avatar (Profil)**
- Change last tab from Settings/gear to "Profil" with path `/profile`
- Import `useAuth` to get `profile?.avatar_url` and `profile?.full_name`
- Render a 32px circular avatar image (or initials fallback with gray bg)
- Active state: 2px blue ring (`ring-2 ring-[#2B7FFF]`)
- Label: "Profil"

**Tap feedback**
- `active:scale-90` on press (already exists, keep it)

**Layout**
- `flex-1` for equal width tabs
- 4px gap between icon and label
- Remove `rounded-2xl` pill styling from buttons
- Remove location green dot (Carte tab) — keep only blue badge on IA Chat

### File Changed
- `src/components/layout/BottomNavBar.tsx` — full rewrite

