

## Redesign Provider Cards with View Toggle

### What the two reference images show

- **Image 1** (first uploaded, from previous message): Horizontal appointment-style cards — info left, large rounded photo right, badges, action buttons (Call, Book). This is the **current design** already implemented.

- **Image 2** (new upload): **Grid of portrait cards** — large square photo on top (taking ~60% of card height), rating badge overlaid on bottom-right of photo, name centered below, specialty below name, and a small circular teal arrow button at the bottom center.

### Plan

#### 1. `src/pages/SearchPage.tsx` — Add view toggle + grid card variant

- Add a `viewMode` state: `'list' | 'grid'` (default: `'list'`)
- Add a toggle button group (two icons: list/grid) in the sort/filter bar area (line ~179)
- When `viewMode === 'list'`: render current horizontal `ProviderCard` (no changes)
- When `viewMode === 'grid'`: render providers in a `grid grid-cols-2 gap-3` layout using a new `ProviderGridCard` component

**New `ProviderGridCard` component** (inside SearchPage or extracted):
- Card with `rounded-2xl`, white bg, subtle shadow
- Top section: large square image (`aspect-square`, `rounded-xl` top corners), `object-cover`
- Rating badge overlaid on bottom-right of image: small white pill with star icon + number (e.g., `⭐ 4.9`)
- Below image: provider name centered, `font-semibold text-sm`
- Specialty centered below in `text-xs text-muted-foreground`
- Bottom: circular teal/primary arrow button (`rounded-full bg-primary text-white`) centered, links to provider profile

#### 2. `src/components/search/SearchResults.tsx` — Pass viewMode through

- The `SearchResults` component already accepts `viewMode` but is used in a different context (map page). The main search page (`SearchPage.tsx`) renders its own cards directly, so changes are primarily in `SearchPage.tsx`.
- Update `SearchResults.tsx` `ProviderCard` to also support both layouts via the existing `isGrid` prop — when `isGrid=true`, render the portrait grid style matching image 2.

#### 3. Colors adaptation
- Use existing platform theme: `bg-primary` (deep blue #1D4ED8) for the arrow button
- Rating badge: white bg with amber star
- Card bg: `bg-card` / white, `border-border/40`, `shadow-sm`

### What stays unchanged
- All filtering, sorting, category chips, bottom sheet filters — untouched
- Data flow, provider types, routing — untouched

