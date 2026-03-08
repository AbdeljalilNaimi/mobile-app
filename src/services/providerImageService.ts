/**
 * Provider Image Upload Service
 * Handles uploading provider logos and gallery images to cloud storage
 */

import { secureUpload, secureDelete } from '@/services/storageUploadService';

const BUCKET = 'provider-images';

/**
 * Upload a single file to provider storage
 * @returns The public URL of the uploaded file
 */
export async function uploadProviderImage(
  providerId: string,
  file: File,
  folder: 'logo' | 'gallery'
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${providerId}/${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  return secureUpload(BUCKET, fileName, file);
}

/**
 * Upload multiple gallery images
 * @returns Array of public URLs
 */
export async function uploadGalleryImages(
  providerId: string,
  files: File[]
): Promise<string[]> {
  const results = await Promise.all(
    files.map(file => uploadProviderImage(providerId, file, 'gallery'))
  );
  return results;
}

/**
 * Upload provider logo
 * @returns Public URL of the logo
 */
export async function uploadProviderLogo(
  providerId: string,
  file: File
): Promise<string> {
  return uploadProviderImage(providerId, file, 'logo');
}

/**
 * Delete a provider image from storage
 */
export async function deleteProviderImage(publicUrl: string): Promise<void> {
  // Extract path from public URL
  const urlObj = new URL(publicUrl);
  const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${BUCKET}/`);
  if (pathParts.length < 2) return;
  
  const filePath = pathParts[1];
  try {
    await secureDelete(BUCKET, [filePath]);
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}
