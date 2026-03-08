

## Plan: Redesign Contact Page

The current page is functional but plain — stacked cards with basic styling. Here's how to elevate it:

### 1. Hero Header with gradient background
Replace the simple icon+text header with a visually appealing hero section featuring a gradient background, larger typography, and a subtle description.

### 2. Contact Info as a horizontal scrollable row
Convert the 4 contact info items (Phone, Email, Address, Hours) from a vertical list inside a card to a **horizontal scroll strip** of compact, colorful mini-cards at the top — each with a distinct icon color. This gives immediate visibility to key info.

### 3. Improved Form with floating labels and better spacing
- Add `framer-motion` entrance animations to the form card
- Use a subtle gradient border or shadow on focus states
- Better visual hierarchy with section dividers

### 4. FAQ as an Accordion
Replace the static FAQ list with a proper **Radix Accordion** component (already installed) — collapsible items that save vertical space and feel more interactive.

### 5. Team section with avatars and social links
- Larger team cards with gradient backgrounds
- Add LinkedIn/GitHub icon links for each founder
- Animated entrance with staggered delays

### 6. Emergency card with pulsing animation
Add a subtle pulse animation to the emergency icon to draw attention.

### 7. Overall polish
- Add `motion.div` fade-in animations on each section (staggered)
- Bottom padding for mobile nav bar (`pb-24`)
- Consistent rounded-2xl cards matching Settings page style

### Files to modify
- **`src/pages/ContactPage.tsx`** — Full redesign with all improvements above

### Technical approach
- Import `Accordion` from `@radix-ui/react-accordion` (already installed)
- Import `motion` from `framer-motion` (already installed)
- Keep all existing `t()` translations and form logic intact
- No backend changes needed

