

# Plan: Unifier les 3 cartes en une seule

## Situation actuelle
L'app a 3 routes séparées (`/map/providers`, `/map/emergency`, `/map/blood`) chacune rendant un composant enfant différent dans `MapMother` via `<Outlet />`. Chaque enfant charge ses propres données et gère ses propres marqueurs indépendamment.

## Approche
Remplacer les 3 enfants par **un seul composant `UnifiedMapChild`** qui charge toutes les données et utilise un **toggle de mode** (chips en haut) pour filtrer l'affichage. La route unique sera `/map`.

## Changements

### 1. Nouveau composant `src/components/map/children/UnifiedMapChild.tsx`
- Charge les 3 sources de données en parallèle : `useVerifiedProviders()`, `useEmergencyProviders()`, `useBloodCenters()`
- Ajoute un **sélecteur de mode** flottant en haut (chips/pills) : `Tous` | `Urgences` | `Don de sang`
  - `Tous` : affiche tous les prestataires vérifiés (comportement actuel de ProvidersMapChild, avec recherche + filtres)
  - `Urgences` : filtre uniquement les providers urgence + affiche le bandeau rouge SAMU
  - `Don de sang` : filtre les centres de don + affiche le bandeau rose
- Conserve la barre de recherche + filtres de ProvidersMapChild (visible en mode "Tous", masquée dans les autres modes)
- Le bottom sheet du provider sélectionné reste identique (déjà partagé visuellement)
- Les marqueurs sont gérés dans un seul `MarkerClusterGroup`

### 2. Mise à jour `src/App.tsx`
- Remplacer les 3 sous-routes par une seule :
  ```
  <Route path="/map" element={<MapMother />}>
    <Route index element={<UnifiedMapChild />} />
  </Route>
  ```
- Ajouter des redirects : `/map/providers`, `/map/emergency`, `/map/blood` → `/map`
- Mettre à jour `CarteRedirect` pour pointer vers `/map`

### 3. Mise à jour `src/components/map/MapMother.tsx`
- Supprimer le calcul du `mode` basé sur le pathname (plus nécessaire)
- Garder le reste intact (route polylines, user marker, controls)

### 4. Mise à jour des liens dans l'app
- HomePage, navigation, etc. : remplacer `/map/providers` → `/map`, `/map/emergency` → `/map?mode=emergency`, `/map/blood` → `/map?mode=blood`
- Le query param `mode` sera lu par `UnifiedMapChild` pour pré-sélectionner le bon mode au chargement

### 5. Nettoyage
- Supprimer `ProvidersMapChild.tsx`, `EmergencyMapChild.tsx`, `BloodMapChild.tsx` (code intégré dans UnifiedMapChild)

## UX du sélecteur de mode
```text
┌─────────────────────────────────┐
│  [ Tous ]  [ 🚨 Urgences ]  [ 🩸 Sang ]  │  ← pills flottantes
├─────────────────────────────────┤
│  [🔍 Rechercher...        ⚙️]  │  ← visible en mode "Tous"
│  OU                             │
│  [🚨 Urgences → appelez 15  📞]│  ← bandeau mode urgence
│  OU                             │
│  [🩸 Disponibilité selon stock] │  ← bandeau mode sang
└─────────────────────────────────┘
```

