

## Plan: Redesign Bottom Navigation Bar with Elevated Diamond Center Button

### What changes
Rewrite `src/components/layout/BottomNavBar.tsx` to match the reference image exactly.

### Design Details

**Layout**: Fixed bottom floating white bar with 5 items. The center item ("Carte") is an elevated diamond (45° rotated rounded square) in deep purple (`#1e1b4b` / indigo-950) with a white `+` icon, positioned to overflow above the bar.

**Structure**:
- Outer: `fixed bottom-0`, centered `max-w-[430px]`
- Bar: white `bg-white`, `rounded-[24px]`, soft shadow `shadow-[0_-8px_30px_rgba(0,0,0,0.08)]`, height ~70px
- 4 regular tabs (Accueil, Recherche, IA Chat, Settings) evenly spaced with a gap in the center for the diamond
- Center diamond: absolutely positioned, `-top-6`, rotated 45deg, `rounded-[16px]`, `w-14 h-14`, `bg-indigo-950`, contains `Plus` icon (rotated -45deg to stay upright), with a subtle purple glow shadow beneath

**Icons**: 
- Accueil → `Home`, Recherche → `Search`, IA Chat → `Bot`, Settings → `Settings` (lucide)
- Inactive: `text-muted-foreground` (grey)
- Active: `text-indigo-950` (deep purple) with bold label
- Hover: `text-indigo-800` subtle transition

**Active state**: Deep purple icon+label, small 3px rounded indicator dot below label. Only one active at a time. Uses `framer-motion layoutId` for smooth transitions.

**Center button click**: Navigates to `/map`, has a `whileTap={{ scale: 0.9 }}` and a subtle `animate-pulse-glow` using existing keyframe with `--glow-color: rgba(30,27,75,0.4)`.

**No profile avatar logic** — Settings tab uses `Settings` icon (lucide) like the reference. Keeps badges for notification/location.

### Files modified
1. `src/components/layout/BottomNavBar.tsx` — full rewrite

