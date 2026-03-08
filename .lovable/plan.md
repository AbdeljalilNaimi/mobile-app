

## Profile Page Redesign — Dense, Minimal, Professional

Full rewrite of `src/pages/CitizenProfilePage.tsx`. Same component, same logic, new layout.

---

### Design System (matching Home page)
- Background: `bg-[#F8F9FA]`, cards: `bg-white border border-[#E5E7EB] rounded-xl shadow-sm`
- Accent: `#1D4ED8` for CTAs only
- Text: `#111827` headings, `#6B7280` subtitles, `#9CA3AF` meta
- Section gap: 16px, card padding: 12px 16px, field gap: 8px

---

### Section-by-Section

**1. Compact Header Row**
- Single horizontal row: Avatar (48px) with SVG completion ring (thin blue stroke showing %) + Name (bold 16px) + Email (gray 12px) stacked vertically + Edit icon button right
- Below: thin 4px progress bar (blue fill) with "Profil complété à X%" label + inline tip "Complétez votre carte d'urgence pour +30%" as gray subtext with info icon
- No welcome banner card — removed entirely

**2. Tab Bar (improved)**
- Horizontal scroll with `overflow-x-auto`, height 44px
- Each tab: icon + 10px label below (Profil / Santé / RDV / Favoris / Sang / Alertes)
- Active: blue underline + blue icon color

**3. Informations Personnelles (Profile tab)**
- Title + "Modifier" button same row
- 2-column grid for fields: Nom/Email, Téléphone/Date naissance, Poids/Taille, Dernier don/Adresse (full width)
- Fields: label 11px uppercase gray, border-bottom only input style (no full border box), 40px height
- Remove icon prefixes inside inputs — clean text only
- Incomplete fields: subtle orange dot on the left of label
- Save button: sticky floating pill at bottom, only visible when `isEditing` and form has changes

**4. Profil Sanguin (compact)**
- Same card but reduced padding (p-3)
- Blood group Select + "Recevoir alertes" Switch in a single row using flex

**5. Score de Profil (compact horizontal)**
- Replace CircularProgress widget with 4 compact rows (28px each):
  Label left | thin Progress bar | score right (e.g. "13/25")
- One CTA button at bottom: "Compléter Carte d'Urgence (+30%) →"

**6. Sécurité (inline list, no card wrapper)**
- "Changer le mot de passe": simple row with Lock icon + ChevronRight
- "Se déconnecter": red text link, small, centered — not a full-width destructive button

**7. Other tabs** — Keep content unchanged, just apply consistent card styling (`rounded-xl border-[#E5E7EB] shadow-sm`) and tighter padding

**8. Footer spacer** — `pb-20` for bottom nav clearance

---

### File Changed
- `src/pages/CitizenProfilePage.tsx` — full rewrite of the return JSX + minor state additions (`hasChanges` tracking for sticky save button)

