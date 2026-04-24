/**
 * Cloudinary upload utilities
 * Alternative to Firebase Storage for image uploads
 */

import { cloudinaryConfig, CLOUDINARY_API_URL } from './cloudinary';

export interface CloudinaryUploadResult {
  url: string;           // CDN URL
  publicId: string;      // Cloudinary public ID for deletion
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface CloudinaryUploadProgress {
  progress: number;       // 0-100
  bytesSent: number;
  totalBytes: number;
}

type ProgressCallback = (progress: CloudinaryUploadProgress) => void;

/**
 * Upload base64 string to Cloudinary
 */
export async function uploadBase64ToCloudinary(
  base64: string,
  folder: string = 'alo_store',
  onProgress?: ProgressCallback
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  // Cloudinary expects full data URI with prefix
  formData.append('file', base64);
  formData.append('upload_preset', 'alo_store'); // Using unsigned preset
  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return {
      url: responseData.secure_url,
      publicId: responseData.public_id,
      width: responseData.width,
      height: responseData.height,
      format: responseData.format,
      bytes: responseData.bytes,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Upload failed');
  }
}

/**
 * Convert File to base64 and upload to Cloudinary
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string = 'alo_store',
  onProgress?: ProgressCallback
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const result = await uploadBase64ToCloudinary(base64, folder, onProgress);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadFilesToCloudinary(
  files: File[],
  folder: string = 'alo_store',
  onProgress?: (index: number, progress: CloudinaryUploadProgress) => void
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const progressCallback = onProgress
      ? (p: CloudinaryUploadProgress) => onProgress(i, p)
      : undefined;

    try {
      const result = await uploadFileToCloudinary(files[i], folder, progressCallback);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${files[i].name}:`, error);
      // Continue with other files
    }
  }

  return results;
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  // Note: Deletion requires API secret and should be done server-side
  // For client-side, you can use the Management API with an authenticated user
  console.warn('Cloudinary deletion should be done server-side with API secret');
  console.log('Public ID to delete:', publicId);
  return false;
}

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

/**
 * Generate Cloudinary transformation URL
 */
export function getTransformedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!isCloudinaryUrl(url)) return url;

  // Don't add transformations if URL already has them
  if (url.includes('/upload/w_') || url.includes('/upload/q_')) {
    return url;
  }

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  if (transformations.length === 0) return url;

  // Insert transformation before the public ID
  // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
  const urlParts = url.split('/upload/');
  if (urlParts.length < 2) return url;
  
  return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
}
