import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthRequiredModal({ open, onOpenChange }: AuthRequiredModalProps) {
  const { t } = useLanguage();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-col items-center gap-2 pt-6">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <DrawerTitle className="text-lg">{t('authRequired', 'title')}</DrawerTitle>
          <DrawerDescription className="text-center">
            {t('authRequired', 'description')}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 pb-6">
          <Button asChild className="w-full">
            <Link to="/citizen/login">{t('authRequired', 'signIn')}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/citizen/register">{t('authRequired', 'createAccount')}</Link>
          </Button>
          <DrawerClose asChild>
            <button className="text-sm text-muted-foreground hover:text-foreground pt-1">
              {t('authRequired', 'continueWithout')}
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}