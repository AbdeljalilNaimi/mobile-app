

# Plan: Add Missing Sections to Home Screen

## Missing Pages Not Linked from Home

| Page | Route | Proposed Section |
|---|---|---|
| **Contact** | `/contact` | Quick Access list |
| **Urgences** | `/emergency` | Quick Access list |
| **Entraide citoyenne** | `/citizen/provide` | New section "Entraide" |
| **FAQ** | `/faq` | Quick Access list |
| **Réglages** | `/settings` | Quick Access list |
| **Carte don de sang** | `/map/blood` | Add to urgent banner or quick actions |

## Changes to `MobileHomeScreen.tsx`

### 1. Expand Quick Actions (4 → 5 or add second row)
Add `/emergency` as a 5th quick action, or replace one with it since `/map/emergency` already exists but `/emergency` (the guide page) is different.

### 2. New Section: "Entraide" (between Community and Quick Access)
A horizontal scroll of cards linking to `/citizen/provide` — community help offers (transport, accompaniment, etc.). Same style as health services cards.

### 3. Expand Quick Access list
Add these items to the existing `quickAccess` array:
- **Urgences** → `/emergency` (icon: `Siren`, subtitle: "Guide & numéros utiles")
- **Contact** → `/contact` (icon: `Phone`, subtitle: "Nous contacter")
- **FAQ** → `/faq` (icon: `HelpCircle`, subtitle: "Questions fréquentes")
- **Réglages** → `/settings` (icon: `Settings`, subtitle: "Préférences & compte")

### 4. Update Blood Donation banner
Add a small secondary link to `/map/blood` inside the existing blood donation banner, e.g. "Voir la carte" chip.

## No new files needed
All changes are in `src/components/homepage/MobileHomeScreen.tsx` — adding imports for new icons (`Phone`, `HelpCircle`, `Settings as SettingsIcon`, `Handshake`) and expanding the data arrays + adding one new section block.

