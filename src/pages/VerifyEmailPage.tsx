import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [email] = useState(() => sessionStorage.getItem('cityhealth_pending_email') || '');
  const [password] = useState(() => sessionStorage.getItem('cityhealth_pending_password') || '');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no pending email
  useEffect(() => {
    if (!email) {
      navigate('/citizen/register', { replace: true });
    }
  }, [email, navigate]);

  // Auto-check every 5 seconds
  useEffect(() => {
    if (!email || !password) return;

    const checkVerification = async () => {
      try {
        const auth = getAuth();
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (cred.user.emailVerified) {
          sessionStorage.removeItem('cityhealth_pending_email');
          sessionStorage.removeItem('cityhealth_pending_password');
          navigate('/onboarding', { replace: true });
        } else {
          await auth.signOut();
        }
      } catch {
        // Silent fail for polling
      }
    };

    intervalRef.current = setInterval(checkVerification, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [email, password, navigate]);

  const handleManualCheck = async () => {
    setChecking(true);
    setError('');
    try {
      const auth = getAuth();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user.emailVerified) {
        sessionStorage.removeItem('cityhealth_pending_email');
        sessionStorage.removeItem('cityhealth_pending_password');
        toast.success('Email vérifié ! Bienvenue sur CityHealth !');
        navigate('/onboarding', { replace: true });
      } else {
        await auth.signOut();
        setError('Email pas encore vérifié, vérifiez votre boîte mail');
      }
    } catch {
      setError('Erreur lors de la vérification. Réessayez.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const auth = getAuth();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await auth.signOut();
      toast.success('Email renvoyé ✓');
      setCooldown(60);
      cooldownRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        toast.error('Trop de tentatives. Réessayez dans quelques minutes.');
      } else {
        toast.error("Impossible de renvoyer l'email.");
      }
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F8F9FA' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 space-y-6"
      >
        {/* Animated email icon */}
        <motion.div
          className="mx-auto flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(29, 78, 216, 0.1)' }}
          >
            <Mail className="h-8 w-8" style={{ color: '#1D4ED8' }} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Vérifiez votre email</h1>
          <p className="text-muted-foreground text-sm">
            Nous avons envoyé un lien de confirmation à
          </p>
          <p className="font-bold text-sm" style={{ color: '#1D4ED8' }}>{email}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Actions */}
        <div className="space-y-3">
          {/* Manual check button */}
          <Button
            onClick={handleManualCheck}
            disabled={checking}
            className="w-full h-12"
            style={{ backgroundColor: '#1D4ED8' }}
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            J'ai vérifié mon email
          </Button>

          {/* Inline error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Resend button */}
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full h-11 text-muted-foreground"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {cooldown > 0
              ? `Renvoyer dans ${formatCooldown(cooldown)}`
              : "Renvoyer l'email de confirmation"}
          </Button>

          {/* Change email link */}
          <div className="text-center">
            <Link
              to="/citizen/register"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Changer d'adresse email
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          Vérifiez aussi vos spams si vous ne trouvez pas l'email
        </p>

        {/* Auto-check indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          <span className="text-xs text-muted-foreground ml-1.5">Vérification en cours...</span>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
