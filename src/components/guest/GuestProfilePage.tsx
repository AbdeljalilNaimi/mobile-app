import { Link } from 'react-router-dom';
import { User, Lock, CheckCircle2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GuestProfilePage() {
  const { t } = useLanguage();

  const lockedFeatures = [
    t('guest', 'medicalRecord'),
    t('guest', 'myAppointments'),
    t('guest', 'emergencyCard'),
    t('guest', 'bloodProfile'),
    t('guest', 'favoriteDoctors'),
    t('guest', 'aiChatHistory'),
  ];

  const freeFeatures = [
    t('guest', 'searchDoctor'),
    t('guest', 'viewMap'),
    t('guest', 'aiSessionOnly'),
    t('guest', 'medicalAds'),
    t('guest', 'medicalResearch'),
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-8 space-y-6">

        {/* Guest Identity Block */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{t('guest', 'visitor')}</p>
            <p className="text-sm text-muted-foreground">{t('guest', 'notConnected')}</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button asChild className="flex-1">
              <Link to="/citizen/login">{t('guest', 'signIn')}</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/citizen/register">{t('guest', 'register')}</Link>
            </Button>
          </div>
        </div>

        {/* Locked Features */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('guest', 'unlockTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('guest', 'unlockDesc')}</p>
          </div>
          <div className="space-y-2">
            {lockedFeatures.map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Free Features */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{t('guest', 'freeTitle')}</h2>
          <div className="space-y-2">
            {freeFeatures.map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm text-foreground">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings link */}
        <div className="text-center pt-2">
          <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            {t('guest', 'settingsLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}