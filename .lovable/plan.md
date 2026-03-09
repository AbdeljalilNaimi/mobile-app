

## Plan: Replace "Health Services" section with Ads/Annonces showcase

### What changes
Remove the horizontal scrolling "Health Services" cards (lines 357-380) showing Pharmacies de garde, Cardiologie, Pédiatrie, Ophtalmologie and replace with a visually appealing "Annonces Pro" section that links to `/annonces`.

### Design approach
- **Section header**: Keep `SectionHeader` pattern with "Annonces" label, "Annonces Pro" title, "Voir tout" linking to `/annonces`
- **Cards**: Reuse the existing `ads` data (already fetched via `useHomepageAds`). Show up to 4 ads in a 2-column grid with:
  - Featured badge (star icon) or "Nouveau" tag
  - Ad title (line-clamp-2)
  - Provider name + verified indicator
  - Short description snippet (line-clamp-1)
  - Subtle gradient accent on featured ads
- **Empty state**: If no ads, show a single promotional banner card encouraging users to explore annonces, with a CTA button to `/annonces`
- **Navigation**: Each card navigates to `/annonces` (the ads page)

### Files modified

1. **`src/components/homepage/MobileHomeScreen.tsx`**
   - Remove `healthServices` array (lines 100-105)
   - Remove `useHomepageProviderCounts` import and hook call (no longer needed since that data was only used by healthServices)
   - Delete the "Health services" section (lines 357-380)
   - Replace with an "Annonces Pro" section using the already-available `ads` mapped data, but with an enhanced card design showing short_description
   - Update the `useHomepageAds` query to also select `short_description` if not already included — actually it's not in the mapped data, so we'll enhance the mapping

2. **`src/hooks/useHomepageData.ts`**
   - Remove `useHomepageProviderCounts` export (no longer needed)
   - Optionally keep it if used elsewhere (will check — it's only used in MobileHomeScreen, so safe to remove)

### UX details
- The ads section will appear where healthServices was, maintaining visual flow
- Cards use the same sizing/spacing patterns as the existing medical ads section below (which we can merge or keep separate)
- Since there's already a "Medical ads" section (lines 382-403), we'll **merge** both into one enhanced section replacing healthServices, and remove the duplicate ads section below

