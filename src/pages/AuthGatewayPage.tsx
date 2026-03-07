import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Ghost } from 'lucide-react';
import healthcareServicesImg from '@/assets/onboarding/healthcare-services.png';

export default function AuthGatewayPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12">
        <motion.img
          src={healthcareServicesImg}
          alt="CityHealth"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-48 h-48 object-contain mb-6"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">CityHealth</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Votre santé, simplifiée. Connectez-vous pour accéder à tous les services.
          </p>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="px-8 pb-10 space-y-3"
      >
        <Button
          onClick={() => navigate('/citizen/login')}
          className="w-full h-13 text-base font-semibold rounded-2xl gap-2.5 shadow-md shadow-primary/20"
          size="lg"
        >
          <LogIn className="h-5 w-5" />
          Se connecter
        </Button>

        <Button
          onClick={() => navigate('/citizen/register')}
          variant="outline"
          className="w-full h-13 text-base font-semibold rounded-2xl gap-2.5 border-2"
          size="lg"
        >
          <UserPlus className="h-5 w-5" />
          Créer un compte
        </Button>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground py-3 hover:text-foreground transition-colors"
        >
          <Ghost className="h-4 w-4" />
          Continuer en tant qu'invité
        </button>
      </motion.div>
    </div>
  );
}
