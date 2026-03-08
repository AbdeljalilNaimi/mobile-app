

## Redesign Main Page — Reference Image Style

### What the reference shows
A mobile health app with: gradient header area with greeting + avatar, prominent search bar, horizontally scrollable category pills (Doctors, Pharmacy, Hospitals), symptom chips (Headache, Nausea), and a "Top Doctors" list at the bottom.

### Plan

#### 1. Rewrite `MobileHomeScreen.tsx` layout to match reference structure

**New section order:**
1. **Header** — Keep existing greeting + avatar but add a larger hero text: "Let's find your Docteur!" styled with `text-2xl font-bold text-foreground` (no purple gradient — use platform's clean white bg with primary accents)
2. **Search bar** — Convert from a `<button>` navigating to `/search` into an actual `<Input>` with local state. On submit/change, navigate to `/search?q={query}` so it pre-filters the provider list
3. **Categories** — Horizontally scrollable row of pill buttons (Doctors, Pharmacy, Hospitals, Labs, Clinics, etc.) with colored icon circles. Each navigates to `/search?type={type}`. Use `overflow-x-auto flex gap-3 scrollbar-hide` with `snap-x`
4. **Symptoms** — Horizontally scrollable emoji chips (Headache, Nausea, Fatigue, Fever, etc.). Each navigates to `/medical-assistant?symptom={symptom}` to pre-fill the AI assistant. Same scroll pattern
5. **Top Doctors** — Show top 5 providers (type=doctor, sorted by rating) from the providers data. Each card: avatar left, name + specialty + rating, "Appointment" button. "See all" links to `/search?type=doctor`
6. **Keep remaining sections** — Blood donation, emergency, community, ads, articles, entraide, quick access — all stay below, unchanged

#### 2. Search bar integration
- Add `useState` for search query
- On Enter or after debounce, `navigate('/search?q=' + encodeURIComponent(query))`
- The SearchPage already reads URL params for filtering

#### 3. Categories with scroll animation
- Define categories array: `[{label: 'Doctors', icon: Stethoscope, type: 'doctor'}, {label: 'Pharmacy', icon: Pill, type: 'pharmacy'}, {label: 'Hospitals', icon: Building2, type: 'hospital'}, {label: 'Labs', icon: FlaskConical, type: 'lab'}, {label: 'Clinics', icon: Activity, type: 'clinic'}]`
- Each pill: circular colored icon on top + label below (matching reference)
- Navigate to `/search?type={type}` on click
- Container: `flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x`

#### 4. Symptoms chips linked to AI
- Define symptoms: `[{emoji: '🤕', label: 'Headache'}, {emoji: '🤢', label: 'Nausea'}, {emoji: '🤒', label: 'Fever'}, {emoji: '😴', label: 'Fatigue'}, {emoji: '💊', label: 'Allergy'}]`
- Each chip: rounded-full pill with emoji + text, `bg-card border shadow-sm`
- On click: `navigate('/medical-assistant?symptom=' + label)`
- Same horizontal scroll

#### 5. Top Doctors section
- Import `generateAllProviders` from providers data
- Filter type=doctor, sort by rating desc, take first 5
- Card layout: horizontal row — avatar (rounded-full, 48px), name bold, specialty muted, rating with star icon, "Appointment" pill button on right
- "See all" header link to `/search?type=doctor`

#### 6. Colors — platform theme (no purple)
- Keep `bg-background`, `bg-card`, `text-primary` (#1D4ED8 deep blue)
- Category icon circles: `bg-primary/10` with `text-primary`
- Symptom chips: `bg-card border-border`
- Top doctors appointment button: `bg-primary/10 text-primary rounded-full`

### Files to modify
- `src/components/homepage/MobileHomeScreen.tsx` — main redesign (reorder sections, add categories/symptoms/top doctors)

### What stays unchanged
- All existing sections below the new ones (blood, emergency, ads, articles, community, entraide, quick access)
- Filtering system on SearchPage
- Bottom nav bar, auth, data hooks

