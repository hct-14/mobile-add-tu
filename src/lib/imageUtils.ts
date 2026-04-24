/**
 * Image compression utilities
 * Used before uploading to Firebase Storage
 */

/**
 * Compress image file before uploading
 * Returns a compressed File object
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<File> {
  // Skip compression for small images
  if (file.size < 100 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
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
 * Compress image to target file size (for base64 - deprecated)
 */
export async function compressImageToBase64(
  file: File,
  maxSizeKB: number = 500
): Promise<string> {
  const compressed = await compressImage(file, 1200, 1200, 0.8);
  return fileToBase64(compressed);
}

/**
 * Convert File to base64 data URL
 * @deprecated Use Firebase Storage instead
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
