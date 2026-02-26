# 🏥 CityHealth - Sidi Bel Abbès

> **La plateforme santé digitale pour Sidi Bel Abbès, Algérie**

CityHealth est une application web qui connecte les citoyens de Sidi Bel Abbès avec les professionnels de santé locaux. Elle propose une recherche intelligente, une carte interactive, et un assistant IA santé.

---

## 🚀 Tech Stack

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | React Context, TanStack Query |
| **Maps** | Leaflet (carte unifiée) |
| **Backend** | Firebase (Auth, Firestore, Storage, Functions) |
| **AI Chat** | Firebase Cloud Functions (SSE streaming) |
| **Testing** | Vitest, React Testing Library, Playwright |

---

## 🧪 Testing

### Run Unit Tests
```bash
npm run test          # Run all unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Run E2E Tests
```bash
npx playwright install  # First time setup
npm run test:e2e        # Run Playwright tests
```

### Test Structure
```
src/
├── contexts/AuthContext.test.tsx    # Auth tests
├── components/ProtectedRoute.test.tsx # Route guard tests
├── test/
│   ├── setup.ts                     # Test setup
│   ├── utils.tsx                    # Test utilities
│   ├── mocks/firebase.ts            # Firebase mocks
│   └── providerFiltering.test.ts    # Search logic tests
e2e/
└── provider-search.spec.ts          # E2E flow tests
```

---

## ✨ Fonctionnalités Actuelles

### 🔍 Recherche & Découverte
- Recherche avancée par type, spécialité, zone
- Carte interactive Leaflet avec 3 modes (providers, emergency, blood)
- Filtres par langue, accessibilité, disponibilité

### 🏥 9 Types de Prestataires
| Type | Description |
|------|-------------|
| `hospital` | Hôpitaux généraux |
| `birth_hospital` | Maternités |
| `clinic` | Cliniques privées |
| `doctor` | Cabinets médicaux |
| `pharmacy` | Pharmacies |
| `lab` | Laboratoires d'analyses |
| `blood_cabin` | Centres de don de sang |
| `radiology_center` | Centres de radiologie |
| `medical_equipment` | Équipement médical |

### 📝 Inscription Prestataires (6 étapes)
1. **Identité Elite** - Type de prestataire, email, mot de passe
2. **Informations de base** - Nom, numéro légal, contact
3. **Localisation** - Adresse, carte, horaires
4. **Services** - Catégories, spécialités, équipements
5. **Médias** - Logo, galerie, description
6. **Prévisualisation** - Score de profil, soumission

### 🤖 Assistant IA Santé
- Chat streaming en temps réel
- Orientation vers les services appropriés
- Conseils de santé généraux (non-médical)

### 🔐 Authentification
- Email/mot de passe (Firebase Auth)
- Google OAuth
- Rôles: `patient`, `provider`, `admin`

---

## 🛠️ Installation

### Prérequis
- Node.js 18+
- npm ou bun

### Setup Local

```bash
# 1. Cloner le repository
git clone <YOUR_GIT_URL>
cd cityhealth

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement (optionnel)
# Le projet fonctionne avec la config Firebase intégrée
# Pour un environnement personnalisé, créer .env.local:
cp .env.example .env.local

# 4. Lancer le serveur de développement
npm run dev
```

### Variables d'environnement (optionnel)

```env
# .env.local (exemple)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📁 Structure du Projet

```
cityhealth/
├── firebase-functions/          # Cloud Functions
│   └── ai-chat/                 # Fonction AI Chat (SSE)
├── public/
│   └── lovable-uploads/         # Assets uploadés
├── src/
│   ├── assets/                  # Images statiques
│   ├── components/
│   │   ├── admin/               # Composants admin (modération)
│   │   ├── homepage/            # Sections homepage
│   │   ├── layout/              # Header unifié
│   │   ├── map/                 # CityHealthMap (Leaflet centralisé)
│   │   ├── provider/
│   │   │   └── registration/    # 6 étapes d'inscription
│   │   ├── search/              # Interface de recherche
│   │   ├── trust/               # Badges vérification
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Firebase Auth
│   │   ├── RegistrationContext.tsx # État inscription
│   │   └── LanguageContext.tsx  # i18n (fr/ar)
│   ├── data/
│   │   └── providers.ts         # Mock data + localStorage
│   ├── hooks/                   # Custom hooks
│   ├── lib/
│   │   └── firebase.ts          # Config Firebase
│   ├── pages/                   # Routes principales
│   ├── services/                # API services
│   └── stores/                  # Zustand stores
├── firestore.rules              # Règles sécurité Firestore
├── firestore.indexes.json       # Index Firestore
├── storage.rules                # Règles Storage
└── firebase.json                # Config déploiement
```

---

## 🧪 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run lint         # Linting ESLint
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture technique détaillée |
| [ROUTES.md](./ROUTES.md) | Carte des routes et navigation |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Configuration Firebase |
| [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) | Suivi des migrations |

---

## 🔒 Sécurité

- **Authentification**: Firebase Auth (pas de localStorage pour tokens)
- **Base de données**: Firestore avec règles de sécurité
- **Stockage**: Firebase Storage avec règles par utilisateur
- **Prestataires non vérifiés**: Masqués de la recherche publique

---

## 🗺️ Roadmap

### ✅ Implémenté
- [x] Inscription prestataires 6 étapes avec scoring
- [x] Carte Leaflet unifiée (3 modes)
- [x] Firebase Auth (Email + Google)
- [x] Assistant IA Chat (placeholder)
- [x] Recherche avec filtres

### 🔜 À Venir
- [ ] Intégration paiement (Stripe/CIB)
- [ ] Notifications push
- [ ] Prise de rendez-vous en ligne
- [ ] Vidéo-consultation
- [ ] Application mobile (React Native)

---

## 👥 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour Sidi Bel Abbès**
