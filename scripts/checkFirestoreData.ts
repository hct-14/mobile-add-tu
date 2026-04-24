/**
 * Check actual data in Firestore to see image URLs format
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(
  fs.readFileSync('./firebase-applet-config.json', 'utf-8')
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkData() {
  console.log('🔍 Checking Firestore data...\n');

  const collectionsToCheck = ['products', 'banners', 'categories'];

  for (const collectionName of collectionsToCheck) {
    console.log(`\n📦 Collection: ${collectionName}`);
    console.log('='.repeat(50));

    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      console.log(`Total documents: ${snapshot.size}`);

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        console.log(`\n📄 Document: ${docSnap.id}`);
        
        // Check image field
        if (data.image) {
          console.log(`   image: ${data.image.substring(0, 80)}...`);
        }
        
        // Check images array
        if (data.images && Array.isArray(data.images)) {
          console.log(`   images (${data.images.length}):`);
          data.images.forEach((img: any, i: number) => {
            if (typeof img === 'string') {
              console.log(`      [${i}]: ${img.substring(0, 80)}...`);
            } else if (img && img.url) {
              console.log(`      [${i}]: ${img.url.substring(0, 80)}...`);
            }
          });
        }
        
        // Check other image fields
        ['imageUrl', 'icon', 'thumbnail'].forEach(field => {
          if (data[field]) {
            console.log(`   ${field}: ${String(data[field]).substring(0, 80)}...`);
          }
        });
      }
    } catch (error) {
      console.error(`❌ Error:`, error);
    }
  }
}

checkData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
