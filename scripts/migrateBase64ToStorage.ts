/**
 * Script to migrate base64 images to Firebase Storage
 * Run this once to migrate existing base64 data in Firestore to Firebase Storage
 * 
 * Usage: npx tsx scripts/migrateBase64ToStorage.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase config - adjust path as needed
const firebaseConfig = JSON.parse(
  fs.readFileSync('./firebase-applet-config.json', 'utf-8')
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const storage = getStorage(app);

interface MigrationResult {
  collection: string;
  documentId: string;
  field: string;
  oldValue: string;
  newUrl: string;
  storagePath: string;
}

async function migrateBase64ToStorage(): Promise<void> {
  console.log('🚀 Starting base64 to Firebase Storage migration...\n');

  const results: MigrationResult[] = [];
  const errors: { collection: string; docId: string; error: string }[] = [];

  // Define collections and fields to check for base64 images
  const collectionsToCheck = ['products', 'banners', 'categories', 'campaigns'];
  const imageFields = ['image', 'imageUrl', 'images', 'icon'];

  for (const collectionName of collectionsToCheck) {
    console.log(`📦 Checking collection: ${collectionName}`);
    
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      for (const docSnap of snapshot.docs) {
        const docData = docSnap.data();
        const docId = docSnap.id;

        for (const field of imageFields) {
          if (docData[field]) {
            // Handle single image field
            if (typeof docData[field] === 'string' && docData[field].startsWith('data:')) {
              console.log(`  📷 Migrating ${field} in ${collectionName}/${docId}`);
              
              try {
                const storagePath = `${collectionName}/${docId}/${field}_${Date.now()}.jpg`;
                const storageRef = ref(storage, storagePath);
                
                // Upload base64 string directly
                await uploadString(storageRef, docData[field], 'data_url');
                
                // Get download URL
                const downloadUrl = await getDownloadURL(storageRef);

                // Update Firestore document
                await updateDoc(doc(db, collectionName, docId), {
                  [field]: downloadUrl,
                  [`${field}StoragePath`]: storagePath // Keep path for future deletion
                });

                results.push({
                  collection: collectionName,
                  documentId: docId,
                  field,
                  oldValue: docData[field].substring(0, 50) + '...',
                  newUrl: downloadUrl,
                  storagePath
                });

                console.log(`    ✅ Migrated: ${downloadUrl.substring(0, 50)}...`);
              } catch (error) {
                console.error(`    ❌ Error migrating ${field}:`, error);
                errors.push({
                  collection: collectionName,
                  docId,
                  error: String(error)
                });
              }
            }

            // Handle array of images
            if (Array.isArray(docData[field])) {
              for (let i = 0; i < docData[field].length; i++) {
                const img = docData[field][i];
                
                if (typeof img === 'string' && img.startsWith('data:')) {
                  console.log(`  📷 Migrating ${field}[${i}] in ${collectionName}/${docId}`);
                  
                  try {
                    const storagePath = `${collectionName}/${docId}/${field}_${i}_${Date.now()}.jpg`;
                    const storageRef = ref(storage, storagePath);
                    
                    await uploadString(storageRef, img, 'data_url');
                    const downloadUrl = await getDownloadURL(storageRef);

                    // Create updated array
                    const updatedImages = [...docData[field]];
                    updatedImages[i] = downloadUrl;

                    await updateDoc(doc(db, collectionName, docId), {
                      [field]: updatedImages
                    });

                    results.push({
                      collection: collectionName,
                      documentId: docId,
                      field: `${field}[${i}]`,
                      oldValue: img.substring(0, 50) + '...',
                      newUrl: downloadUrl,
                      storagePath
                    });

                    console.log(`    ✅ Migrated: ${downloadUrl.substring(0, 50)}...`);
                  } catch (error) {
                    console.error(`    ❌ Error migrating ${field}[${i}]:`, error);
                    errors.push({
                      collection: collectionName,
                      docId,
                      error: String(error)
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error reading collection ${collectionName}:`, error);
    }
  }

  // Save migration report
  const report = {
    timestamp: new Date().toISOString(),
    totalMigrated: results.length,
    totalErrors: errors.length,
    results,
    errors
  };

  const reportPath = path.join(__dirname, '../migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successfully migrated: ${results.length} images`);
  console.log(`   ❌ Errors: ${errors.length} images`);
  console.log(`   📄 Report saved to: ${reportPath}`);

  if (results.length > 0) {
    console.log('\n📋 Sample migrations:');
    results.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.collection}/${r.documentId}/${r.field}`);
      console.log(`      Old: ${r.oldValue}`);
      console.log(`      New: ${r.newUrl.substring(0, 60)}...`);
    });
  }
}

// Run migration
migrateBase64ToStorage()
  .then(() => {
    console.log('\n✨ Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
