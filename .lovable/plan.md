

## Plan: CityHealth Public API System

This is a large feature spanning database tables, an edge function router, 3 frontend pages, and admin panel additions. The project uses **Firebase Auth** (not Supabase Auth), so the developer portal auth will use the existing Firebase auth system.

### 1. Database Migration (3 new tables)

**`api_keys`** — stores hashed API keys linked to Firebase user IDs (developer_id as TEXT, not UUID FK to auth.users since auth is Firebase-based).

**`api_usage`** — daily per-endpoint usage counters with UNIQUE(api_key_id, date, endpoint).

**`api_logs`** — request logs with auto-cleanup guidance (pg_cron note in migration comments).

RLS policies:
- `api_keys`: Users can SELECT/INSERT/UPDATE/DELETE their own keys (where `developer_id = user_id text`). Since Firebase auth is used, RLS will use permissive policies scoped by the app logic. Admin reads all.
- `api_usage`: Read own usage. Edge function inserts via service role.
- `api_logs`: Read own logs. Edge function inserts via service role.

Since the app uses Firebase Auth (not Supabase Auth), RLS policies will be permissive for edge function operations (using service role key), and frontend queries will filter by the Firebase user ID.

### 2. Edge Function: `supabase/functions/public-api/index.ts`

Single Hono-based router handling:

| Route | Auth | Description |
|-------|------|-------------|
| `GET /v1/categories` | None | Returns provider type labels |
| `GET /v1/providers` | API Key | Query providers with filters |
| `GET /v1/providers/:id` | API Key | Single provider detail |
| `GET /v1/emergency` | API Key (no rate limit) | 24/7 verified providers |
| `GET /v1/pharmacies` | API Key | Verified pharmacies |
| `GET /v1/search` | API Key | Full-text search |

Middleware flow:
1. Extract `x-api-key` header
2. SHA-256 hash → lookup in `api_keys.key_hash`
3. Check `is_active`
4. Check daily usage in `api_usage` vs `rate_limit_per_day`
5. Upsert usage count, insert log entry
6. Add `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers

Response format: `{ success, data, meta }` or `{ success: false, error: { code, message } }`

Note: Provider data comes from localStorage/mock data on frontend, but the API will query the Firestore-sourced data. Since providers are stored in Firestore (not Supabase), the edge function will need to either:
- Query a Supabase `providers` table (if we mirror data), OR
- Return from a static/cached dataset

Given the current architecture uses Firestore for providers, the edge function will create a lightweight `providers_public` Supabase table that mirrors public provider data, or query Firestore directly. **Recommended**: Create a `providers_public` view/table in Supabase seeded from existing data, keeping the API self-contained.

Actually, looking more carefully at the codebase, providers are in localStorage mock data. The API will query this mock dataset server-side. We'll embed a reference dataset in the edge function or create a `providers_public` table. **Decision**: Create a `providers_public` Supabase table so the API has real queryable data.

### 3. Additional Migration: `providers_public` table

Minimal table with public-safe fields only:
- id, name, type, specialty, address, city, area, phone, lat, lng, is_verified, is_24h, is_open, rating, reviews_count, description, languages, image_url, created_at

### 4. Frontend Pages

#### `/developers` — Landing Page
- Hero: "Build with CityHealth API"
- 3 plan cards (Free/Basic/Pro)
- CTAs to login and docs
- No auth required

#### `/developers/dashboard` — Protected (Firebase Auth)
- App registration form (name, description)
- Key generation: `ch_live_` + `crypto.randomUUID()`, show once in modal
- Display: key_suffix, usage progress bar, 7-day chart (recharts), regenerate/deactivate buttons

#### `/developers/docs` — Public
- Sidebar nav documentation page
- Sections: Auth, Rate Limits, Endpoints, Error Codes
- Dark code blocks with curl/JS examples

### 5. Admin Dashboard Addition

New tab `api` in AdminSidebar with 3 sub-sections:
- **API Keys**: Table of developers, plan, usage, status
- **Usage Stats**: Global request charts
- **Logs**: Searchable log table

### 6. Config Updates

- `supabase/config.toml`: Add `[functions.public-api]` with `verify_jwt = false`
- `src/App.tsx`: Add routes for `/developers`, `/developers/dashboard`, `/developers/docs`

### Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create (4 tables + RLS) |
| `supabase/functions/public-api/index.ts` | Create |
| `src/pages/developers/DeveloperLandingPage.tsx` | Create |
| `src/pages/developers/DeveloperDashboardPage.tsx` | Create |
| `src/pages/developers/DeveloperDocsPage.tsx` | Create |
| `src/services/apiKeyService.ts` | Create |
| `src/components/admin/ApiManagementPanel.tsx` | Create |
| `src/components/admin/AdminSidebar.tsx` | Edit (add API tab) |
| `src/pages/AdminDashboard.tsx` | Edit (add API case) |
| `src/App.tsx` | Edit (add /developers routes) |

### Implementation Order
1. Database migration (4 tables)
2. Edge function with Hono router
3. API key service (frontend)
4. Developer portal pages (3 pages)
5. Admin API management panel
6. Route wiring in App.tsx + AdminSidebar

