// Centralized mock data and localStorage utilities for CityHealth
// NOTE: This is a frontend-only data layer for the MVP (no backend)

// Expanded Provider Types for Algeria Healthcare System
export type ProviderType = 
  | 'doctor' 
  | 'clinic' 
  | 'pharmacy' 
  | 'lab' 
  | 'hospital'
  | 'birth_hospital'
  | 'blood_cabin'
  | 'radiology_center'
  | 'medical_equipment';

export type Lang = 'ar' | 'fr' | 'en';

// Import from canonical source (re-exported for backwards compatibility)
import type { VerificationStatus as VerificationStatusType } from '@/types/provider';
export type VerificationStatus = VerificationStatusType;

// Opening hours for a day
export interface DaySchedule {
  open: string;
  close: string;
  closed?: boolean;
}

// Weekly schedule
export interface WeeklySchedule {
  lundi?: DaySchedule;
  mardi?: DaySchedule;
  mercredi?: DaySchedule;
  jeudi?: DaySchedule;
  vendredi?: DaySchedule;
  samedi?: DaySchedule;
  dimanche?: DaySchedule;
}

// Review for a provider
export interface ProviderReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CityHealthProvider {
  id: string;
  name: string;
  type: ProviderType;
  specialty?: string;
  rating: number;
  reviewsCount: number;
  distance: number; // km from city center (mocked)
  /** @deprecated Use verificationStatus === 'verified' via isProviderVerified() utility */
  verified: boolean;
  emergency: boolean;
  accessible: boolean;
  isOpen: boolean;
  address: string;
  city: string;
  area: string;
  phone: string;
  image: string;
  lat: number;
  lng: number;
  languages: Lang[];
  description: string;
  
  // ========== VERIFICATION FIELDS ==========
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  verificationRevokedAt?: Date | string;
  verificationRevokedReason?: string;
  
  // ========== TYPE-SPECIFIC FIELDS ==========
  bloodTypes?: string[];
  urgentNeed?: boolean;
  stockStatus?: 'critical' | 'low' | 'normal' | 'high';
  imagingTypes?: string[];
  // Medical equipment specific
  productCategories?: string[];
  rentalAvailable?: boolean;
  deliveryAvailable?: boolean;
  
  // ========== HOSPITAL-SPECIFIC FIELDS ==========
  ambulancePhone?: string;
  receptionPhone?: string;
  adminPhone?: string;
  waitTimeMinutes?: number | null;
  waitTimeUpdatedAt?: string | null;
  departmentSchedules?: Record<string, { open: string; close: string }>;
  landmarkDescription?: string;
  
  // ========== MATERNITY-SPECIFIC FIELDS ==========
  maternityEmergencyPhone?: string;
  deliveryRooms?: number | null;
  maternityServices?: string[];
  femaleStaffOnly?: boolean;
  pediatricianOnSite?: boolean;
  visitingHoursPolicy?: string;
  hasNICU?: boolean;
  
  // ========== CLINIC-SPECIFIC FIELDS ==========
  consultationRooms?: number | null;
  surgeriesOffered?: string[];
  doctorRoster?: Array<{ name: string; specialty: string }>;
  paymentMethods?: string[];
  parkingAvailable?: boolean;
  
  // ========== DOCTOR-SPECIFIC FIELDS ==========
  medicalSchool?: string;
  graduationYear?: number | null;
  yearsOfExperience?: number | null;
  secondarySpecialty?: string;
  homeVisitZone?: string;
  teleconsultationPlatform?: string;
  ordreMedecinsNumber?: string;
  trainedAbroad?: boolean;
  trainingCountry?: string;
  womenOnlyPractice?: boolean;
  patientTypes?: string[];
  
  // ========== PROFILE FIELDS - CANONICAL NAMES ==========
  /** Gallery images - CANONICAL (not galleryImages) */
  gallery?: string[];
  schedule?: WeeklySchedule | null;
  reviews?: ProviderReview[];
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
  departments?: string[];
  /** Consultation fee (can be number or null) */
  consultationFee?: number | null;
  /** Accepted insurances - CANONICAL (not insuranceAccepted) */
  insurances?: string[];
  /** @deprecated Use insurances instead */
  insuranceAccepted?: string[];
  website?: string | null;
  email?: string | null;
  /** Service categories - CANONICAL (not serviceCategories) */
  services?: string[];
  specialties?: string[];
  accessibilityFeatures?: string[];
  equipment?: string[];
  
  // ========== IDENTITY FIELDS (Sensitive) ==========
  legalRegistrationNumber?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  postalCode?: string;
  facilityNameFr?: string;
  facilityNameAr?: string;
  
  // ========== CATEGORY FIELDS ==========
  /** Parent category: care, diagnosis, or specialized */
  providerCategory?: 'care' | 'diagnosis' | 'specialized';
  /** Flexible key-value store for category-specific data */
  specificFeatures?: Record<string, any>;
  
  // ========== ADDITIONAL BUSINESS FIELDS ==========
  homeVisitAvailable?: boolean;
  is24_7?: boolean;
  
  // ========== CATEGORY-SPECIFIC FIELDS ==========
  // Care (Soins & Consultations)
  emergencyCapable?: boolean;
  consultationTypes?: string[];
  numberOfBeds?: number | null;
  hasReanimation?: boolean;
  operatingBlocks?: number | null;
  // Diagnosis (Laboratoire, Radiologie)
  analysisTypes?: string[];
  homeCollection?: boolean;
  onlineResults?: boolean;
  turnaroundHours?: number | null;
  // Pharmacy
  isPharmacieDeGarde?: boolean;
  pharmacyServices?: string[];
  pharmacyDeliveryAvailable?: boolean;
  pharmacyDeliveryZone?: string;
  pharmacyDeliveryFee?: string;
  pharmacyDeliveryHours?: string;
  pharmacyDutyPhone?: string;
  pharmacyNightBell?: boolean;
  pharmacyGardeSchedule?: Array<{ id: string; startDate: string; endDate: string; note: string }>;
  pharmacyStockInfo?: string;
  // Blood Cabin
  bloodStockLevels?: Record<string, string>;
  urgentBloodType?: string;
  bloodCabinWalkInAllowed?: boolean;
  donationCampaigns?: Array<{ id: string; title: string; date: string; location: string; description: string }>;
  mobileDonationUnits?: Array<{ id: string; name: string; schedule: string; area: string }>;
  donationPreparationGuidelines?: string;
  minDaysBetweenDonations?: number | null;
  totalDonationsReceived?: number | null;
  // Medical Equipment
  equipmentBusinessTypes?: string[];
  installationAvailable?: boolean;
  catalogPdfUrl?: string;
  equipmentCatalog?: Array<{ id: string; name: string; category: string; salePrice: number | null; rentalPricePerDay: number | null; availableFor: string; prescriptionRequired: boolean; cnasReimbursable: boolean; stockStatus: string; brand: string }>;
  equipmentBrands?: string[];
  maintenanceServiceAvailable?: boolean;
  technicalSupportAvailable?: boolean;
  technicalSupportPhone?: string;
  equipmentDeliveryZone?: string;
  equipmentDeliveryFee?: string;

  // Lab enhanced
  labTestCatalog?: Array<{ id: string; name: string; category: string; priceMin: number | null; priceMax: number | null; turnaround: string; prescriptionRequired: boolean; fastingRequired: boolean; cnasCovered: boolean }>;
  labResultDeliveryMethods?: string[];
  labAppointmentRequired?: boolean;
  labAccreditations?: string[];
  labFastingInfoNote?: string;
  homeCollectionZone?: string;
  homeCollectionFee?: string;

  // Radiology enhanced
  radiologyExamCatalog?: Array<{ id: string; name: string; imagingType: string; priceMin: number | null; priceMax: number | null; turnaround: string; prescriptionRequired: boolean; preparationInstructions: string; cnasCovered: boolean }>;
  radiologyResultDeliveryMethods?: string[];
  radiologyAppointmentRequired?: boolean;
  radiologyAccreditations?: string[];
  radiologistOnSite?: boolean;

  // ========== PLAN TYPE ==========
  planType?: 'basic' | 'standard' | 'premium';

  // ========== ACCOUNT SETTINGS ==========
  settings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    appointmentReminders?: boolean;
    marketingEmails?: boolean;
    showPhoneOnProfile?: boolean;
    showEmailOnProfile?: boolean;
    allowReviews?: boolean;
    language?: string;
  };
}

// Provider Type Labels (French/Arabic/English)
export const PROVIDER_TYPE_LABELS: Record<ProviderType, { fr: string; ar: string; en: string; icon: string }> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', en: 'Hospital', icon: '🏥' },
  birth_hospital: { fr: 'Maternité', ar: 'مستشفى الولادة', en: 'Maternity', icon: '👶' },
  clinic: { fr: 'Clinique', ar: 'عيادة', en: 'Clinic', icon: '🏨' },
  doctor: { fr: 'Cabinet Médical', ar: 'عيادة طبية', en: 'Medical Office', icon: '👨‍⚕️' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', en: 'Pharmacy', icon: '💊' },
  lab: { fr: 'Laboratoire d\'Analyses', ar: 'مختبر التحاليل', en: 'Laboratory', icon: '🔬' },
  blood_cabin: { fr: 'Centre de Don de Sang', ar: 'مركز التبرع بالدم', en: 'Blood Donation Center', icon: '🩸' },
  radiology_center: { fr: 'Centre de Radiologie', ar: 'مركز الأشعة', en: 'Radiology Center', icon: '📷' },
  medical_equipment: { fr: 'Équipement Médical', ar: 'معدات طبية', en: 'Medical Equipment', icon: '🦽' },
};

export const SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Pédiatrie',
  'Gynécologie',
  'Ophtalmologie',
  'Dentisterie',
  'Radiologie',
  'Analyses médicales',
];

export const PROVIDER_TYPES: ProviderType[] = [
  'doctor',
  'clinic',
  'pharmacy',
  'lab',
  'hospital',
  'birth_hospital',
  'blood_cabin',
  'radiology_center',
  'medical_equipment',
];

export const AREAS = [
  'Centre Ville',
  'Hay El Badr',
  'Sidi Bel Abbès Est',
  'Sidi Bel Abbès Ouest',
  'Périphérie Nord',
  'Périphérie Sud',
];

const STORAGE_KEYS = {
  providers: 'ch_providers_v2',
  favorites: 'ch_favorites_v1',
}

function randomFrom<T>(arr: T[], i: number) {
  return arr[i % arr.length]
}

function pseudoRandom(i: number, min: number, max: number) {
  // deterministic pseudo-random based on index
  const x = Math.sin(i + 1) * 10000
  const frac = x - Math.floor(x)
  return Math.round((min + frac * (max - min)) * 10) / 10
}

function genPhone(i: number) {
  const a = 48
  const b = 50 + (i % 50)
  const c = 10 + (i % 40)
  const d = 10 + ((i * 3) % 40)
  return `+213 ${a} ${b.toString().padStart(2, '0')} ${c.toString().padStart(2, '0')} ${d.toString().padStart(2, '0')}`
}

const PROVIDER_IMAGES: Record<string, string[]> = {
  doctor: [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
  ],
  clinic: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&h=200&fit=crop',
  ],
  pharmacy: [
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1631549916768-4b9518a96b02?w=200&h=200&fit=crop',
  ],
  lab: [
    'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200&h=200&fit=crop',
  ],
  hospital: [
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=200&h=200&fit=crop',
  ],
};

function getDefaultProviderImage(type: string, index: number): string {
  const images = PROVIDER_IMAGES[type] || PROVIDER_IMAGES.doctor;
  return images[index % images.length];
}

function makeName(type: ProviderType, specialty: string | undefined, i: number): string {
  switch (type) {
    case 'doctor':
      return `Dr. ${['Ahmed', 'Sara', 'Youssef', 'Imen', 'Nadia', 'Khaled', 'Rania'][i % 7]} ${['Benali', 'Bendaoud', 'Merabet', 'Saadi', 'Zerrouki'][i % 5]}${specialty ? ' - ' + specialty : ''}`
    case 'clinic':
      return `Clinique ${['El Amal', 'El Chifa', 'Ibn Sina', 'An Nasr', 'El Rahma'][i % 5]}`
    case 'pharmacy':
      return `Pharmacie ${['Centrale', 'El Fajr', 'El Baraka', 'El Wafa'][i % 4]}`
    case 'lab':
      return `Laboratoire ${['Atlas', 'Pasteur', 'BioLab', 'El Yakine'][i % 4]}`
    case 'hospital':
      return `Hôpital ${['Universitaire', 'Régional', 'Privé Al Hayat'][i % 3]}`
    case 'birth_hospital':
      return `Maternité ${['El Amel', 'El Hayat', 'Ibn Rochd'][i % 3]}`
    case 'blood_cabin':
      return `Centre de Don ${['Central', 'Nord', 'Sud', 'Est'][i % 4]}`
    case 'radiology_center':
      return `Centre Radio ${['El Nour', 'Atlas', 'El Chifa'][i % 3]}`
    case 'medical_equipment':
      return `Équipement Médical ${['SantéPlus', 'MedEquip', 'AlgériaMed'][i % 3]}`
    default:
      return `Établissement ${i + 1}`
  }
}

function makeDescription(type: ProviderType): string {
  const base = 'Service de santé de confiance à Sidi Bel Abbès, avec une équipe dédiée et des équipements modernes.';
  switch (type) {
    case 'doctor':
      return base + ' Consultation sur rendez-vous, suivi personnalisé et prévention.';
    case 'clinic':
      return base + ' Prise en charge pluridisciplinaire et urgences mineures.';
    case 'pharmacy':
      return base + " Conseils pharmaceutiques, disponibilité 24/7 pour certaines officines.";
    case 'lab':
      return base + ' Analyses médicales rapides et précises, résultats numériques.';
    case 'hospital':
    case 'birth_hospital':
      return base + " Plateaux techniques complets et services d'urgences 24/7.";
    default:
      return base;
  }
}



      return base + ' Prise en charge pluridisciplinaire et urgences mineures.'
    case 'pharmacy':
      return base + ' Conseils pharmaceutiques, disponibilité 24/7 pour certaines officines.'
    case 'lab':
      return base + ' Analyses médicales rapides et précises, résultats numériques.'
    case 'hospital':
      return base + ' Plateaux techniques complets et services d’urgences 24/7.'
  }
}

export function generateMockProviders(count = 50): CityHealthProvider[] {
  const centerLat = 35.1975;
  const centerLng = -0.6300;
  const list: CityHealthProvider[] = [];
  
  // First, add dedicated ophthalmologists to ensure coverage
  const dedicatedDoctors: Array<{ name: string; specialty: string; area: string }> = [
    { name: "Dr. Amina Belkacemi - Ophtalmologie", specialty: "Ophtalmologie", area: "Centre Ville" },
    { name: "Dr. Rachid Mesbah - Ophtalmologie", specialty: "Ophtalmologie", area: "Hay El Badr" },
    { name: "Dr. Fatima Cherif - Cardiologie", specialty: "Cardiologie", area: "Centre Ville" },
    { name: "Dr. Omar Boudiaf - Pédiatrie", specialty: "Pédiatrie", area: "Sidi Bel Abbès Est" },
  ];

  dedicatedDoctors.forEach((doc, idx) => {
    const i = count + idx;
    const lat = centerLat + (pseudoRandom(i, -0.02, 0.02) as number);
    const lng = centerLng + (pseudoRandom(i + 3, -0.02, 0.02) as number);
    list.push({
      id: `doc-${idx + 1}`,
      name: doc.name,
      type: 'doctor',
      specialty: doc.specialty,
      rating: 4.5 + (idx % 3) * 0.2,
      reviewsCount: 30 + idx * 15,
      distance: pseudoRandom(i, 0.5, 5),
      verified: true,
      emergency: false,
      accessible: true,
      isOpen: true,
      address: `${10 + idx} Boulevard de la Santé, ${doc.area}`,
      city: 'Sidi Bel Abbès',
      area: doc.area,
      phone: genPhone(i),
      image: getDefaultProviderImage('doctor', i),
      lat,
      lng,
      languages: ['fr', 'ar'],
      description: `Spécialiste en ${doc.specialty} à Sidi Bel Abbès. Consultation sur rendez-vous, suivi personnalisé.`,
      verificationStatus: 'verified',
      isPublic: true,
    });
  });

  for (let i = 0; i < count; i++) {
    const type = randomFrom(PROVIDER_TYPES, i);
    const specialty = type === 'doctor' ? randomFrom(SPECIALTIES, i) : (type === 'lab' ? 'Analyses médicales' : (type === 'pharmacy' ? 'Pharmacie' : undefined));
    const rating = Math.min(5, Math.max(3.6, 3.5 + (i % 15) * 0.1 + (i % 3) * 0.05));
    const distance = pseudoRandom(i, 0.3, 18);
    const lat = centerLat + (pseudoRandom(i, -0.03, 0.03) as number);
    const lng = centerLng + (pseudoRandom(i + 3, -0.03, 0.03) as number);
    const verified = i % 3 !== 0;
    const emergency = type === 'hospital' || type === 'birth_hospital' || (i % 17 === 0);
    const accessible = i % 4 !== 0;
    const isOpen = i % 5 !== 0;
    const area = randomFrom(AREAS, i);
    const languages: Lang[] = (() => { const arr: Lang[] = ['fr']; if (i % 2 === 0) arr.push('ar'); if (i % 5 === 0) arr.push('en'); return arr; })();
    
    // Default to verified for mock data display
    const verificationStatus: VerificationStatus = verified ? 'verified' : 'pending';
    const isPublic = verificationStatus === 'verified';

    const item: CityHealthProvider = {
      id: (i + 1).toString(),
      name: makeName(type, specialty, i),
      type,
      specialty,
      rating: Math.round(rating * 10) / 10,
      reviewsCount: 20 + (i % 120),
      distance,
      verified,
      emergency,
      accessible,
      isOpen,
      address: `${1 + (i % 90)} Rue principale, ${area}`,
      city: 'Sidi Bel Abbès',
      area,
      phone: genPhone(i),
      image: getDefaultProviderImage(type, i),
      lat,
      lng,
      languages,
      description: makeDescription(type),
      verificationStatus,
      isPublic,
      // Type-specific fields for blood_cabin
      ...(type === 'blood_cabin' ? {
        bloodTypes: ['A+', 'B+', 'O+', 'AB+'].slice(0, (i % 4) + 1),
        urgentNeed: i % 7 === 0,
        stockStatus: (['normal', 'low', 'critical', 'high'] as const)[i % 4],
      } : {}),
      // Type-specific fields for radiology_center
      ...(type === 'radiology_center' ? {
        imagingTypes: ['Radiographie standard', 'Scanner (CT)', 'Échographie'].slice(0, (i % 3) + 1),
      } : {}),
    };
    list.push(item);
  }
  return list;
}

export function seedProvidersIfNeeded(count = 50) {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.providers)
    if (!existing) {
      const gen = generateMockProviders(count)
      localStorage.setItem(STORAGE_KEYS.providers, JSON.stringify(gen))
    }
  } catch (e) {
    // ignore storage errors in restricted environments
  }
}

export function getProviders(): CityHealthProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.providers)
    if (raw) {
      const parsed = JSON.parse(raw) as CityHealthProvider[];
      if (parsed.length > 0) return parsed;
    }
    // Auto-seed mock providers if none exist
    const mocks = generateMockProviders();
    localStorage.setItem(STORAGE_KEYS.providers, JSON.stringify(mocks));
    return mocks;
  } catch {
    return generateMockProviders();
  }
}

export function getProviderById(id: string): CityHealthProvider | undefined {
  return getProviders().find((p) => p.id === id)
}

export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]') as string[]
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id)
}

export function toggleFavorite(id: string): boolean {
  try {
    const ids = getFavoriteIds()
    const idx = ids.indexOf(id)
    if (idx >= 0) ids.splice(idx, 1)
    else ids.push(id)
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids))
    return ids.includes(id)
  } catch {
    return false
  }
}

export function getFavoriteProviders(): CityHealthProvider[] {
  const ids = new Set(getFavoriteIds())
  return getProviders().filter((p) => ids.has(p.id))
}

// Legacy export for backward compatibility
export const providers = getProviders();
