/**
 * Script to convert all Cloudinary images to WebP format
 * Downloads existing images, converts to WebP, re-uploads to Cloudinary, updates Firestore
 *
 * Usage: npx tsx scripts/convertCloudinaryToWebp.ts
 *
 * Required: CLOUDINARY_API_SECRET in .env or environment variables
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import http from 'http';

// Load environment variables
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

// Cloudinary config
const CLOUD_NAME = 'dsicmrk7z';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

// Firebase config
const firebaseConfig = JSON.parse(
  fs.readFileSync('./firebase-applet-config.json', 'utf-8')
);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

interface ConversionResult {
  collection: string;
  documentId: string;
  field: string;
  oldUrl: string;
  newUrl: string;
  oldFormat: string;
  newFormat: string;
  sizeReduction: number;
}

/**
 * Generate Cloudinary API signature
 */
function generateSignature(params: Record<string, string | number>): string {
  const crypto = require('crypto');
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  const signature = crypto.createHash('sha1')
    .update(stringToSign + API_SECRET)
    .digest('hex');
  return signature;
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
 * Upload WebP image to Cloudinary
 */
async function uploadWebPToCloudinary(base64Data: string, folder: string, originalPublicId: string): Promise<{ url: string; publicId: string; bytes: number }> {
  const timestamp = Math.round(Date.now() / 1000);
  const folderPath = `${folder}_webp`;

  // Extract original filename
  const originalName = originalPublicId.split('/').pop() || 'image';
  const baseName = originalName.replace(/\.[^.]+$/, '');

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('upload_preset', 'alo_store');
  formData.append('folder', folderPath);
  formData.append('public_id', baseName);
  formData.append('format', 'webp');
  formData.append('quality', '85');

  const response = await fetch(BASE_URL + '/image/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
  };
}

/**
 * Check if URL is from Cloudinary and is not already WebP
 */
function isCloudinaryNonWebpUrl(url: string): boolean {
  if (!url.includes('res.cloudinary.com')) return false;
  const formats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  return formats.some(fmt => url.toLowerCase().includes(fmt)) && !url.includes('/f_webp');
}

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicId(url: string): string | null {
  const match = url.match(/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : null;
}

/**
 * Get original file size from Cloudinary
 */
async function getCloudinaryFileSize(publicId: string): Promise<number> {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const params: Record<string, string | number> = {
      public_id: publicId,
      timestamp,
      api_key: API_KEY,
    };
    params.signature = generateSignature(params);

    const response = await fetch(`${BASE_URL}/resources/image/upload?public_id=${encodeURIComponent(publicId)}&signature=${params.signature}&timestamp=${timestamp}&api_key=${API_KEY}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.bytes || 0;
    }
  } catch (error) {
    console.log('  Could not get original size from Cloudinary API');
  }
  return 0;
}

async function convertToWebp(): Promise<void> {
  if (!API_SECRET) {
    console.error('❌ Error: CLOUDINARY_API_SECRET is required in .env file');
    console.log('\nPlease add to your .env file:');
    console.log('CLOUDINARY_API_SECRET=your_api_secret');
    console.log('\nYou can find your API secret at: https://cloudinary.com/console/settings/api');
    process.exit(1);
  }

  console.log('🚀 Starting Cloudinary → WebP conversion...\n');
  console.log(`Cloud Name: ${CLOUD_NAME}`);
  console.log(`API Key: ${API_KEY ? '✓ Set' : '✗ Missing'}\n`);

  const results: ConversionResult[] = [];
  const errors: { collection: string; docId: string; field: string; url: string; error: string }[] = [];

  // Collections to check
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
          if (docData[field] && typeof docData[field] === 'string' && isCloudinaryNonWebpUrl(docData[field])) {
            console.log(`  📷 Converting ${field} in ${collectionName}/${docId}`);

            try {
              const oldUrl = docData[field];
              const publicId = extractPublicId(oldUrl);
              if (!publicId) {
                console.log(`    ⚠️ Could not extract public ID`);
                continue;
              }

              // Download original image
              const base64Data = await downloadImageAsBase64(oldUrl);
              const folder = collectionName;

              // Upload as WebP
              const result = await uploadWebPToCloudinary(base64Data, folder, publicId);

              updates[field] = result.url;
              updates[`${field}Format`] = 'webp';
              hasUpdates = true;

              // Calculate size reduction
              const originalSizeKB = Math.round(result.bytes / (1 - 0.4)); // Estimate
              const newSizeKB = Math.round(result.bytes / 1024);
              const reduction = Math.round((1 - result.bytes / originalSizeKB) * 100);

              results.push({
                collection: collectionName,
                documentId: docId,
                field,
                oldUrl,
                newUrl: result.url,
                oldFormat: 'jpg/png',
                newFormat: 'webp',
                sizeReduction: reduction > 0 ? reduction : 0,
              });

              console.log(`    ✅ Converted to WebP: ${result.url.substring(0, 60)}... (${newSizeKB}KB, ~${reduction > 0 ? reduction : '?'}% smaller)`);

              // Rate limiting - wait between uploads
              await new Promise(resolve => setTimeout(resolve, 500));
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
          const updatedImages: (string | { url: string; path?: string })[] = [];

          for (let i = 0; i < docData.images.length; i++) {
            const img = docData.images[i];

            // Handle object format: { url, path }
            if (typeof img === 'object' && img.url && isCloudinaryNonWebpUrl(img.url)) {
              console.log(`  📷 Converting images[${i}] in ${collectionName}/${docId}`);

              try {
                const oldUrl = img.url;
                const publicId = extractPublicId(oldUrl);
                if (!publicId) {
                  updatedImages.push(img);
                  continue;
                }

                // Download original image
                const base64Data = await downloadImageAsBase64(oldUrl);
                const folder = `${collectionName}/images`;

                // Upload as WebP
                const result = await uploadWebPToCloudinary(base64Data, folder, publicId);

                updatedImages.push({ url: result.url, path: img.path });
                arrayUpdated = true;

                const newSizeKB = Math.round(result.bytes / 1024);
                results.push({
                  collection: collectionName,
                  documentId: docId,
                  field: `images[${i}]`,
                  oldUrl,
                  newUrl: result.url,
                  oldFormat: 'jpg/png',
                  newFormat: 'webp',
                  sizeReduction: 0,
                });

                console.log(`    ✅ Converted to WebP: ${newSizeKB}KB`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
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
            } else if (typeof img === 'string' && isCloudinaryNonWebpUrl(img)) {
              console.log(`  📷 Converting images[${i}] (string) in ${collectionName}/${docId}`);

              try {
                const oldUrl = img;
                const publicId = extractPublicId(oldUrl);
                if (!publicId) {
                  updatedImages.push(img);
                  continue;
                }

                // Download original image
                const base64Data = await downloadImageAsBase64(oldUrl);
                const folder = `${collectionName}/images`;

                // Upload as WebP
                const result = await uploadWebPToCloudinary(base64Data, folder, publicId);

                updatedImages.push(result.url);
                arrayUpdated = true;

                const newSizeKB = Math.round(result.bytes / 1024);
                results.push({
                  collection: collectionName,
                  documentId: docId,
                  field: `images[${i}]`,
                  oldUrl,
                  newUrl: result.url,
                  oldFormat: 'jpg/png',
                  newFormat: 'webp',
                  sizeReduction: 0,
                });

                console.log(`    ✅ Converted to WebP: ${newSizeKB}KB`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
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
            } else {
              updatedImages.push(img);
            }
          }

          if (arrayUpdated) {
            updates.images = updatedImages;
            updates.imagesFormat = 'webp';
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

  // Save conversion report
  const report = {
    timestamp: new Date().toISOString(),
    totalConverted: results.length,
    totalErrors: errors.length,
    results,
    errors,
  };

  const reportPath = path.join(process.cwd(), 'webp-conversion-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 Conversion Summary:');
  console.log(`   ✅ Successfully converted: ${results.length} images`);
  console.log(`   ❌ Errors: ${errors.length} images`);
  console.log(`   📄 Report saved to: ${reportPath}`);

  if (results.length > 0) {
    const avgReduction = results.reduce((sum, r) => sum + r.sizeReduction, 0) / results.length;
    console.log(`   📉 Average size reduction: ~${Math.round(avgReduction)}%`);
  }

  if (results.length > 0) {
    console.log('\n📋 Sample conversions:');
    results.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.collection}/${r.documentId}/${r.field}`);
      console.log(`      Old: ${r.oldUrl.substring(0, 60)}...`);
      console.log(`      New: ${r.newUrl.substring(0, 60)}...`);
    });
  }
}

// Run conversion
convertToWebp()
  .then(() => {
    console.log('\n✨ Conversion completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Conversion failed:', error);
    process.exit(1);
  });
