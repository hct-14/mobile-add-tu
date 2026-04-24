/**
 * Test Firebase Storage connection
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(
  fs.readFileSync('./firebase-applet-config.json', 'utf-8')
);

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testStorage() {
  console.log('🧪 Testing Firebase Storage connection...');
  console.log('Config:', firebaseConfig.storageBucket);

  try {
    // Create a simple test image (1x1 red pixel PNG)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    
    const storageRef = ref(storage, `test/${Date.now()}_test.png`);
    console.log('📤 Uploading test image...');
    
    await uploadString(storageRef, testImage, 'data_url');
    console.log('✅ Upload successful!');
    
    const url = await getDownloadURL(storageRef);
    console.log('📎 Download URL:', url);
    
    console.log('\n✅ Storage is working correctly!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.code, error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testStorage();
