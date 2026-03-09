

## Plan: Refresh Medical Assistant UI

### Changes

#### 1. MedicalAssistantPage.tsx — Disclaimer banner
- Change amber/warning colors to **red** (`bg-red-50`, `text-red-600`, `border-red-200`)
- Add a dismissible **X** button to close/hide the banner (state: `showDisclaimer`)
- Make header more vivid: add a subtle **gradient background** (`bg-gradient-to-br from-primary/5 via-background to-cyan-50`)

#### 2. SymptomTriageBot.tsx — Symptom grid & background
- **Reduce** symptom chips from 12 to **6** (keep: Fièvre, Douleur thoracique, Maux de tête, Difficultés resp., Santé mentale, Trouver médecin) for all languages
- Add a **colorful background** to the chat area: light gradient (`bg-gradient-to-b from-primary/5 via-background to-background`)
- Give symptom buttons more color: each chip gets a unique **pastel icon background** (red for heart, blue for brain, green for breathing, etc.) instead of uniform `bg-primary/10`
- Shrink suggestion chips styling slightly (already `text-[11px]`, keep as-is)

#### 3. Header redesign
- Add gradient accent to header: `bg-gradient-to-r from-primary/10 to-cyan-500/10` with colored Bot icon
- Make the "En ligne" dot pulse with `animate-pulse`

### Files modified
1. `src/pages/MedicalAssistantPage.tsx`
2. `src/components/medical-assistant/SymptomTriageBot.tsx`

