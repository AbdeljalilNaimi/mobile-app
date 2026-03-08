import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import slideWelcome from '@/assets/onboarding/slide-welcome.png';
import slideDoctorSearch from '@/assets/onboarding/slide-doctor-search.png';
import slideEmergency from '@/assets/onboarding/slide-emergency.png';
import slideAiChat from '@/assets/onboarding/slide-ai-chat.png';

/* ─── Slide Data ─── */

const slides = [
  {
    image: slideWelcome,
    title: 'Bienvenue sur CityHealth',
    subtitle: 'Votre plateforme de santé digitale pour Sidi Bel Abbès et toute l\'Algérie',
    chip: null,
    accent: 'primary' as const,
  },
  {
    image: slideDoctorSearch,
    title: 'Trouvez le bon médecin',
    subtitle: 'Recherchez par spécialité, consultez les profils et prenez rendez-vous en quelques clics',
    chip: '🔍 500+ médecins référencés',
    accent: 'primary' as const,
  },
  {
    image: slideEmergency,
    title: 'Soyez prêt pour les urgences',
    subtitle: 'Créez votre carte d\'urgence médicale et rejoignez le réseau de donneurs de sang',
    chip: '❤️ Sauvez des vies près de chez vous',
    accent: 'destructive' as const,
  },
  {
    image: slideAiChat,
    title: 'Un assistant santé intelligent',
    subtitle: 'Posez vos questions médicales à notre IA, lisez des recherches et échangez avec la communauté',
    chip: '🤖 Disponible 24h/24',
    accent: 'primary' as const,
  },
];

/* ─── Animation Variants ─── */

const imageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.85 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, scale: 0.85 }),
};

const textVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -40 : 40, opacity: 0 }),
};

const SWIPE_THRESHOLD = 50;

// Confetti particle component
const ConfettiOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const colors = [
    'hsl(var(--primary))',
    'hsl(217 89% 71%)',
    'hsl(142 76% 46%)',
    'hsl(39 100% 57%)',
    'hsl(0 84% 65%)',
    'hsl(280 70% 60%)',
  ];

  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 1.5 }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 1.5 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 40,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 80],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </motion.div>
  );
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);
  const touchRef = useRef<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const finish = useCallback(() => {
    localStorage.setItem('onboarding_complete', 'true');
    setShowConfetti(true);
  }, []);

  const handleConfettiComplete = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  const next = () => {
    if (page === slides.length - 1) finish();
    else setPage([page + 1, 1]);
  };

  const prev = () => {
    if (page > 0) setPage([page - 1, -1]);
  };

  const goTo = (i: number) => {
    setPage([i, i > page ? 1 : -1]);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current === null) return;
    const diff = touchRef.current - e.changedTouches[0].clientX;
    if (diff > SWIPE_THRESHOLD) next();
    else if (diff < -SWIPE_THRESHOLD) prev();
    touchRef.current = null;
  };

  const slide = slides[page];
  const isLast = page === slides.length - 1;

  return (
    <>
    <AnimatePresence>
      {showConfetti && <ConfettiOverlay onComplete={handleConfettiComplete} />}
    </AnimatePresence>
    <div
      className="min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col overflow-hidden relative select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/[0.04]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/[0.03]" />
      </div>

      {/* Skip button */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={finish}
          className="text-sm font-medium text-muted-foreground/70 px-4 py-2 rounded-full hover:bg-muted/50 active:bg-muted/70 transition-all"
        >
          Passer
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 left-6 z-20">
        <span className="text-xs font-medium text-muted-foreground/50 tracking-wider">
          {page + 1}/{slides.length}
        </span>
      </div>

      {/* ─── Illustration Area (top ~45%) ─── */}
      <div className="flex-[5] flex items-center justify-center px-6 pt-16 relative">
        {/* Glow behind image */}
        <motion.div
          className={cn(
            "absolute w-48 h-48 rounded-full blur-3xl opacity-20",
            slide.accent === 'destructive' ? 'bg-destructive' : 'bg-primary'
          )}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="relative z-10"
          >
            <div className="w-56 h-56 relative">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Content Area (bottom ~55%) ─── */}
      <div className="flex-[5.5] px-7 pb-8 flex flex-col justify-end gap-6 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.08 }}
            className="space-y-4 text-center"
          >
            <h1 className="text-[26px] font-extrabold text-foreground leading-[1.2] tracking-tight">
              {slide.title}
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
              {slide.subtitle}
            </p>
            {slide.chip && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={cn(
                  "inline-flex items-center gap-1 mt-1 px-4 py-2 rounded-full text-sm font-semibold shadow-sm",
                  slide.accent === 'destructive'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {slide.chip}
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Dot Indicators ─── */}
        <div className="flex justify-center gap-2.5 py-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-400 ease-out',
                i === page
                  ? 'w-6 h-[6px] bg-primary shadow-sm shadow-primary/30'
                  : 'w-[6px] h-[6px] bg-border hover:bg-muted-foreground/30'
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ─── CTA Button ─── */}
        <Button
          onClick={next}
          className={cn(
            "w-full h-14 text-[15px] font-bold rounded-2xl gap-2 transition-all duration-200",
            "shadow-lg active:scale-[0.98]",
            isLast
              ? "bg-primary hover:bg-primary/90 shadow-primary/25"
              : "bg-primary hover:bg-primary/90 shadow-primary/20"
          )}
          size="lg"
        >
          {isLast ? 'Commencer' : 'Suivant'}
          <motion.div
            animate={isLast ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </Button>
      </div>
    </div>
    </>
  );
}
