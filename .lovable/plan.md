

## Plan: Enhance Search Page Advanced Filters

### Current State
- `SearchPage.tsx` has a basic bottom Sheet with only 3 filters (rating, verified, emergency)
- `AdvancedFilters.tsx` exists as a full sidebar component with many more filters (location/radius, availability, rating stars, wheelchair, insurance, CNAS, equipment brands, price range) but is **not used** anywhere
- Labels in `AdvancedFilters.tsx` are in English

### Changes

#### 1. `SearchPage.tsx` — Replace basic Sheet content with rich filters
- Replace the minimal filter Sheet content (lines 237-282) with a comprehensive, mobile-friendly filter panel that includes:
  - **Disponibilite** (availability): radio chips (Tous, Aujourd'hui, Cette semaine, Ouvert maintenant)
  - **Note minimum**: interactive star rating (1-5 clickable stars)
  - **Options**: checkboxes for Verified, Emergency, Wheelchair accessible, Insurance accepted, CNAS
  - **Localisation**: text input + radius slider (1-50km)
  - **Fourchette de prix**: dual slider (0-500 DA)
  - **Marques d'equipement**: badge chips from `COMMON_EQUIPMENT_BRANDS`
- All labels in French
- Add a sticky "Appliquer" + "Reinitialiser" button row at the bottom of the Sheet
- Update `clearAll` to reset all filter fields (not just the 4 currently cleared)
- Update `activeFiltersCount` to count all active filters
- Update filtering logic in `filteredProviders` to apply availability (`isOpen`), wheelchair, insurance, CNAS, price, and equipment brand filters where data permits

#### 2. `AdvancedFilters.tsx` — No changes (keep as-is for potential desktop use later)

### Files modified
1. `src/pages/SearchPage.tsx`

