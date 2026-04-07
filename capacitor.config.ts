import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cityhealth.app',
  appName: 'CityHealth',
  webDir: 'dist',
  server: {
    url: 'https://c0311798-dce8-4830-88b4-785d5ed71eef-00-27tiba6e0w8hs.kirk.replit.dev',
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
