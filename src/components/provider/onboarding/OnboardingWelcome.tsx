import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  FileText, 
  Camera, 
  BadgeCheck,
  ArrowRight,
  User,
  Award,
  Upload,
  Send,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingWelcomeProps {
  providerName?: string;
  onGetStarted: () => void;
}

export function OnboardingWelcome({ providerName, onGetStarted }: OnboardingWelcomeProps) {
  const steps = [
    {
      icon: User,
      title: 'Informations de base',
      description: 'Nom, email et téléphone',
    },
    {
      icon: MapPin,
      title: 'Localisation',
      description: 'Adresse et coordonnées GPS',
    },
    {
      icon: FileText,
      title: 'Description & Horaires',
      description: 'Présentez votre pratique',
    },
    {
      icon: Award,
      title: 'Licence professionnelle',
      description: 'Numéro d\'agrément',
    },
    {
      icon: Camera,
      title: 'Photos du cabinet',
      description: 'Montrez votre établissement',
    },
    {
      icon: Upload,
      title: 'Documents officiels',
      description: 'Licence + pièce d\'identité',
    },
    {
      icon: Send,
      title: 'Soumettre pour vérification',
      description: 'Envoi pour validation',
    },
    {
      icon: BadgeCheck,
      title: 'Obtenir le badge vérifié',
      description: 'Visible publiquement',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
        >
          <MapPin className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold">
          Bienvenue{providerName ? `, ${providerName}` : ''} !
        </h2>
        <p className="text-muted-foreground">
          Suivez ces 8 étapes pour activer votre profil et commencer à recevoir des patients.
        </p>
      </div>

      {/* Steps preview */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <step.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-2">
        <Button onClick={onGetStarted} className="w-full gap-2" size="lg">
          Commencer l'inscription
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          ⏱️ Environ 10-15 minutes pour compléter votre profil
        </p>
      </div>
    </div>
  );
}
