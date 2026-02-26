import { useEffect } from 'react';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection';
import { ServicesGrid } from '@/components/homepage/ServicesGrid';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';
import { EmergencyBanner } from '@/components/homepage/EmergencyBanner';
import { AnimatedMapSection } from '@/components/homepage/AnimatedMapSection';
import { useLanguage } from '@/hooks/useLanguage';

const AntigravityIndex = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `CityHealth - ${t('homepage.findYourDoctor')} - ${t('homepage.locationBadge')}`;
  }, [language, t]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AntigravityHero />
      <EmergencyBanner />
      <HowItWorksSection />
      <ServicesGrid />
      <AnimatedMapSection />
      <FeaturedProviders />
      <TestimonialsSlider />
      <ProviderCTA />
      <Footer />
    </div>
  );
};

export default AntigravityIndex;