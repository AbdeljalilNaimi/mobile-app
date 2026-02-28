import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && profile?.userType === 'citizen') {
      navigate('/citizen/dashboard', { replace: true });
    } else if (isAuthenticated && profile?.userType === 'provider') {
      navigate('/provider/dashboard', { replace: true });
    }
  }, [isAuthenticated, profile, navigate]);

  // Try auto-login with stored credentials
  useEffect(() => {
    if (autoLoginAttempted) return;
    setAutoLoginAttempted(true);

    const storedEmail = sessionStorage.getItem('cityhealth_pending_email');
    const storedPassword = sessionStorage.getItem('cityhealth_pending_password');

    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setIsLoading(true);
      const auth = getAuth();
      signInWithEmailAndPassword(auth, storedEmail, storedPassword)
        .then(() => {
          sessionStorage.removeItem('cityhealth_pending_email');
          sessionStorage.removeItem('cityhealth_pending_password');
          toast.success('Connexion réussie ! Bienvenue sur CityHealth.');
          // Auth listener will handle redirect
        })
        .catch(() => {
          setIsLoading(false);
          // Auto-login failed, show manual form
        });
    }
  }, [autoLoginAttempted]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.removeItem('cityhealth_pending_email');
      sessionStorage.removeItem('cityhealth_pending_password');
      toast.success('Connexion réussie !');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        toast.error('Email ou mot de passe incorrect.');
      } else {
        toast.error('Erreur de connexion. Réessayez.');
      }
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && autoLoginAttempted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold">Email vérifié !</h1>
          <p className="text-muted-foreground">Connexion en cours...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </motion.div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Email vérifié avec succès !</h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à votre espace <span className="font-semibold text-foreground">CityHealth</span>
          </p>
        </div>

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 gap-2" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isLoading ? 'Connexion...' : 'Accéder à mon espace'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/citizen/login" className="text-primary hover:underline font-medium">
            Retour à la page de connexion
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default EmailVerifiedPage;
