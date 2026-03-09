

## Plan: Simplify & Clean Up Medical Assistant Page

The current `/medical-assistant` page has a decent structure but can be made more minimal and clean. Here's what I'll change:

### Changes to `MedicalAssistantPage.tsx`
- **Header**: Simplify — remove the gradient emergency button, make it a subtle icon. Clean spacing, lighter feel.
- **Disclaimer bar**: Make it more subtle — reduce visual weight, use a single-line muted text without the icon background.
- **Background**: Use `bg-background` (white) instead of `bg-muted` for a cleaner look.
- **Guest banner**: Simplify to a minimal text link, less visual noise.

### Changes to `SymptomTriageBot.tsx`
- **Welcome state**: Cleaner typography — remove emoji from greeting, use lighter font weights, more whitespace.
- **Symptom chips**: Simplify to plain text pills without icon circles — just icon + label inline, remove the colored background circles. Use a softer border style.
- **Message bubbles**: Keep current rounded style but ensure consistent minimal aesthetic — remove shadows from assistant bubbles.
- **Input bar**: Simplify — remove backdrop blur, use clean white background with subtle border. Remove the glow/shadow effects on focus.
- **Typing indicator**: Use simpler dots without gradient avatars.
- **Suggestion chips**: Use `bg-muted` instead of `bg-primary/10` for a more neutral, minimal look.

### Changes to `SuggestedQuestions.tsx`
- Replace teal-colored chips with neutral muted styling to match minimal aesthetic.

### Changes to `TypingIndicator.tsx`
- Remove gradient avatar, use simple muted dots (this component may not be used directly but clean it up for consistency).

### Files modified
1. `src/pages/MedicalAssistantPage.tsx` — cleaner header, background, disclaimer
2. `src/components/medical-assistant/SymptomTriageBot.tsx` — minimal welcome, chips, bubbles, input
3. `src/components/medical-assistant/SuggestedQuestions.tsx` — neutral chip styling
4. `src/components/medical-assistant/TypingIndicator.tsx` — simplified styling

