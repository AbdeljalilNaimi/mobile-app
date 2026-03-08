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

import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '@/utils/local-storage';

// Define the structure for a Provider
export interface Provider {
  id: string;
  name: string;
  phone: string;
  address: string;
  wilaya_number: number;
  provider_type: ProviderType;
  specialty?: string;
  description: string;
  languages_spoken: Lang[];
  payment_methods: string[];
  accepted_insurance: string[];
  is_premium: boolean;
  is_sponsored: boolean;
  verification_status: VerificationStatus;
  opening_hours: {
    [day: string]: {
      open: string;
      close: string;
    }[];
  };
}

// Mock data for providers (expand as needed)
export const MOCK_PROVIDERS: Provider[] = (() => {
  const wilayaNumbers = Array.from({ length: 48 }, (_, i) => i + 1); // 1 to 48
  const providerTypes: ProviderType[] = ['doctor', 'clinic', 'pharmacy', 'lab', 'hospital', 'birth_hospital', 'blood_cabin', 'radiology_center', 'medical_equipment'];
  const languages: Lang[] = ['ar', 'fr', 'en'];
  const paymentMethods = ['Cash', 'Carte bancaire', 'Chèque', 'Mobile Payment'];
  const acceptedInsurances = ['CNAS', 'CASNOS', 'Private Insurance'];
  const verificationStatuses: VerificationStatus[] = ['verified', 'pending', 'unverified'];

  let providers: Provider[] = [];
  let idCounter = 1;

  for (let i = 0; i < 200; i++) {
    const type = providerTypes[i % providerTypes.length];
    const specialty = type === 'doctor' ? ['Generaliste', 'Cardiologue', 'Dentiste', 'Ophtalmologue'][i % 4] : undefined;

    providers.push({
      id: `provider-${idCounter++}`,
      name: makeName(type, specialty, i),
      phone: `+213555${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      address: `${Math.floor(Math.random() * 200)} Rue de l'Indépendance, Sidi Bel Abbès`,
      wilaya_number: wilayaNumbers[i % wilayaNumbers.length],
      provider_type: type,
      specialty: specialty,
      description: makeDescription(type),
      languages_spoken: [languages[i % languages.length], languages[(i + 1) % languages.length]],
      payment_methods: [paymentMethods[i % paymentMethods.length], paymentMethods[(i + 2) % paymentMethods.length]],
      accepted_insurance: [acceptedInsurances[i % acceptedInsurances.length]],
      is_premium: Math.random() < 0.1, // 10% chance of being premium
      is_sponsored: Math.random() < 0.05, // 5% chance of being sponsored
      verification_status: verificationStatuses[i % verificationStatuses.length],
      opening_hours: {
        "monday": [{ open: "08:00", close: "17:00" }],
        "tuesday": [{ open: "08:00", close: "17:00" }],
        "wednesday": [{ open: "08:00", close: "17:00" }],
        "thursday": [{ open: "08:00", close: "17:00" }],
        "friday": [{ open: "08:00", close: "12:00" }],
        "saturday": [],
        "sunday": [],
      },
    });
  }

  return providers;
})();

function makeName(type: ProviderType, specialty: string | undefined, i: number): string {
  switch (type) {
    case 'doctor':
      return `Dr. ${['Ahmed', 'Sara', 'Youssef', 'Imen', 'Nadia', 'Khaled', 'Rania'][i % 7]} ${['Benali', 'Bendaoud', 'Merabet', 'Saadi', 'Zerrouki'][i % 5]}${specialty ? ' - ' + specialty : ''}`;
    case 'clinic':
      return `Clinique ${['El Amal', 'El Chifa', 'Ibn Sina', 'An Nasr', 'El Rahma'][i % 5]}`;
    case 'pharmacy':
      return `Pharmacie ${['Centrale', 'El Fajr', 'El Baraka', 'El Wafa'][i % 4]}`;
    case 'lab':
      return `Laboratoire ${['Atlas', 'Pasteur', 'BioLab', 'El Yakine'][i % 4]}`;
    case 'hospital':
      return `Hôpital ${['Universitaire', 'Régional', 'Privé Al Hayat'][i % 3]}`;
    case 'birth_hospital':
      return `Maternité ${['El Amel', 'El Hayat', 'Ibn Rochd'][i % 3]}`;
    case 'blood_cabin':
      return `Centre de Don ${['Central', 'Nord', 'Sud', 'Est'][i % 4]}`;
    case 'radiology_center':
      return `Centre Radio ${['El Nour', 'Atlas', 'El Chifa'][i % 3]}`;
    case 'medical_equipment':
      return `Équipement Médical ${['SantéPlus', 'MedEquip', 'AlgériaMed'][i % 3]}`;
    default:
      return `Établissement ${i + 1}`;
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
      return base + ' Conseils pharmaceutiques, disponibilité 24/7 pour certaines officines.';
    case 'lab':
      return base + ' Analyses médicales rapides et précises, résultats numériques.';
    case 'hospital':
    case 'birth_hospital':
      return base + " Plateaux techniques complets et services d'urgences 24/7.";
    default:
      return base;
  }
}

// Local Storage Key for Providers
const LOCAL_STORAGE_PROVIDERS_KEY = 'cityhealth_providers';

// Function to initialize providers from localStorage or use mock data
export function initializeProviders(): Provider[] {
  let providers = getLocalStorageItem<Provider[]>(LOCAL_STORAGE_PROVIDERS_KEY);

  if (!providers) {
    // Seed localStorage with mock providers
    providers = MOCK_PROVIDERS;
    setLocalStorageItem(LOCAL_STORAGE_PROVIDERS_KEY, providers);
  }

  return providers;
}

// Function to save providers to localStorage
export function saveProviders(providers: Provider[]): void {
  setLocalStorageItem(LOCAL_STORAGE_PROVIDERS_KEY, providers);
}

// Function to add a new provider
export function addProvider(newProvider: Provider): Provider[] {
  const providers = initializeProviders();
  providers.push(newProvider);
  saveProviders(providers);
  return providers;
}

// Function to update an existing provider
export function updateProvider(updatedProvider: Provider): Provider[] {
  let providers = initializeProviders();
  providers = providers.map(provider =>
    provider.id === updatedProvider.id ? updatedProvider : provider
  );
  saveProviders(providers);
  return providers;
}

// Function to delete a provider
export function deleteProvider(providerId: string): Provider[] {
  let providers = initializeProviders();
  providers = providers.filter(provider => provider.id !== providerId);
  saveProviders(providers);
  return providers;
}
