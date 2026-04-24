/**
 * Image utilities - uploads images to Cloudinary
 * Fast, free, and reliable CDN
 */

import { uploadBase64ToCloudinary, uploadFileToCloudinary, type CloudinaryUploadResult } from './cloudinaryUpload';

export interface UploadResult {
  url: string;      // Cloudinary CDN URL
  path: string;     // Cloudinary public ID (for deletion)
}

export interface UploadProgress {
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

type ProgressCallback = (progress: UploadProgress) => void;

/**
 * Compress image file before uploading
 * Returns a compressed File object
 */
export async function compressImageFile(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip compression for small images
    if (file.size < 100 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if needed
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality adjustment
        const tryConvert = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // If compressed is larger or quality too low, use original
              if (blob.size > file.size || q <= 0.3) {
                resolve(file);
                return;
              }

              // If compressed is significantly smaller, use it
              if (blob.size < file.size * 0.95) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type || 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Try lower quality
                tryConvert(q - 0.1);
              }
            },
            file.type || 'image/jpeg',
            q
          );
        };

        tryConvert(quality);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Generate unique folder path for uploads
 */
function generateFolderPath(folder: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${folder}/${timestamp}`;
}

/**
 * Upload single image to Cloudinary
 * Returns CDN URL and public ID
 */
export async function uploadImage(
  file: File,
  folder: string = 'alo_store',
  onProgress?: ProgressCallback
): Promise<UploadResult> {
  // Compress before uploading
  const compressedFile = await compressImageFile(file);
  const folderPath = generateFolderPath(folder);

  const result = await uploadFileToCloudinary(compressedFile, folderPath, onProgress);

  return {
    url: result.url,
    path: result.publicId,
  };
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadImages(
  files: File[],
  folder: string = 'alo_store',
  onProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const progressCallback = onProgress
        ? (p: UploadProgress) => onProgress(i, p)
        : undefined;
      const result = await uploadImage(files[i], folder, progressCallback);
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
 * Note: For server-side deletion, use Cloudinary API with secret key
 */
export async function deleteImage(path: string): Promise<void> {
  if (!path || path.startsWith('data:')) return; // Skip base64 paths

  // Client-side deletion is limited
  // For full deletion, use Cloudinary Admin API server-side
  console.log('Cloudinary image marked for deletion (server-side):', path);
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteImages(paths: string[]): Promise<void> {
  await Promise.all(paths.map(path => deleteImage(path)));
}

/**
 * Delete all images associated with a product
 */
export async function deleteProductImages(product: {
  image?: string;
  imagePath?: string;
  images?: (string | { url: string; path: string })[];
}): Promise<void> {
  const pathsToDelete: string[] = [];

  if (product.imagePath) {
    pathsToDelete.push(product.imagePath);
  }

  if (product.images) {
    product.images.forEach((img) => {
      if (typeof img === 'object' && img.path) {
        pathsToDelete.push(img.path);
      }
    });
  }

  await deleteImages(pathsToDelete);
}

// ============ Base64 utilities ============

/**
 * Convert File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Compress image file to base64
 */
export function compressImage(file: File, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxBytes = maxSizeKB * 1024 * 1.37;
        let quality = 0.9;

        const scale = Math.min(1, Math.sqrt(maxBytes / (width * height * 0.5)));
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const tryCompress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const base64Length = dataUrl.split(',')[1]?.length || 0;
          const sizeKB = (base64Length * 3) / 4 / 1024;

          if (sizeKB <= maxSizeKB || quality <= 0.3) {
            resolve(dataUrl);
          } else {
            quality -= 0.1;
            width = Math.floor(width * 0.9);
            height = Math.floor(height * 0.9);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            tryCompress();
          }
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Check if a string is a valid base64 image
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  if (!str.startsWith('data:image/')) return false;
  const parts = str.split(',');
  if (parts.length !== 2) return false;
  try {
    atob(parts[1]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image size in KB from base64 string
 */
export function getBase64SizeKB(base64: string): number {
  try {
    const base64Data = base64.split(',')[1] || '';
    return Math.round((base64Data.length * 3) / 4 / 1024);
  } catch {
    return 0;
  }
}
