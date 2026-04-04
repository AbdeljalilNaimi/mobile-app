import { auth } from "@/lib/firebase";

export type NotificationType = "appointments" | "blood_emergencies" | "messages";

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

async function getFirebaseToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export async function sendFilteredNotification(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  const token = await getFirebaseToken();
  const res = await fetch("/api/notifications/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_ids: params.userIds,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to send notification");
  }
  return res.json();
}
