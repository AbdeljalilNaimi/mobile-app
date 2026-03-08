import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, Heart, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setUserEmail(email);
        setCodeValid(true);
      })
      .catch(() => setCodeValid(false))
      .finally(() => setVerifying(false));
  }, [oobCode]);

  // Password strength
  const rules = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const score = Object.values(rules).filter(Boolean).length;
  const strengthLabel = score <= 1 ? 'Faible' : score <= 2 ? 'Moyen' : score <= 3 ? 'Bon' : 'Fort';
  const strengthColor = score <= 1 ? 'bg-destructive' : score <= 2 ? 'bg-orange-500' : score <= 3 ? 'bg-yellow-500' : 'bg-emerald-500';
  const strengthTextColor = score <= 1 ? 'text-destructive' : score <= 2 ? 'text-orange-500' : score <= 3 ? 'text-yellow-500' : 'text-emerald-500';

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = score >= 3 && passwordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !oobCode) return;
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Mot de passe mis à jour ✓');
      navigate('/', { replace: true });
    } catch (error: any) {
      if (error.code === 'auth/expired-action-code') {
        toast.error('Le lien a expiré. Demandez un nouveau lien.');
      } else {
        toast.error('Erreur lors de la réinitialisation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!oobCode || !codeValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F8F9FA' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Lien invalide ou expiré</h2>
          <p className="text-sm text-muted-foreground">
            Ce lien de réinitialisation n'est plus valide. Demandez un nouveau lien.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full h-11">Demander un nouveau lien</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Nouveau mot de passe</h2>
            {userEmail && (
              <p className="text-sm text-muted-foreground">
                Pour <span className="font-semibold text-primary">{userEmail}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? strengthColor : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthTextColor}`}>{strengthLabel}</p>

                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { ok: rules.length, label: '8+ caractères' },
                      { ok: rules.uppercase, label: '1 majuscule' },
                      { ok: rules.number, label: '1 chiffre' },
                      { ok: rules.special, label: '1 caractère spécial' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`h-3 w-3 ${r.ok ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                        <span className={`text-xs ${r.ok ? 'text-foreground' : 'text-muted-foreground'}`}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">
                  Les mots de passe ne correspondent pas
                </motion.p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 font-semibold" disabled={!canSubmit}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Réinitialiser
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
