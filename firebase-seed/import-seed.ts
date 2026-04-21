/**
 * Firebase Seed Import Script
 * Chạy script này để import dữ liệu vào Firestore
 * 
 * Cách sử dụng:
 * 1. Cài đặt dependencies: npm install
 * 2. Chạy: npx tsx firebase-seed/import-seed.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import firebaseConfig from '../firebase-applet-config.json';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SeedData {
  [key: string]: {
    [docId: string]: Record<string, unknown>;
  };
}

async function importSeedData() {
  console.log('🔥 Khởi tạo Firebase...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const seedDir = __dirname;

  const collections = [
    'categories',
    'products',
    'banners',
    'promotions',
    'campaigns',
    'settings'
  ];

  console.log('🚀 Bắt đầu import dữ liệu Firebase...\n');

  for (const collectionName of collections) {
    const filePath = path.join(seedDir, `${collectionName}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File không tồn tại: ${filePath}`);
      continue;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data: SeedData = JSON.parse(fileContent);
      const collectionData = data[collectionName];

      if (!collectionData) {
        console.log(`⚠️  Không tìm thấy dữ liệu cho collection: ${collectionName}`);
        continue;
      }

      const docCount = Object.keys(collectionData).length;
      console.log(`📦 Importing collection: ${collectionName} (${docCount} documents)`);

      // Use batch write for better performance
      const batch = writeBatch(db);
      
      for (const [docId, docData] of Object.entries(collectionData)) {
        const docRef = doc(collection(db, collectionName), docId);
        batch.set(docRef, docData);
      }
      
      await batch.commit();
      
      Object.keys(collectionData).forEach(docId => {
        console.log(`   ✓ ${docId}`);
      });
      console.log(`✅ Hoàn thành collection: ${collectionName}\n`);
    } catch (error) {
      console.error(`❌ Lỗi khi import ${collectionName}:`, error);
    }
  }

  console.log('🎉 Import hoàn tất!');
  console.log('\n📝 Lưu ý: Hãy đảm bảo đã deploy Firestore Rules và Storage Rules trước khi sử dụng ứng dụng.');
}

importSeedData().catch(console.error);
