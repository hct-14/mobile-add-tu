/**
 * Image utilities - stores images as base64 data URLs in Firestore
 * No Firebase Storage required
 */

export interface UploadResult {
  url: string;      // Base64 data URL
  path: string;     // Empty string (not used for base64)
}

export async function uploadImage(
  file: File,
  folder: string = "images"
): Promise<UploadResult> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}-${sanitizedName}`;
  
  try {
    // Convert file to base64 data URL
    const base64Data = await fileToBase64(file);
    return { 
      url: base64Data, 
      path: `${folder}/${filename}` // Keep for reference only
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function uploadImages(
  files: File[],
  folder: string = "images"
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (const file of files) {
    try {
      const result = await uploadImage(file, folder);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }
  return results;
}

// Placeholder functions - no actual deletion needed for base64
export async function deleteImage(path: string): Promise<void> {
  console.log("deleteImage called with:", path, "(no-op for base64 storage)");
}

export async function deleteImages(paths: string[]): Promise<void> {
  console.log("deleteImages called with:", paths, "(no-op for base64 storage)");
}

export async function deleteProductImages(product: {
  image?: string;
  imagePath?: string;
  images?: (string | { url: string; path: string })[];
}): Promise<void> {
  console.log("deleteProductImages called (no-op for base64 storage):", product);
}

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
 * Compress image file before converting to base64
 * Returns a smaller file (max 500KB recommended for Firestore)
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
        
        // Calculate new dimensions to fit within maxSizeKB
        // Estimate: base64 is ~1.37x larger than original binary
        const maxBytes = maxSizeKB * 1024 * 1.37;
        let quality = 0.9;
        
        // Scale down if needed
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
        
        // Try to meet size requirement by adjusting quality
        const tryCompress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const base64Length = dataUrl.split(',')[1]?.length || 0;
          const sizeKB = (base64Length * 3) / 4 / 1024;
          
          if (sizeKB <= maxSizeKB || quality <= 0.3) {
            resolve(dataUrl);
          } else {
            quality -= 0.1;
            // Scale down further
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
 * Check if a base64 string is valid
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
