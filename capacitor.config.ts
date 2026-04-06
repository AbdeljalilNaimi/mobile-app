import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cityhealth.app',
  appName: 'CityHealth',
  webDir: 'dist',
  server: {
    url: 'https://cityhealth.replit.app',
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
