import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Stethoscope, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';

const ProviderLoginPage = () => {
  const navigate = useNavigate();
  const { loginAsProvider, isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginSchema = z.object({
    email: z.string().email(t('loginPage', 'invalidEmail')).max(255),
    password: z.string().min(6, t('loginPage', 'passwordMinLength')).max(100),
  });

  useEffect(() => {
    if (isAuthenticated && profile?.userType === 'provider') {
      // Check for redirect query param (e.g. from QR code scan)
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        navigate(redirect);
      } else if (profile.verificationStatus === 'verified') {
        navigate('/provider/dashboard');
      } else {
        navigate('/registration-status');
      }
    } else if (isAuthenticated && profile?.userType) {
      toast.error(t('loginPage', 'notProviderAccount'));
    }
  }, [isAuthenticated, profile, navigate, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = loginSchema.parse({ email, password });
      setIsLoading(true);
      await loginAsProvider(validated.email, validated.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errs: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errs[err.path[0].toString()] = err.message;
        });
        setErrors(errs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error(t('loginPage', 'invalidEmail'));
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotEmailSent(true);
      toast.success(t('loginPage', 'resetSent'));
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error(t('loginPage', 'noAccountForEmail'));
      } else {
        toast.error(t('loginPage', 'sendError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('loginPage', 'forgotPasswordTitle')}</CardTitle>
            <CardDescription>
              {forgotEmailSent ? t('loginPage', 'resetSent') : t('loginPage', 'resetDesc' as any)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotEmailSent ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">📧 {t('loginPage', 'checkInbox')}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setShowForgotPassword(false); setForgotEmailSent(false); setForgotEmail(''); }}>
                  {t('loginPage', 'backToLogin')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">{t('auth', 'email')}</Label>
                  <Input id="forgot-email" type="email" placeholder="votre@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('loginPage', 'sendLink')}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                  {t('common', 'back')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t('loginPage', 'providerSpace')}</CardTitle>
          <CardDescription>{t('loginPage', 'providerDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth', 'email')}</Label>
              <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth', 'password')}</Label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:underline">
                  {t('loginPage', 'forgotPassword')}
                </button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('loginPage', 'loginButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('loginPage', 'noAccount')}{' '}
            <Link to="/provider/register" className="text-primary hover:underline">{t('loginPage', 'registerEstablishment')}</Link>
          </p>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl-flip" />
            {t('loginPage', 'backToHome')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProviderLoginPage;
