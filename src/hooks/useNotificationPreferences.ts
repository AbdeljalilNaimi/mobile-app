import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPut } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

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

  useEffect(() => {
    if (!user?.uid) {
      setPrefs(defaults);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<NotificationPrefs | null>("/notification-prefs/" + user.uid);
        if (data) {
          setPrefs({
            appointments: data.appointments,
            blood_emergencies: data.blood_emergencies,
            messages: data.messages,
          });
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.uid]);

  const updatePrefs = useCallback(
    async (newPrefs: NotificationPrefs) => {
      if (!user?.uid) return;
      setPrefs(newPrefs);
      try {
        await apiPut("/notification-prefs/" + user.uid, newPrefs);
      } catch {
        // silent
      }
    },
    [user?.uid]
  );

  return { prefs, isLoading, updatePrefs };
};
