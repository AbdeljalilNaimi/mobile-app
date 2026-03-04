import { useEffect } from 'react';
import { MobileHomeScreen } from '@/components/homepage/MobileHomeScreen';

const AntigravityIndex = () => {
  useEffect(() => {
    document.title = 'CityHealth — Votre santé, simplifiée';
  }, []);

  return <MobileHomeScreen />;
};

export default AntigravityIndex;
