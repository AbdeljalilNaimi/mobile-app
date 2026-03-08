

## Plan: Follow-up Suggestion Chips After AI Responses

### 1. Create Edge Function `supabase/functions/suggest-followups/index.ts`

A lightweight edge function that takes conversation messages and returns 3 follow-up questions as a JSON array. Uses `google/gemini-2.5-flash-lite` (cheapest/fastest model) with a system prompt requesting exactly 3 short French questions. Returns default fallback on any error.

### 2. Update `src/components/medical-assistant/SymptomTriageBot.tsx`

**New state:**
- `suggestions: string[]` — current follow-up questions
- `suggestionsLoading: boolean` — show skeleton pills
- `suggestionsMessageIndex: number | null` — which message they belong to

**After AI response arrives (in `sendMessage`):**
- Set `suggestionsLoading = true`, show 3 skeleton pill placeholders
- Fire a non-blocking call to `suggest-followups` edge function with conversation history
- On success: parse JSON array, set `suggestions` (max 3)
- On failure: silently set `suggestions` to `["En savoir plus", "Quand consulter ?", "Trouver un médecin"]`
- Add 500ms delay before showing with fade-in animation
- Don't show suggestions after error messages

**Render suggestions** below the last assistant message bubble (inside the message loop, after urgency badge / doctor cards):
- Horizontally scrollable row of pill chips
- Styling: `bg-[#EFF6FF] text-[#1D4ED8]`, rounded-full (20px), `px-3.5 py-1.5`, `text-xs`
- On tap: fill input with question text AND auto-submit immediately via `sendMessage(question)`
- Clear suggestions when user sends any new message

**Skeleton state:** 3 pulsing gray rounded-full placeholders (w-24/w-28/w-20) while loading

### 3. Update `SuggestedQuestions.tsx`

Restyle to match new spec (blue pills instead of teal), or inline the rendering directly in SymptomTriageBot. Since the existing component isn't used in SymptomTriageBot, will inline the rendering for simplicity.

### Files
- **Create**: `supabase/functions/suggest-followups/index.ts`
- **Modify**: `src/components/medical-assistant/SymptomTriageBot.tsx`

