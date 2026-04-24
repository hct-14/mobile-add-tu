/**
 * Script to migrate base64 images to Cloudinary
 * Run this once to migrate existing base64 data in Firestore to Cloudinary
 *
 * Usage: npx tsx scripts/migrateBase64ToCloudinary.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { uploadBase64ToCloudinary } from '../src/lib/cloudinaryUpload';
import * as fs from 'fs';
import * as path from 'path';

const firebaseConfig = JSON.parse(
  fs.readFileSync('./firebase-applet-config.json', 'utf-8')
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MigrationResult {
  collection: string;
  documentId: string;
  field: string;
  oldValue: string;
  newUrl: string;
  cloudinaryPublicId: string;
}

async function migrateBase64ToCloudinary(): Promise<void> {
  console.log('🚀 Starting base64 to Cloudinary migration...\n');
  console.log('Cloud Name: alostore\n');

  const results: MigrationResult[] = [];
  const errors: { collection: string; docId: string; field: string; error: string }[] = [];

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
        let hasUpdates = false;
        const updates: Record<string, any> = {};

        for (const field of imageFields) {
          if (docData[field]) {
            // Handle single image field
            if (typeof docData[field] === 'string' && docData[field].startsWith('data:')) {
              console.log(`  📷 Migrating ${field} in ${collectionName}/${docId}`);

              try {
                const folder = `${collectionName}/${field}`;
                const result = await uploadBase64ToCloudinary(docData[field], folder);

                updates[field] = result.url;
                updates[`${field}CloudinaryId`] = result.publicId;
                hasUpdates = true;

                results.push({
                  collection: collectionName,
                  documentId: docId,
                  field,
                  oldValue: docData[field].substring(0, 50) + '...',
                  newUrl: result.url,
                  cloudinaryPublicId: result.publicId,
                });

                console.log(`    ✅ Migrated: ${result.url.substring(0, 50)}...`);
              } catch (error) {
                console.error(`    ❌ Error migrating ${field}:`, error);
                errors.push({
                  collection: collectionName,
                  docId,
                  field,
                  error: String(error),
                });
              }
            }

            // Handle array of images
            if (Array.isArray(docData[field])) {
              let arrayUpdated = false;
              const updatedImages: string[] = [];
              const updatedImageIds: string[] = [];

              for (let i = 0; i < docData[field].length; i++) {
                const img = docData[field][i];

                if (typeof img === 'string' && img.startsWith('data:')) {
                  console.log(`  📷 Migrating ${field}[${i}] in ${collectionName}/${docId}`);

                  try {
                    const folder = `${collectionName}/${field}`;
                    const result = await uploadBase64ToCloudinary(img, folder);

                    updatedImages.push(result.url);
                    updatedImageIds.push(result.publicId);

                    results.push({
                      collection: collectionName,
                      documentId: docId,
                      field: `${field}[${i}]`,
                      oldValue: img.substring(0, 50) + '...',
                      newUrl: result.url,
                      cloudinaryPublicId: result.publicId,
                    });

                    arrayUpdated = true;
                    console.log(`    ✅ Migrated: ${result.url.substring(0, 50)}...`);
                  } catch (error) {
                    console.error(`    ❌ Error migrating ${field}[${i}]:`, error);
                    errors.push({
                      collection: collectionName,
                      docId,
                      field: `${field}[${i}]`,
                      error: String(error),
                    });
                    updatedImages.push(img);
                  }
                } else {
                  updatedImages.push(img);
                }
              }

              if (arrayUpdated) {
                updates[field] = updatedImages;
                updates[`${field}CloudinaryIds`] = updatedImageIds;
                hasUpdates = true;
              }
            }
          }
        }

        // Update document if changes were made
        if (hasUpdates) {
          await updateDoc(doc(db, collectionName, docId), updates);
          console.log(`  💾 Updated document: ${docId}`);
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
    errors,
  };

  const reportPath = path.join(process.cwd(), 'migration-report.json');
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
migrateBase64ToCloudinary()
  .then(() => {
    console.log('\n✨ Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
