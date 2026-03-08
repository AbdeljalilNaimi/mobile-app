import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'appointments' | 'blood_emergencies' | 'messages';

interface SendNotificationParams {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface SendNotificationResult {
  eligible_user_ids: string[];
  skipped_user_ids: string[];
  total_targeted: number;
  total_eligible: number;
  total_skipped: number;
}

/**
 * Sends a notification filtered by user preferences via the edge function.
 * Users who have disabled the given notification type will be excluded.
 */
export async function sendFilteredNotification(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: {
      user_ids: params.userIds,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
    },
  });

  if (error) {
    console.error('[sendFilteredNotification] error:', error);
    throw error;
  }

  return data as SendNotificationResult;
}
