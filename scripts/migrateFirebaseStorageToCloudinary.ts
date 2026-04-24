/**
 * Script to migrate images from Firebase Storage to Cloudinary
 * Downloads from Firebase Storage, uploads to Cloudinary, updates Firestore
 *
 * Usage: npx tsx scripts/migrateFirebaseStorageToCloudinary.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { uploadBase64ToCloudinary } from '../src/lib/cloudinaryUpload';
import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import http from 'http';

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
  oldUrl: string;
  newUrl: string;
  cloudinaryPublicId: string;
}

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Download image from URL and return as base64
 */
async function downloadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImageAsBase64(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = response.headers['content-type'] || 'image/jpeg';
        const base64 = buffer.toString('base64');
        resolve(`data:${contentType};base64,${base64}`);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Check if URL is Firebase Storage URL
 */
function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com');
}

/**
 * Extract path from Firebase Storage URL
 */
function extractFirebasePath(url: string): string | null {
  const match = url.match(/o\/(.+?)\?/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(base64Data: string, folder: string): Promise<CloudinaryUploadResult> {
  const result = await uploadBase64ToCloudinary(base64Data, folder);
  return {
    url: result.url,
    publicId: result.publicId,
  };
}

async function migrate(): Promise<void> {
  console.log('🚀 Starting Firebase Storage → Cloudinary migration...\n');
  console.log('Cloud Name: dsicmrk7z\n');

  const results: MigrationResult[] = [];
  const errors: { collection: string; docId: string; field: string; url: string; error: string }[] = [];

  // Collections to migrate
  const collectionsToCheck = ['products', 'banners', 'categories', 'campaigns'];
  const imageFields = ['image', 'imageUrl', 'icon'];

  for (const collectionName of collectionsToCheck) {
    console.log(`📦 Processing collection: ${collectionName}`);

    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      for (const docSnap of snapshot.docs) {
        const docData = docSnap.data();
        const docId = docSnap.id;
        const updates: Record<string, any> = {};
        let hasUpdates = false;

        // Check single image fields
        for (const field of imageFields) {
          if (docData[field] && typeof docData[field] === 'string' && isFirebaseStorageUrl(docData[field])) {
            console.log(`  📷 Migrating ${field} in ${collectionName}/${docId}`);

            try {
              const base64Data = await downloadImageAsBase64(docData[field]);
              const folder = `${collectionName}/${field}`;
              const result = await uploadToCloudinary(base64Data, folder);

              updates[field] = result.url;
              updates[`${field}CloudinaryId`] = result.publicId;
              hasUpdates = true;

              results.push({
                collection: collectionName,
                documentId: docId,
                field,
                oldUrl: docData[field],
                newUrl: result.url,
                cloudinaryPublicId: result.publicId,
              });

              console.log(`    ✅ Uploaded: ${result.url.substring(0, 60)}...`);
            } catch (error) {
              console.error(`    ❌ Error:`, error);
              errors.push({
                collection: collectionName,
                docId,
                field,
                url: docData[field],
                error: String(error),
              });
            }
          }
        }

        // Check images array field
        if (docData.images && Array.isArray(docData.images)) {
          let arrayUpdated = false;
          const updatedImages: string[] = [];
          const updatedImageCloudinaryIds: string[] = [];

          for (let i = 0; i < docData.images.length; i++) {
            const img = docData.images[i];

            // Handle object format: { url, path }
            if (typeof img === 'object' && img.url && isFirebaseStorageUrl(img.url)) {
              console.log(`  📷 Migrating images[${i}] in ${collectionName}/${docId}`);

              try {
                const base64Data = await downloadImageAsBase64(img.url);
                const folder = `${collectionName}/images`;
                const result = await uploadToCloudinary(base64Data, folder);

                // Preserve the path reference
                updatedImages.push({ url: result.url, path: img.path, cloudinaryId: result.publicId });
                updatedImageCloudinaryIds.push(result.publicId);
                arrayUpdated = true;

                results.push({
                  collection: collectionName,
                  documentId: docId,
                  field: `images[${i}]`,
                  oldUrl: img.url,
                  newUrl: result.url,
                  cloudinaryPublicId: result.publicId,
                });

                console.log(`    ✅ Uploaded: ${result.url.substring(0, 60)}...`);
              } catch (error) {
                console.error(`    ❌ Error:`, error);
                errors.push({
                  collection: collectionName,
                  docId,
                  field: `images[${i}]`,
                  url: img.url,
                  error: String(error),
                });
                updatedImages.push(img);
              }
            } else if (typeof img === 'string' && isFirebaseStorageUrl(img)) {
              // Handle string format
              console.log(`  📷 Migrating images[${i}] (string) in ${collectionName}/${docId}`);

              try {
                const base64Data = await downloadImageAsBase64(img);
                const folder = `${collectionName}/images`;
                const result = await uploadToCloudinary(base64Data, folder);

                updatedImages.push(result.url);
                updatedImageCloudinaryIds.push(result.publicId);
                arrayUpdated = true;

                results.push({
                  collection: collectionName,
                  documentId: docId,
                  field: `images[${i}]`,
                  oldUrl: img,
                  newUrl: result.url,
                  cloudinaryPublicId: result.publicId,
                });

                console.log(`    ✅ Uploaded: ${result.url.substring(0, 60)}...`);
              } catch (error) {
                console.error(`    ❌ Error:`, error);
                errors.push({
                  collection: collectionName,
                  docId,
                  field: `images[${i}]`,
                  url: img,
                  error: String(error),
                });
                updatedImages.push(img);
              }
            } else if (typeof img === 'object') {
              updatedImages.push(img);
            } else if (typeof img === 'string') {
              updatedImages.push(img);
            }
          }

          if (arrayUpdated) {
            updates.images = updatedImages;
            updates.imagesCloudinaryIds = updatedImageCloudinaryIds;
            hasUpdates = true;
          }
        }

        // Update document if changes were made
        if (hasUpdates) {
          await updateDoc(doc(db, collectionName, docId), updates);
          console.log(`  💾 Updated: ${docId}\n`);
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

  const reportPath = path.join(process.cwd(), 'cloudinary-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successfully migrated: ${results.length} images`);
  console.log(`   ❌ Errors: ${errors.length} images`);
  console.log(`   📄 Report saved to: ${reportPath}`);

  if (results.length > 0) {
    console.log('\n📋 Sample migrations:');
    results.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.collection}/${r.documentId}/${r.field}`);
      console.log(`      Old: ${r.oldUrl.substring(0, 60)}...`);
      console.log(`      New: ${r.newUrl.substring(0, 60)}...`);
    });
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✨ Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
