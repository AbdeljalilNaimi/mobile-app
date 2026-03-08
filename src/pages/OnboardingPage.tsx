import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ─── Inline SVG Illustrations ─── */

const WelcomeIllustration = () => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56">
    {/* Heart pulse background circle */}
    <circle cx="120" cy="120" r="100" fill="hsl(var(--primary) / 0.08)" />
    <circle cx="120" cy="120" r="72" fill="hsl(var(--primary) / 0.12)" />
    {/* Stethoscope */}
    <path d="M100 80 C100 80 80 80 80 100 C80 130 110 140 120 160 C130 140 160 130 160 100 C160 80 140 80 140 80" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" fill="hsl(var(--primary) / 0.15)" />
    {/* Heart pulse line */}
    <polyline points="60,140 90,140 100,120 110,160 120,130 130,145 140,140 180,140" stroke="hsl(var(--primary))" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Small decorative cross */}
    <rect x="165" y="72" width="16" height="4" rx="2" fill="hsl(var(--primary))" />
    <rect x="171" y="66" width="4" height="16" rx="2" fill="hsl(var(--primary))" />
    {/* Sparkle dots */}
    <circle cx="60" cy="70" r="3" fill="hsl(var(--primary) / 0.4)" />
    <circle cx="185" cy="170" r="2.5" fill="hsl(var(--primary) / 0.3)" />
    <circle cx="50" cy="160" r="2" fill="hsl(var(--primary) / 0.25)" />
  </svg>
);

const DoctorSearchIllustration = () => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56">
    <circle cx="120" cy="120" r="100" fill="hsl(var(--primary) / 0.08)" />
    {/* Map pin */}
    <path d="M120 50 C98 50 80 68 80 90 C80 120 120 165 120 165 C120 165 160 120 160 90 C160 68 142 50 120 50Z" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="4" />
    <circle cx="120" cy="88" r="16" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
    {/* Doctor silhouette inside pin */}
    <circle cx="120" cy="82" r="6" fill="hsl(var(--primary))" />
    <path d="M110 96 C110 90 114 88 120 88 C126 88 130 90 130 96" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" fill="hsl(var(--primary) / 0.15)" />
    {/* Magnifying glass */}
    <circle cx="170" cy="170" r="20" stroke="hsl(var(--primary))" strokeWidth="4" fill="hsl(var(--primary) / 0.08)" />
    <line x1="184" y1="184" x2="200" y2="200" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
    {/* Small pins */}
    <circle cx="60" cy="110" r="5" fill="hsl(var(--primary) / 0.3)" />
    <circle cx="175" cy="80" r="4" fill="hsl(var(--primary) / 0.25)" />
    <circle cx="70" cy="160" r="3" fill="hsl(var(--primary) / 0.2)" />
  </svg>
);

const EmergencyIllustration = () => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56">
    <circle cx="120" cy="120" r="100" fill="hsl(0 70% 50% / 0.06)" />
    {/* Blood drop */}
    <path d="M105 60 C105 60 75 100 75 125 C75 145 88 160 105 160 C122 160 135 145 135 125 C135 100 105 60 105 60Z" fill="hsl(0 70% 50% / 0.2)" stroke="hsl(0 70% 50%)" strokeWidth="4" />
    {/* Cross on drop */}
    <rect x="99" y="110" width="12" height="3" rx="1.5" fill="hsl(0 70% 50%)" />
    <rect x="103.5" y="105.5" width="3" height="12" rx="1.5" fill="hsl(0 70% 50%)" />
    {/* Alert bell */}
    <path d="M165 90 C165 78 158 70 150 70 C142 70 135 78 135 90 L135 110 L165 110 L165 90Z" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinejoin="round" />
    <line x1="132" y1="110" x2="168" y2="110" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
    <circle cx="150" cy="118" r="4" fill="hsl(var(--primary))" />
    {/* Alert lines */}
    <line x1="150" y1="58" x2="150" y2="64" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="170" y1="68" x2="174" y2="64" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="130" y1="68" x2="126" y2="64" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pulse dots */}
    <circle cx="70" cy="180" r="3" fill="hsl(0 70% 50% / 0.3)" />
    <circle cx="180" cy="160" r="2.5" fill="hsl(var(--primary) / 0.3)" />
  </svg>
);

const AICommunityIllustration = () => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56">
    <circle cx="120" cy="120" r="100" fill="hsl(var(--primary) / 0.08)" />
    {/* Chat bubble */}
    <rect x="60" y="70" rx="16" width="110" height="80" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="4" />
    <polygon points="90,150 100,170 110,150" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinejoin="round" />
    {/* Chat lines */}
    <line x1="82" y1="98" x2="148" y2="98" stroke="hsl(var(--primary) / 0.4)" strokeWidth="3" strokeLinecap="round" />
    <line x1="82" y1="110" x2="135" y2="110" stroke="hsl(var(--primary) / 0.3)" strokeWidth="3" strokeLinecap="round" />
    <line x1="82" y1="122" x2="118" y2="122" stroke="hsl(var(--primary) / 0.2)" strokeWidth="3" strokeLinecap="round" />
    {/* Sparkle star */}
    <g transform="translate(175,75)">
      <path d="M0,-14 L4,-4 L14,-4 L6,3 L9,14 L0,8 L-9,14 L-6,3 L-14,-4 L-4,-4Z" fill="hsl(var(--primary))" opacity="0.7" />
    </g>
    {/* Small sparkles */}
    <circle cx="185" cy="140" r="3" fill="hsl(var(--primary) / 0.4)" />
    <circle cx="50" cy="160" r="2.5" fill="hsl(var(--primary) / 0.25)" />
    {/* AI dot pattern */}
    <circle cx="160" cy="180" r="2" fill="hsl(var(--primary) / 0.3)" />
    <circle cx="170" cy="175" r="2" fill="hsl(var(--primary) / 0.3)" />
    <circle cx="165" cy="188" r="2" fill="hsl(var(--primary) / 0.3)" />
  </svg>
);

/* ─── Slide Data ─── */

const slides = [
  {
    Illustration: WelcomeIllustration,
    title: 'Bienvenue sur CityHealth',
    subtitle: 'Votre plateforme de santé digitale pour Sidi Bel Abbès et toute l\'Algérie',
    chip: null,
  },
  {
    Illustration: DoctorSearchIllustration,
    title: 'Trouvez le bon médecin',
    subtitle: 'Recherchez par spécialité, consultez les profils et prenez rendez-vous en quelques clics',
    chip: '🔍 500+ médecins référencés',
  },
  {
    Illustration: EmergencyIllustration,
    title: 'Soyez prêt pour les urgences',
    subtitle: 'Créez votre carte d\'urgence médicale et rejoignez le réseau de donneurs de sang',
    chip: '❤️ Sauvez des vies près de chez vous',
  },
  {
    Illustration: AICommunityIllustration,
    title: 'Un assistant santé intelligent',
    subtitle: 'Posez vos questions médicales à notre IA, lisez des recherches et échangez avec la communauté',
    chip: '🤖 Disponible 24h/24',
  },
];

/* ─── Animation ─── */

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const SWIPE_THRESHOLD = 50;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);
  const touchRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/', { replace: true });
  }, [navigate]);

  const next = () => {
    if (page === slides.length - 1) finish();
    else setPage([page + 1, 1]);
  };

  const prev = () => {
    if (page > 0) setPage([page - 1, -1]);
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
    <div
      className="min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Skip */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={finish}
          className="text-sm font-medium text-muted-foreground px-3 py-1.5 rounded-full hover:bg-muted/60 transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Illustration — top 40% */}
      <div className="flex-[4] flex items-center justify-center px-8 pt-14">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
          >
            <slide.Illustration />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text content — bottom 60% */}
      <div className="flex-[6] px-8 pb-10 flex flex-col justify-end space-y-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3, delay: 0.05 }}
            className="space-y-3 text-center"
          >
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {slide.subtitle}
            </p>
            {slide.chip && (
              <span className="inline-block mt-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {slide.chip}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === page
                  ? 'w-5 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-border'
              )}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={next}
          className="w-full h-13 text-base font-semibold rounded-2xl gap-2 shadow-md shadow-primary/20"
          size="lg"
        >
          {isLast ? 'Commencer' : 'Suivant'}
          <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
}
