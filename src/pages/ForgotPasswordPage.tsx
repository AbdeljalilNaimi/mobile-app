import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatCooldown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
      });
      setEmailSent(true);
      setCooldown(60);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error('Aucun compte associé à cet email');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Trop de tentatives. Réessayez plus tard.');
      } else {
        toast.error("Erreur lors de l'envoi. Réessayez.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
      });
      toast.success('Email renvoyé !');
      setCooldown(60);
    } catch {
      toast.error("Impossible de renvoyer l'email.");
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="bg-background rounded-2xl shadow-md p-8">
          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">Email envoyé !</h2>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez votre boîte mail et cliquez sur le lien reçu
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Envoyé à <span className="font-semibold text-primary">{email}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full h-11"
                    onClick={handleResend}
                    disabled={isLoading || cooldown > 0}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    {cooldown > 0 ? `Renvoyer (${formatCooldown(cooldown)})` : "Renvoyer l'email"}
                  </Button>

                  <Link to="/citizen/login" className="block">
                    <Button variant="outline" className="w-full h-11">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold tracking-tight">Mot de passe oublié</h2>
                  <p className="text-sm text-muted-foreground">
                    Entrez votre email, nous vous enverrons un lien de réinitialisation
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <Button type="submit" className="w-full h-12 font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Envoyer le lien
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    to="/citizen/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
