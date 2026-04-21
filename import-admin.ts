/**
 * Firebase Admin Import Script
 * Chạy script này để import dữ liệu vào Firestore với quyền admin
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import serviceAccount from './service-account.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SeedData {
  [key: string]: {
    [docId: string]: Record<string, unknown>;
  };
}

async function importSeedData() {
  console.log('🔥 Khởi tạo Firebase Admin...\n');
  
  initializeApp({
    credential: cert(serviceAccount as any)
  });
  
  const db = getFirestore();

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
    const filePath = path.join(__dirname, 'firebase-seed', `${collectionName}.json`);

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

      for (const [docId, docData] of Object.entries(collectionData)) {
        await db.collection(collectionName).doc(docId).set(docData);
        console.log(`   ✓ ${docId}`);
      }
      
      console.log(`✅ Hoàn thành collection: ${collectionName}\n`);
    } catch (error) {
      console.error(`❌ Lỗi khi import ${collectionName}:`, error);
    }
  }

  console.log('🎉 Import hoàn tất!');
  console.log('\n💡 Giờ bạn có thể chạy: npm run dev');
}

importSeedData().catch(console.error);
