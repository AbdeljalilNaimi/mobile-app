import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ArrowLeft, Heart } from 'lucide-react';
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

  useEffect(() => {
    if (!email) navigate('/citizen/register', { replace: true });
  }, [email, navigate]);

  // Auto-check every 5s
  useEffect(() => {
    if (!email || !password) return;
    const check = async () => {
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
      } catch {}
    };
    intervalRef.current = setInterval(check, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [email, password, navigate]);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

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
          if (prev <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
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

  const formatCooldown = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F8F9FA' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            CityHealth
          </Link>
        </div>

        <div className="bg-background rounded-2xl shadow-md p-8 space-y-6">
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
              className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <Mail className="h-8 w-8 text-primary" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Vérifiez votre email</h1>
            <p className="text-sm text-muted-foreground">
              Nous avons envoyé un lien de confirmation à
            </p>
            <p className="font-semibold text-sm text-primary">{email}</p>
          </div>

          <div className="border-t border-border" />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleManualCheck}
              disabled={checking}
              className="w-full h-12 font-semibold"
            >
              {checking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              J'ai vérifié mon email
            </Button>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full h-11"
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {cooldown > 0 ? `Renvoyer (${formatCooldown(cooldown)})` : "Renvoyer l'email"}
            </Button>

            <div className="text-center">
              <Link
                to="/citizen/register"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Changer d'adresse email
              </Link>
            </div>
          </div>

          {/* Spam notice */}
          <p className="text-xs text-muted-foreground text-center">
            Vérifiez aussi vos spams si vous ne trouvez pas l'email
          </p>

          {/* Auto-check indicator */}
          <div className="flex items-center justify-center gap-1.5">
            {[0, 0.3, 0.6].map((delay) => (
              <motion.span
                key={delay}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">Vérification en cours...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
