

# Fix Dark Mode for `/medical-assistant`

## Problem
The Medical Assistant page and its SymptomTriageBot component use **hardcoded light-mode colors** via inline `style` attributes (e.g., `backgroundColor: "#F8F9FA"`, `backgroundColor: "white"`, `border: "1px solid #E5E7EB"`). These don't respond to dark mode at all.

## Files to Change

### 1. `src/pages/MedicalAssistantPage.tsx`
Replace all hardcoded inline styles with Tailwind dark-mode-aware classes:
- Root `div`: `style={{ backgroundColor: "#F8F9FA" }}` → `bg-muted`
- Header: `bg-white border-b` with hardcoded border → `bg-card border-b border-border`
- Bot icon color `#1D4ED8` → `text-primary`
- Online dot `#22C55E` → `bg-green-500`
- Gray text `#9CA3AF` → `text-muted-foreground`
- Hover states `hover:bg-black/5` → `hover:bg-muted`
- Disclaimer bar `#F8F9FA` → `bg-muted`
- Chat area `bg-white` → `bg-card`
- Guest banner `#EFF6FF` → `bg-primary/10 dark:bg-primary/20`
- History drawer items: replace inline colors with semantic classes
- History empty state icon bg `#F3F4F6` → `bg-muted`
- Delete button border `#F3F4F6` → `border-border`

### 2. `src/components/medical-assistant/SymptomTriageBot.tsx`
Replace all hardcoded inline styles:
- Welcome text colors → `text-muted-foreground`, `text-foreground`
- Symptom chips: `bg-white` with border → `bg-card border border-border`
- Chip icon container `#EFF6FF` → `bg-primary/10`
- Chip icon color `#1D4ED8` → `text-primary`
- Assistant message bubbles: `backgroundColor: "white"` → `bg-card` with `border-border`
- User message bubbles: keep `bg-primary text-white`
- Typing indicator: same pattern as assistant bubbles
- Suggestion chips: `#EFF6FF` → `bg-primary/10 dark:bg-primary/20`, border `#BFDBFE` → `border-primary/30`
- Input bar container `#F8F9FA` → `bg-muted`
- Input field `bg-white` → `bg-card`
- Send button inactive `#E5E7EB` → `bg-muted`
- No-specialist warning box: add dark variant `dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700`
- Timestamps `#9CA3AF` → `text-muted-foreground`

### 3. `src/components/medical-assistant/ChatMessage.tsx`
Already mostly uses Tailwind classes — minor check, likely fine.

## Approach
Convert all inline `style={{ color/backgroundColor }}` to Tailwind utility classes using the existing design tokens (`bg-card`, `bg-muted`, `text-muted-foreground`, `text-primary`, `border-border`, etc.) which already have dark mode variants defined in `index.css`.

