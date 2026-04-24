/**
 * Quick test for Cloudinary upload
 */

import { uploadBase64ToCloudinary } from '../src/lib/cloudinaryUpload';

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary upload...\n');

  // Simple 1x1 red pixel PNG
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  try {
    console.log('📤 Uploading test image...');
    const result = await uploadBase64ToCloudinary(testImage, 'test');

    console.log('\n✅ SUCCESS!');
    console.log('URL:', result.url);
    console.log('Public ID:', result.publicId);
    console.log('Format:', result.format);
    console.log('Size:', result.bytes, 'bytes');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ FAILED:', error.message);
    process.exit(1);
  }
}

testCloudinary();
