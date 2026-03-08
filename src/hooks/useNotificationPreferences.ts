import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPrefs {
  appointments: boolean;
  blood_emergencies: boolean;
  messages: boolean;
}

const defaults: NotificationPrefs = {
  appointments: true,
  blood_emergencies: true,
  messages: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaults);
  const [isLoading, setIsLoading] = useState(true);

  // Load prefs from Supabase on mount / user change
  useEffect(() => {
    if (!user?.uid) {
      setPrefs(defaults);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('appointments, blood_emergencies, messages')
        .eq('user_id', user.uid)
        .maybeSingle();

      if (data && !error) {
        setPrefs({
          appointments: data.appointments,
          blood_emergencies: data.blood_emergencies,
          messages: data.messages,
        });
      }
      // If no row exists yet, keep defaults — row will be created on first toggle
      setIsLoading(false);
    };

    load();
  }, [user?.uid]);

  const updatePref = useCallback(
    async (key: keyof NotificationPrefs, value: boolean) => {
      if (!user?.uid) return;

      // Optimistic update
      setPrefs((prev) => ({ ...prev, [key]: value }));

      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.uid)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('notification_preferences')
          .update({ [key]: value, updated_at: new Date().toISOString() })
          .eq('user_id', user.uid);
      } else {
        await supabase
          .from('notification_preferences')
          .insert({ user_id: user.uid, [key]: value });
      }
    },
    [user?.uid],
  );

  return { prefs, isLoading, updatePref };
};
