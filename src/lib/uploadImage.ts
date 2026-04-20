import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image file to Firebase Storage
 * @param file - The file to upload
 * @param folder - The folder path in Storage (e.g., 'products', 'banners')
 * @param customName - Optional custom filename
 * @returns Promise with the download URL and storage path
 */
export async function uploadImage(
  file: File,
  folder: string = 'images',
  customName?: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = customName || `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
  const path = `${folder}/${filename}`;
  const storageRef = ref(storage, path);
  
  // Upload with content type
  const metadata = {
    contentType: file.type || 'image/jpeg',
  };
  
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  
  return { url, path };
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param folder - The folder path in Storage
 * @returns Promise with array of upload results
 */
export async function uploadImages(
  files: File[],
  folder: string = 'images'
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadImage(file, folder);
    results.push(result);
  }
  
  return results;
}

/**
 * Delete an image from Firebase Storage
 * @param path - The storage path of the image to delete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

/**
 * Convert File to base64 data URL (legacy method, use uploadImage instead)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
