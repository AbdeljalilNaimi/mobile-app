import { auth } from "@/lib/firebase";
import { apiDelete } from "@/lib/apiClient";

async function getFirebaseToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export async function secureUpload(
  bucket: string,
  path: string,
  file: File,
  upsert = false
): Promise<string> {
  const token = await getFirebaseToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  formData.append("path", path);
  if (upsert) formData.append("upsert", "true");

  const res = await fetch("/api/storage/upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.publicUrl;
}

export async function secureDelete(bucket: string, paths: string[]): Promise<void> {
  const token = await getFirebaseToken();
  await fetch("/api/storage/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ bucket, paths }),
  });
}
