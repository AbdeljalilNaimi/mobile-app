import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import findDoctorsImg from '@/assets/onboarding/find-doctors.png';
import bookAppointmentImg from '@/assets/onboarding/book-appointment.png';
import healthcareServicesImg from '@/assets/onboarding/healthcare-services.png';

const slides = [
  {
    image: findDoctorsImg,
    title: 'Trouvez des médecins\nde confiance',
    description: 'Localisez les professionnels de santé vérifiés les plus proches de chez vous en quelques secondes.',
  },
  {
    image: bookAppointmentImg,
    title: 'Prenez rendez-vous\nfacilement',
    description: 'Réservez une consultation en ligne ou en cabinet, sans attente ni appel téléphonique.',
  },
  {
    image: healthcareServicesImg,
    title: 'Accédez aux services\nde santé rapidement',
    description: 'Urgences, pharmacies de garde, don de sang — tout est accessible depuis votre poche.',
  },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -260 : 260, opacity: 0 }),
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);

  const finish = useCallback(() => {
    localStorage.setItem('cityhealth_onboarding_done', 'true');
    navigate('/auth-gateway', { replace: true });
  }, [navigate]);

  const next = () => {
    if (page === slides.length - 1) {
      finish();
    } else {
      setPage([page + 1, 1]);
    }
  };

  const slide = slides[page];

  return (
    <div className="min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col overflow-hidden relative">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={finish}
          className="text-sm font-medium text-muted-foreground px-3 py-1.5 rounded-full hover:bg-muted/60 transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Illustration area */}
      <div className="flex-1 flex items-center justify-center px-8 pt-16 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={page}
            src={slide.image}
            alt={slide.title}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-64 h-64 object-contain"
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Content area */}
      <div className="px-8 pb-10 space-y-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
            className="space-y-3 text-center"
          >
            <h1 className="text-2xl font-bold text-foreground whitespace-pre-line leading-tight">
              {slide.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === page ? 'w-7 bg-primary' : 'w-2 bg-border'
              )}
            />
          ))}
        </div>

        {/* Next button */}
        <Button onClick={next} className="w-full h-13 text-base font-semibold rounded-2xl gap-2 shadow-md shadow-primary/20" size="lg">
          {page === slides.length - 1 ? 'Commencer' : 'Suivant'}
          <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
}
