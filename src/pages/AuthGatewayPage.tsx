import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function AuthGatewayPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-primary/[0.06]" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full bg-primary/[0.04]" />
        <div className="absolute -bottom-24 right-8 w-56 h-56 rounded-full bg-primary/[0.05]" />
      </div>

      {/* Top section — Logo & branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-4 relative z-10">
        {/* App icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="w-24 h-24 rounded-[28px] bg-primary flex items-center justify-center shadow-xl shadow-primary/25 mb-8"
        >
          <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
            <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z" fill="white" opacity="0.9"/>
            <rect x="21" y="16" width="6" height="14" rx="3" fill="hsl(var(--primary))"/>
            <rect x="17" y="20" width="14" height="6" rx="3" fill="hsl(var(--primary))"/>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            CityHealth
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            Votre santé, simplifiée. Connectez-vous pour accéder à tous les services.
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 mt-8"
        >
          {['🏥 500+ praticiens', '⭐ 4.8/5', '🔒 Sécurisé'].map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-medium text-muted-foreground/70 bg-muted/50 px-2.5 py-1 rounded-full"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom section — Actions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 24 }}
        className="px-7 pb-10 space-y-3 relative z-10"
      >
        {/* Sign in */}
        <Button
          onClick={() => navigate('/citizen/login')}
          className="w-full h-14 text-[15px] font-bold rounded-2xl gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          size="lg"
        >
          <LogIn className="h-5 w-5" />
          Se connecter
        </Button>

        {/* Sign up */}
        <Button
          onClick={() => navigate('/citizen/register')}
          variant="outline"
          className="w-full h-14 text-[15px] font-bold rounded-2xl gap-2.5 border-2 border-border hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98] transition-all"
          size="lg"
        >
          <UserPlus className="h-5 w-5" />
          Créer un compte
        </Button>

        {/* Guest */}
        <button
          onClick={() => {
            localStorage.setItem('onboarding_complete', 'true');
            navigate('/');
          }}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground/60 py-3.5 hover:text-muted-foreground transition-colors group"
        >
          Continuer en tant qu'invité
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Legal */}
        <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed pt-1">
          En continuant, vous acceptez nos{' '}
          <button onClick={() => navigate('/terms')} className="underline hover:text-muted-foreground/60">
            Conditions
          </button>{' '}
          et{' '}
          <button onClick={() => navigate('/privacy')} className="underline hover:text-muted-foreground/60">
            Politique de confidentialité
          </button>
        </p>
      </motion.div>
    </div>
  );
}
