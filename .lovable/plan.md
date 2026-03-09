

# Plan: Update Side Menu Links to External Platform URLs

## Current State
The `platformLinks` in `SideDrawer.tsx` point to internal `/service/*` routes. These need to point to the correct external platform pages on `cityhealth-dz.lovable.app`.

## Changes

### `src/components/layout/SideDrawer.tsx`

Update `platformLinks` array (lines 30-37):

| Current Label | Current Path | New Path |
|---|---|---|
| Articles & Recherche | `/service/articles-recherche` | `https://cityhealth-dz.lovable.app/research` |
| Don de Sang | `/blood-donation` | `https://cityhealth-dz.lovable.app/blood-donation` |
| Don Gratuit | `/service/don-gratuit` | `https://cityhealth-dz.lovable.app/citizen/provide` |
| Documents | `/service/documents` | `https://cityhealth-dz.lovable.app/docs` |
| Tarifs Providers | `/service/tarifs-providers` | `https://cityhealth-dz.lovable.app/tarifs` |
| API Developer | `/service/api-developer` | Keep or remove (no URL provided) |

Also add new menu items for the remaining URLs:
- **FAQ** → `https://cityhealth-dz.lovable.app/faq`
- **Privacy** → `https://cityhealth-dz.lovable.app/privacy`
- **Terms** → `https://cityhealth-dz.lovable.app/terms`

Since these are **external links**, the navigation handler (`go()`) which uses `navigate()` won't work. Need to:
1. Add an `external?: boolean` flag to link items
2. For external links, use `window.open()` or `<a>` tag instead of `navigate()`
3. Show an `ExternalLink` icon indicator on external items

### Implementation Detail
- Add `external: true` and full URL to each platform link
- Modify the `go()` function or render logic to handle external vs internal links
- Add FAQ, Privacy, Terms as a third "Legal" section or append to platform section

