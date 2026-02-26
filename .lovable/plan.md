

# CityHealth -- Provider Advertising Module

## Overview

This plan upgrades the existing basic ad system (Firestore-based `MedicalAdsManager`) into a full-featured, premium advertising module with engagement features (likes, saves, reports), a dedicated public feed page, filtering/search, and monetization-ready structure.

## Architecture Decision

**Database:** Supabase (Lovable Cloud) for the new ads system. The current Firestore-based ads service will be replaced. Supabase provides proper RLS, relational tables for likes/saves/reports, and simpler querying with filters.

**Storage:** Existing `provider-images` bucket for ad cover images.

---

## 1. Database Schema (Supabase Migrations)

### Table: `ads`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| provider_id | text | Firebase UID |
| provider_name | text | |
| provider_avatar | text | nullable |
| provider_type | text | Specialty badge |
| provider_city | text | Location badge |
| title | text | |
| short_description | text | Preview text (max 200 chars) |
| full_description | text | Expandable content |
| image_url | text | Required cover image |
| status | text | pending/approved/rejected/suspended |
| is_featured | boolean | Admin can toggle |
| is_verified_provider | boolean | |
| views_count | integer | Default 0 |
| likes_count | integer | Default 0 |
| saves_count | integer | Default 0 |
| rejection_reason | text | nullable |
| expires_at | timestamptz | nullable |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### Table: `ad_likes`
| Column | Type |
|--------|------|
| id | uuid PK |
| ad_id | uuid FK -> ads |
| user_id | text |
| created_at | timestamptz |
| UNIQUE(ad_id, user_id) |

### Table: `ad_saves`
| Column | Type |
|--------|------|
| id | uuid PK |
| ad_id | uuid FK -> ads |
| user_id | text |
| created_at | timestamptz |
| UNIQUE(ad_id, user_id) |

### Table: `ad_reports`
| Column | Type |
|--------|------|
| id | uuid PK |
| ad_id | uuid FK -> ads |
| reporter_id | text |
| reason | text |
| details | text nullable |
| status | text | Default 'pending' |
| created_at | timestamptz |

### RLS Policies
- `ads`: Public SELECT for approved ads; provider INSERT/UPDATE/DELETE for own ads; admin full access
- `ad_likes`: Public SELECT; authenticated INSERT/DELETE own
- `ad_saves`: Public SELECT; authenticated INSERT/DELETE own
- `ad_reports`: Authenticated INSERT; admin SELECT/UPDATE

### Triggers
- On `ad_likes` INSERT/DELETE: update `ads.likes_count`
- On `ad_saves` INSERT/DELETE: update `ads.saves_count`

---

## 2. New Files

### Service Layer
**`src/services/adsService.ts`** -- Complete CRUD + engagement service using Supabase:
- `createAd()`, `updateAd()`, `deleteAd()`
- `getApprovedAds(filters)` with search, specialty, location, sort (newest/popular/featured)
- `toggleLike()`, `toggleSave()`, `reportAd()`
- `getUserLikes()`, `getUserSaves()`
- `incrementViews()`
- `getProviderAds(providerId)`
- `adminApprove()`, `adminReject()`, `adminFeature()`
- Profanity filter integration on create/update

### Public Feed Page
**`src/pages/AdsPage.tsx`** -- Dedicated "/annonces" page:
- Search bar at top
- Filter chips: Specialty, Location, Newest, Popular, Sponsored/Featured
- Responsive feed layout: single column on mobile, 2-col on tablet, 3-col on desktop
- Each card is an `AdCard` component
- Infinite scroll or "Load More" pagination

### Ad Card Component
**`src/components/ads/AdCard.tsx`** -- Premium card design:
- Cover image with aspect ratio (16:9)
- Overlay badges: "Sponsorise" (featured), "Verifie" (verified provider), "Nouveau" (< 7 days), "Offre Limitee" (has expiry)
- Provider avatar + name + specialty badge + location
- Title + short description (truncated)
- Engagement bar: Like (heart + count), Save (bookmark), Share (copy link), Report (flag)
- Subtle hover animation (lift + shadow)
- Design tokens: 14px radius, 24px padding, soft shadow, #F5F7FA bg, #0ABAB5 accent

### Ad Detail Dialog
**`src/components/ads/AdDetailDialog.tsx`** -- Expandable full view:
- Full image
- Full description
- Provider profile link
- All engagement actions
- Publication date + expiry

### Provider Ad Manager (Redesigned)
**`src/components/ads/ProviderAdsManager.tsx`** -- Replace existing `MedicalAdsManager`:
- Create ad form with image upload (required), title, short/full description, optional expiry
- My ads list with status, analytics (views, likes)
- Edit/Delete actions
- Active ads limit indicator (max 5 active ads per provider)
- Profanity validation on submit

### Admin Moderation (Enhanced)
**`src/components/admin/AdsModeration.tsx`** -- Replace existing `MedicalAdsModeration`:
- Table with preview, approve, reject, feature toggle, suspend
- Report queue tab
- Search/filter

### Saved Ads Section
**`src/components/ads/SavedAdsSection.tsx`** -- For citizen dashboard:
- Grid of saved ads
- Remove from saved

---

## 3. Modified Files

### `src/App.tsx`
- Add route: `/annonces` -> `AdsPage` (public)

### `src/components/layout/Header.tsx`
- Add "Annonces" link under Services nav section

### `src/pages/ProviderDashboard.tsx`
- Replace `MedicalAdsManager` import with new `ProviderAdsManager`
- Remove old Firestore-based ads tab content

### `src/pages/PatientDashboard.tsx`
- Add "Mes Annonces Sauvegardees" tab with `SavedAdsSection`

### `src/components/homepage/MedicalAdsCarousel.tsx`
- Replace mock data with real Supabase query for featured/approved ads

### `src/pages/AdminDashboard.tsx`
- Replace `MedicalAdsModeration` with new `AdsModeration`

---

## 4. Design Specifications

```text
Card Layout:
+----------------------------------+
|  [Cover Image 16:9]              |
|  [Badge: Sponsorise] [Verifie]   |
+----------------------------------+
|  [Avatar] Provider Name          |
|  Specialty . Location            |
|                                  |
|  Title (bold, 18px)              |
|  Short description (14px, muted) |
|                                  |
|  [Heart 24] [Bookmark] [Share]   |
|  [Flag]              12 Jan 2026 |
+----------------------------------+

Tokens:
- bg: #F5F7FA (page), white (cards)
- radius: 14px (rounded-2xl)
- shadow: shadow-sm hover:shadow-md
- accent: #0ABAB5 (primary)
- padding: 24px (p-6)
- font: system (Inter via Tailwind)
```

---

## 5. Implementation Order

1. Database migration (create tables, RLS, triggers)
2. `adsService.ts` (Supabase service layer)
3. `AdCard.tsx` + `AdDetailDialog.tsx` (UI components)
4. `AdsPage.tsx` (public feed with filters)
5. `ProviderAdsManager.tsx` (provider create/manage)
6. `SavedAdsSection.tsx` (citizen saved ads)
7. `AdsModeration.tsx` (admin panel)
8. Route + navigation integration (App.tsx, Header, dashboards)
9. Update `MedicalAdsCarousel.tsx` to use real data
10. Remove old Firestore ads service references

---

## 6. Quality Controls

- Max 5 active ads per provider (enforced in service + UI)
- Image required, validated type (jpg/png/webp), max 5MB
- Profanity filter on title + descriptions (existing `profanityFilter.ts`)
- Input validation with zod schemas
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop
- Engagement animations: heart fill on like, bookmark fill on save
- View count incremented on card expand (debounced)

