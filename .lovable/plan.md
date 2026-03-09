

# Plan : Test End-to-End et Corrections

## Problemes identifies par analyse du code

### 1. Route `/citizen/documents` manquante (ERREUR 404)
Le menu lateral (`SideDrawer.tsx` ligne 25) pointe vers `/citizen/documents`, mais aucune route ni page n'existe pour ce chemin. Cliquer sur "Documents" dans le menu affichera une page 404.

**Correction** : Modifier le chemin dans `SideDrawer.tsx` pour pointer vers `/service/documents` (la page ServiceLanding existante) au lieu de `/citizen/documents`.

### 2. Route `/emergency-card` sans token (ERREUR 404)
La homepage (`MobileHomeScreen.tsx` ligne 95) et le SideDrawer (ligne 166) pointent vers `/emergency-card`, mais la seule route existante est `/emergency-card/:token`. Sans token, c'est un 404.

**Correction** : Rediriger `/emergency-card` (sans token) vers la section carte de sante dans le profil citoyen (`/profile`) ou creer une route dediee.

### 3. Route `/carte` dans SideDrawer (ligne 23)
Le SideDrawer pointe vers `/carte` qui est redirige via `CarteRedirect` vers `/map`. Fonctionnel mais indirect.

**Correction** : Changer directement le chemin vers `/map` dans `SideDrawer.tsx`.

### 4. Pas d'erreurs JS detectees
- Console propre, aucune erreur reseau
- Animations marquee correctement configurees dans tailwind
- Filtres de recherche fonctionnels, alignes avec le data model `CityHealthProvider`
- Routes ServiceLandingPage et Blood Donation correctement configurees

## Changements a effectuer

| Fichier | Modification |
|---------|-------------|
| `src/components/layout/SideDrawer.tsx` | Changer `/citizen/documents` → `/service/documents`, `/carte` → `/map` |
| `src/App.tsx` | Ajouter route `/emergency-card` (sans token) qui redirige vers `/profile` |

## Resume
3 corrections mineures de navigation (liens morts / 404). Le reste de l'application (recherche, filtres, services, don de sang, menu, authentification) fonctionne correctement.

