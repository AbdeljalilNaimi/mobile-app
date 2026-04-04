# CityHealth - Algerian Healthcare Platform

## Overview
CityHealth is a comprehensive healthcare platform for Algeria supporting citizens, healthcare providers (doctors, clinics, hospitals, pharmacies, labs), and administrators.

## Architecture

### Stack
- **Frontend**: React + TypeScript + Vite (port 5000)
- **Backend**: Express.js API server (port 3001)
- **Database**: Replit PostgreSQL (28 tables, initialized via `server/schema.sql`)
- **Authentication**: Firebase Auth (ID tokens verified server-side via Google tokeninfo endpoint)
- **File Storage**: Local `uploads/` directory via multer

### Key Directories
- `src/` - React frontend
- `server/` - Express backend
  - `server/index.ts` - Main Express app entry point
  - `server/db.ts` - PostgreSQL connection pool
  - `server/middleware/auth.ts` - Firebase token verification
  - `server/routes/` - All API route handlers
  - `server/schema.sql` - Full database schema
- `src/lib/apiClient.ts` - Frontend API client (replaces Supabase client)
- `src/services/` - Frontend service layer
- `src/hooks/` - React hooks

### API Routes
All routes mounted at `/api/`:
- `/api/community` - Community posts & comments
- `/api/blood-emergency` - Blood emergency coordination
- `/api/reviews` - Provider reviews
- `/api/ads` - Provider advertisements
- `/api/research` - Research articles
- `/api/api-keys` - Developer API key management
- `/api/chat` - Chat conversations
- `/api/emergency-card` - Emergency health cards
- `/api/notification-prefs` - Notification preferences
- `/api/public` - Public API endpoints
- `/api/storage` - File uploads
- `/api/ai` - AI chat endpoints (uses Gemini via Lovable AI Gateway)
- `/api/homepage` - Homepage data aggregation
- `/api/providers` - Provider management & quote requests
- `/api/admin` - Admin moderation
- `/api/notifications` - Push notification dispatch

### Development
- Run: `npm run dev` (starts both Vite on port 5000 and Express on port 3001 concurrently)
- Vite proxies `/api` and `/uploads` to Express on port 3001

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (Replit managed)
- `FIREBASE_PROJECT_ID` - Firebase project ID for auth verification
- `LOVABLE_API_KEY` - AI Gateway key for Gemini AI features

### Migration Notes (Lovable → Replit)
- Replaced Supabase client with direct PostgreSQL queries (pg Pool)
- Replaced Supabase Edge Functions with Express routes
- Replaced Supabase realtime with polling intervals
- Firebase auth kept as-is
- File storage moved from Supabase Storage to local `uploads/` directory
