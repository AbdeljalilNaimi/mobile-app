

# GoodDay-Style Header Redesign

## Overview
Complete rewrite of `src/components/AntigravityHeader.tsx` replacing Radix click-based dropdowns with custom hover-triggered mega-menu panels following GoodDay.work's structural layout.

## Files to Modify

### 1. `src/components/AntigravityHeader.tsx` — Full rewrite of desktop nav

**Layout restructure** to three-section flex:
- **Left**: `Logo` component (unchanged)
- **Center**: `nav` with "Services", "Professionnels", "Ressources", "Urgences" — centered using `flex-1 justify-center`
- **Right**: Language switcher, Connexion/user menu, "Trouver un médecin" CTA

**Hover mega-menu system**:
- New state: `activeMenu: 'services' | 'pro' | 'resources' | null`
- `useRef` for timeout to implement 150ms enter/leave delay preventing flicker
- `onMouseEnter` on trigger button: clear timeout, set activeMenu
- `onMouseLeave` on trigger button: setTimeout 150ms → null
- `onMouseEnter` on panel: clear timeout (keep open)
- `onMouseLeave` on panel: setTimeout 150ms → null
- Chevrons: `h-3.5 w-3.5`, rotate 180deg when active

**Services mega-menu** (~900px wide):
- Left vertical sidebar with category tabs: "Soins & Recherche", "Communauté & Aide"
- State `serviceCategory` to toggle visible items
- "Soins" shows: Rechercher un médecin, Carte interactive, Urgences 24/7, Assistante IA
- "Communauté" shows: Don de sang, Don gratuit
- Each item: icon + bold title + 1-line description in a 2-column grid
- Right highlight panel: red-accented "Urgences 24/7" card with CTA button, `bg-red-50 dark:bg-red-950/30 rounded-xl p-5`

**Professionnels mega-menu** (~550px):
- 2-column grid: "Devenir partenaire" and "Tableau de bord" with icon + title + description
- Right highlight: "Rejoindre CityHealth" card with `bg-primary/5 rounded-xl`

**Ressources mega-menu** (~550px):
- 2-column grid: Recherche Médicale, Communauté, Documentation, Contact
- Right highlight: "Documentation complète" card

**Panel styling**:
- `shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]`
- `border border-border/40 rounded-xl`
- `bg-popover/98 backdrop-blur-xl`
- Positioned absolutely below header, centered
- Fade-in via inline style: `opacity` + `translateY(-8px)` transition 150ms

**CTA button restyle**:
- Ghost/outline style: `border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground rounded-lg transition-all`

**Header container**:
- Always has bottom border: `border-b border-border/30`
- Wider padding: `px-8 lg:px-12`
- `bg-background/98 backdrop-blur-lg` always (remove the scroll-based transparency toggle, keep shadow on scroll)

**Mobile menu**: Keep Sheet-based menu completely unchanged (only desktop `lg:` gets mega-menus)

### 2. `tailwind.config.ts` — Add mega-menu animation keyframe

Add `mega-enter` keyframe:
```
'mega-enter': {
  '0%': { opacity: '0', transform: 'translateY(-8px)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
}
```
And animation: `'mega-enter': 'mega-enter 150ms ease-out'`

## Preserved Functionality
- All existing routes/links stay the same
- Auth logic (user menu, role badges) unchanged
- Language switcher logic unchanged  
- Mobile Sheet menu unchanged
- `useAuth`, `useLanguage` hooks unchanged

