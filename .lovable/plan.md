

## Plan: Fix symptom auto-send from homepage to AI assistant

### Problem

When clicking a symptom on the homepage, it navigates to `/medical-assistant?symptom=<translated_label>`. The AI assistant then tries to match that label against `SYMPTOM_CHIPS` labels. This fails because:

1. **Label mismatch**: Homepage uses `t('mobileHome', 'headache')` → "Mal de tête", but `SYMPTOM_CHIPS` has "Maux de tête"
2. **Fallback is weak**: When no match is found, it sends the raw label (e.g. "Mal de tête") instead of a proper medical query

### Solution

Use **symptom keys** (language-independent) instead of translated labels in the URL. Map each key to the appropriate `SYMPTOM_CHIPS` query in the current language.

### Changes

#### 1. `src/components/homepage/MobileHomeScreen.tsx`
- Change the navigate call to send the **symptom key** instead of the translated label:
  - `navigate(/medical-assistant?symptom=${symptomKeys[i]})` instead of `encodeURIComponent(s.label)`

#### 2. `src/components/medical-assistant/SymptomTriageBot.tsx`
- Export a mapping from symptom keys to chip indices: `{ headache: 2, nausea: 3, fever: 0, fatigue: -1, allergy: -1, breathing: 4, chestPain: 1 }`
- Update the `autoSendSymptom` effect to:
  1. First try matching by **key** against a key→query map
  2. Then fallback to label matching (existing behavior)
  3. For keys without a direct chip match (fatigue, allergy), construct a proper query in the current language (e.g. "J'ai de la fatigue" / "I feel fatigued" / "أعاني من إرهاق")

#### 3. Add fallback queries for unmapped symptoms in `SYMPTOM_CHIPS` area
- Add a `SYMPTOM_KEY_QUERIES` map that covers all 7 homepage symptom keys in all 3 languages, ensuring every homepage symptom produces a meaningful AI query regardless of language.

### Files to modify
1. `src/components/homepage/MobileHomeScreen.tsx` — send key instead of label
2. `src/components/medical-assistant/SymptomTriageBot.tsx` — match by key, add key→query mapping

