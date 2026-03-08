import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error(t('changePasswordDialog', 'errorNotConnected'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('changePasswordDialog', 'errorMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('changePasswordDialog', 'errorMismatch'));
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(t('changePasswordDialog', 'errorSamePassword'));
      return;
    }

    setIsLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast.success(t('changePasswordDialog', 'success'));
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        toast.error(t('changePasswordDialog', 'errorWrongPassword'));
      } else if (error?.code === 'auth/weak-password') {
        toast.error(t('changePasswordDialog', 'errorWeakPassword'));
      } else if (error?.code === 'auth/too-many-requests') {
        toast.error(t('changePasswordDialog', 'errorTooMany'));
      } else {
        toast.error(t('changePasswordDialog', 'errorGeneric'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = currentPassword.length > 0 && newPassword.length >= 6 && confirmPassword === newPassword;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-[380px] rounded-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">{t('changePasswordDialog', 'title')}</DialogTitle>
          <DialogDescription className="text-center text-xs">
            {t('changePasswordDialog', 'description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-xs font-medium">{t('changePasswordDialog', 'currentPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-9 pr-9 h-11 rounded-xl"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium">{t('changePasswordDialog', 'newPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9 pr-9 h-11 rounded-xl"
                placeholder="Min. 6 caractères"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-[10px] text-destructive">{t('changePasswordDialog', 'minChars')}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium">{t('changePasswordDialog', 'confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 pr-9 h-11 rounded-xl"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="text-[10px] text-destructive">{t('changePasswordDialog', 'mismatch')}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full h-11 rounded-xl font-semibold"
          >
            {isLoading ? t('changePasswordDialog', 'submitting') : t('changePasswordDialog', 'submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};