import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

export function useAuthRequired() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isAuthenticated) {
        action?.();
      } else {
        setOpen(true);
      }
    },
    [isAuthenticated]
  );

  const Modal = useCallback(
    () => <AuthRequiredModal open={open} onOpenChange={setOpen} />,
    [open]
  );

  return { requireAuth, AuthRequiredModal: Modal };
}
