

## Plan: Persistent Conversation History for Medical Assistant

### Key Consideration
This project uses **Firebase Auth** (not Supabase Auth). User IDs are Firebase UIDs (text strings). RLS policies cannot use `auth.uid()` since users aren't authenticated via Supabase. Instead, tables will use `text` user_id columns and RLS will allow public access (matching the existing pattern used across all other tables in this project).

---

### 1. Database Migration — Create 2 tables

**`chat_conversations`**
- `id` uuid PK
- `user_id` text NOT NULL (Firebase UID)
- `title` text (first 40 chars of first message)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

**`chat_messages`**
- `id` uuid PK
- `conversation_id` uuid FK → chat_conversations(id) ON DELETE CASCADE
- `role` text NOT NULL ('user' or 'assistant')
- `content` text NOT NULL
- `created_at` timestamptz default now()

RLS: Same pattern as other tables (public read/write via `true` expressions, since Firebase handles auth).

---

### 2. Create `src/hooks/useChatHistory.ts`

Custom hook that encapsulates all persistence logic:
- `conversations` state, `currentConversationId` state
- `loadConversations()` — fetch all for current Firebase user, ordered by `updated_at` desc
- `loadConversation(id)` — fetch messages for a conversation, return them
- `saveMessage(role, content)` — if no current conversation, create one (title = first 40 chars of first user message), then insert message + update `updated_at`
- `deleteAllHistory()` — delete all conversations for user
- `startNewConversation()` — reset currentConversationId
- All DB errors are silently caught (don't interrupt chat)

---

### 3. Update `src/pages/MedicalAssistantPage.tsx`

- Add History button (clock icon) to header, left of PenSquare button
- Import `Drawer` components for bottom sheet
- Drawer content:
  - Title "Historique des conversations"
  - List of conversations with title (35 chars), relative date, chevron
  - Empty state: clock icon + "Aucune conversation sauvegardee"
  - "Effacer tout l'historique" red button with confirmation AlertDialog
  - Skeleton loading state
- Pass callbacks to SymptomTriageBot: `onMessageSent`, `onLoadConversation`
- If not authenticated: hide history button entirely

---

### 4. Update `src/components/medical-assistant/SymptomTriageBot.tsx`

- Accept new props: `onMessageSent?: (role, content) => void`, `initialMessages?: TriageMessage[]`
- After each message sent/received, call `onMessageSent(role, content)`
- When `initialMessages` changes, set messages state to it
- Keep all existing AI logic intact

---

### 5. Guest banner

- If user is not authenticated and messages exist, show a subtle banner below input:
  "Connectez-vous pour sauvegarder vos conversations" with "Se connecter" link to `/citizen/login`

---

### Files to create/modify
- **Migration**: Create `chat_conversations` and `chat_messages` tables
- **Create**: `src/hooks/useChatHistory.ts`
- **Modify**: `src/pages/MedicalAssistantPage.tsx` (history drawer, auth check, guest banner)
- **Modify**: `src/components/medical-assistant/SymptomTriageBot.tsx` (new props for save callbacks and initial messages)

