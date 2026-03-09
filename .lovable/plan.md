

## Plan: Create Side Navigation Drawer

### Overview
Replace the current Menu button behavior (navigates to `/settings`) with a Sheet-based side drawer matching the reference image's clean, minimal layout.

### New Component: `src/components/layout/SideDrawer.tsx`

**Structure (top to bottom):**

1. **Profile Section** — Circular avatar (with ring), user name, email. QR code icon/button next to profile info (links to `/emergency-card`). Guest state shows "Se connecter" button.

2. **App Services Section** — Label: "Services"
   - Accueil `/`
   - Doctors `/search`
   - Carte `/map`
   - AI Assistance `/medical-assistant`
   - Documents `/citizen/documents`
   - Profile `/profile`
   - Contact `/contact`

3. **Platform Services Section** — Label: "Plateforme", with separator
   - Don gratuit `/citizen/provide`
   - Avis & Idées `/community`
   - Publicitaire `/annonces`
   - API Developer `/docs`

4. **Bottom Section**
   - Language switcher (FR / EN / AR toggle buttons using `useLanguage`)
   - "Visiter notre plateforme" link → `https://preview--cityhealth-dz.lovable.app/`
   - App version text

**Styling:**
- White background, no heavy shadows
- Active item: soft rounded `bg-primary/10 text-primary` pill (matching reference)
- Clean lucide icons (20px), muted color for inactive items
- Subtle `border-b` dividers between sections

### Changes to `MobileHomeScreen.tsx`
- Add `useState` for drawer open/close
- Replace `onClick={() => navigate('/settings')}` on Menu button with `onClick={() => setDrawerOpen(true)}`
- Import and render `<SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />`

### Uses existing
- `Sheet` / `SheetContent` (side="left") from `@/components/ui/sheet`
- `useAuth` for profile/user data
- `useLanguage` for language switching
- `useLocation` for active state detection
- `qrcode.react` already installed for QR element

