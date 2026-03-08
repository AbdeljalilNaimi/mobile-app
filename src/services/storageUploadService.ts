/**
 * Secure storage upload service
 * Routes all file uploads through an edge function with Firebase auth validation
 */

import { auth } from '@/lib/firebase';

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const EDGE_FN_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/storage-upload`;

async function getFirebaseToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/**
 * Upload a file to a storage bucket via the secure edge function
 */
export async function secureUpload(
  bucket: string,
  path: string,
  file: File,
  upsert = false
): Promise<string> {
  const token = await getFirebaseToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('path', path);
  if (upsert) formData.append('upsert', 'true');

  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.publicUrl;
}

/**
 * Delete files from a storage bucket via the secure edge function
 */
export async function secureDelete(
  bucket: string,
  paths: string[]
): Promise<void> {
  const token = await getFirebaseToken();
  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('bucket', bucket);
  formData.append('paths', JSON.stringify(paths));

  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
}
