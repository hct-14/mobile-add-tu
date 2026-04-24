/**
 * Script để chuyển đổi tất cả ảnh Cloudinary sang WebP
 *
 * Cách 1 - Dùng Cloudinary Upload API (RECOMMENDED):
 *   1. Chạy: npx tsx scripts/convertToWebp.ts --list
 *      -> Xem có bao nhiêu ảnh cần convert
 *
 *   2. Chạy: npx tsx scripts/convertToWebp.ts --convert
 *      -> Convert tất cả ảnh sang WebP
 *
 *   3. Chạy: npx tsx scripts/convertToWebp.ts --update
 *      -> Cập nhật URLs trong Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Load .env
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
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Image fields to check per collection
const collectionFields: Record<string, string[]> = {
  products: ['image', 'images', 'variants'],
  banners: ['imageUrl'],
  categories: ['icon'],
  campaigns: [],
};

// Stats
interface ImageInfo {
  collection: string;
  docId: string;
  field: string;
  url: string;
  format: string;
}

const allImages: ImageInfo[] = [];
const nonWebpImages: ImageInfo[] = [];
let processedCount = 0;
let errorCount = 0;

/**
 * Check if URL is Cloudinary and not WebP
 */
function isCloudinaryNonWebp(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.includes('res.cloudinary.com')) return false;
  if (url.includes('/f_webp')) return false;
  const formats = ['.jpg', '.jpeg', '.png', '.gif'];
  return formats.some(f => url.toLowerCase().includes(f));
}

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicId(url: string): string | null {
  const match = url.match(/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : null;
}

/**
 * Extract format from URL
 */
function extractFormat(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
  return match ? match[1].toLowerCase() : 'unknown';
}

/**
 * Generate SHA1 signature for Cloudinary API
 */
function generateSignature(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  return createHash('sha1')
    .update(stringToSign + API_SECRET)
    .digest('hex');
}

/**
 * Convert single image using Cloudinary upload with fetch_format
 * Uses URL-based upload to fetch from existing Cloudinary URL and convert to WebP
 */
async function convertImageToWebp(publicId: string, originalUrl: string): Promise<{ url: string; bytes: number }> {
  const timestamp = Math.round(Date.now() / 1000);

  // Parameters for signed upload - using URL as file source
  const params: Record<string, string> = {
    api_key: API_KEY,
    fetch_format: 'webp',
    file: originalUrl, // URL to fetch from
    folder: 'alo_store_webp', // Save in new folder to avoid conflicts
    overwrite: 'false', // Don't overwrite original
    public_id: publicId,
    quality: 'auto',
    timestamp: timestamp.toString(),
  };

  const signature = generateSignature(params);

  const formData = new FormData();
  Object.entries(params).forEach(([k, v]) => formData.append(k, v));
  formData.append('signature', signature);

  const response = await fetch(`${BASE_URL}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return { url: result.secure_url, bytes: result.bytes };
}

/**
 * Scan Firestore for all Cloudinary images
 */
async function scanFirestore(): Promise<void> {
  console.log('🔍 Scanning Firestore for Cloudinary images...\n');

  const collections = ['products', 'banners', 'categories', 'campaigns'];

  for (const collectionName of collections) {
    console.log(`📦 Collection: ${collectionName}`);

    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      for (const docSnap of snapshot.docs) {
        const docData = docSnap.data();
        const docId = docSnap.id;

        // Check main image fields
        for (const field of ['image', 'imageUrl', 'icon']) {
          if (docData[field] && typeof docData[field] === 'string') {
            const url = docData[field];
            allImages.push({
              collection: collectionName,
              docId,
              field,
              url,
              format: extractFormat(url),
            });

            if (isCloudinaryNonWebp(url)) {
              nonWebpImages.push({
                collection: collectionName,
                docId,
                field,
                url,
                format: extractFormat(url),
              });
            }
          }
        }

        // Check images array
        if (docData.images && Array.isArray(docData.images)) {
          docData.images.forEach((img: string | { url?: string }, index: number) => {
            const url = typeof img === 'string' ? img : img?.url;
            if (url && typeof url === 'string') {
              allImages.push({
                collection: collectionName,
                docId,
                field: `images[${index}]`,
                url,
                format: extractFormat(url),
              });

              if (isCloudinaryNonWebp(url)) {
                nonWebpImages.push({
                  collection: collectionName,
                  docId,
                  field: `images[${index}]`,
                  url,
                  format: extractFormat(url),
                });
              }
            }
          });
        }

        // Check variants
        if (docData.variants && Array.isArray(docData.variants)) {
          docData.variants.forEach((variant: { image?: string }, index: number) => {
            if (variant.image && typeof variant.image === 'string') {
              const url = variant.image;
              allImages.push({
                collection: collectionName,
                docId,
                field: `variants[${index}].image`,
                url,
                format: extractFormat(url),
              });

              if (isCloudinaryNonWebp(url)) {
                nonWebpImages.push({
                  collection: collectionName,
                  docId,
                  field: `variants[${index}].image`,
                  url,
                  format: extractFormat(url),
                });
              }
            }
          });
        }
      }

      console.log(`   Found ${allImages.filter(i => i.collection === collectionName).length} images, ${nonWebpImages.filter(i => i.collection === collectionName).length} non-WebP\n`);
    } catch (error) {
      console.error(`   ❌ Error scanning ${collectionName}:`, error);
    }
  }
}

/**
 * Convert non-WebP images to WebP
 */
async function convertImages(): Promise<void> {
  if (!API_SECRET) {
    console.error('❌ CLOUDINARY_API_SECRET is required!');
    console.log('Add it to your .env file');
    process.exit(1);
  }

  console.log(`\n🔄 Converting ${nonWebpImages.length} images to WebP...\n`);

  const results: { oldUrl: string; newUrl: string; publicId: string }[] = [];
  const errors: { url: string; error: string }[] = [];

  for (let i = 0; i < nonWebpImages.length; i++) {
    const img = nonWebpImages[i];
    process.stdout.write(`  [${i + 1}/${nonWebpImages.length}] Converting ${img.field} in ${img.collection}/${img.docId}... `);

    try {
      const publicId = extractPublicId(img.url);
      if (!publicId) {
        console.log('⚠️  Could not extract public ID');
        errors.push({ url: img.url, error: 'Could not extract public ID' });
        continue;
      }

      const result = await convertImageToWebp(publicId, img.url);
      results.push({ oldUrl: img.url, newUrl: result.url, publicId });

      const oldKB = '?';
      const newKB = Math.round(result.bytes / 1024);
      console.log(`✅ ${newKB}KB`);
      processedCount++;

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`❌ ${error}`);
      errors.push({ url: img.url, error: String(error) });
      errorCount++;
    }
  }

  // Save results
  const report = { results, errors, timestamp: new Date().toISOString() };
  fs.writeFileSync('webp-convert-results.json', JSON.stringify(report, null, 2));

  console.log(`\n📊 Conversion complete:`);
  console.log(`   ✅ Converted: ${processedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📄 Results saved: webp-convert-results.json`);
}

/**
 * Update Firestore with new WebP URLs
 */
async function updateFirestore(): Promise<void> {
  console.log('\n📝 Updating Firestore with new WebP URLs...\n');

  if (!fs.existsSync('webp-convert-results.json')) {
    console.error('❌ No conversion results found. Run --convert first.');
    return;
  }

  const report = JSON.parse(fs.readFileSync('webp-convert-results.json', 'utf-8'));
  const results = report.results;

  console.log(`Found ${results.length} converted images to update\n`);

  // Group by collection and docId for efficient updates
  const updatesByDoc: Record<string, { collection: string; docId: string; changes: Record<string, string> }> = {};

  for (const r of results) {
    // Find which collection and docId this URL belongs to
    for (const img of nonWebpImages) {
      if (img.url === r.oldUrl) {
        const key = `${img.collection}/${img.docId}`;
        if (!updatesByDoc[key]) {
          updatesByDoc[key] = {
            collection: img.collection,
            docId: img.docId,
            changes: {},
          };
        }
        updatesByDoc[key].changes[img.field] = r.newUrl;
        break;
      }
    }
  }

  let updated = 0;
  for (const [key, data] of Object.entries(updatesByDoc)) {
    try {
      await updateDoc(doc(db, data.collection, data.docId), data.changes);
      console.log(`  ✅ Updated ${data.collection}/${data.docId} (${Object.keys(data.changes).length} fields)`);
      updated++;
    } catch (error) {
      console.error(`  ❌ Failed to update ${data.collection}/${data.docId}:`, error);
    }
  }

  console.log(`\n📊 Update complete: ${updated} documents updated`);
}

// Main
const args = process.argv.slice(2);
const mode = args[0];

async function main() {
  switch (mode) {
    case '--list':
      await scanFirestore();
      console.log('\n📊 Summary:');
      console.log(`   Total images found: ${allImages.length}`);
      console.log(`   Images already WebP: ${allImages.length - nonWebpImages.length}`);
      console.log(`   Images to convert: ${nonWebpImages.length}`);
      console.log(`\nBreakdown:`);
      const byFormat = nonWebpImages.reduce((acc, img) => {
        acc[img.format] = (acc[img.format] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      Object.entries(byFormat).forEach(([fmt, count]) => {
        console.log(`   ${fmt.toUpperCase()}: ${count}`);
      });
      break;

    case '--convert':
      await scanFirestore();
      if (nonWebpImages.length === 0) {
        console.log('✅ All images are already WebP!');
        return;
      }
      await convertImages();
      break;

    case '--update':
      await updateFirestore();
      break;

    case '--full':
      await scanFirestore();
      if (nonWebpImages.length > 0) {
        await convertImages();
      }
      if (processedCount > 0) {
        await updateFirestore();
      }
      break;

    default:
      console.log(`
🚀 Cloudinary to WebP Conversion Script

Usage:
  npx tsx scripts/convertToWebp.ts [mode]

Modes:
  --list    Scan and list all images that need conversion (no changes)
  --convert Convert all non-WebP images to WebP (requires API_SECRET)
  --update  Update Firestore with new WebP URLs
  --full    Run all steps (scan + convert + update)

Required environment variables in .env:
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret

Get credentials from: https://cloudinary.com/console/settings/api
`);
  }
}

main().catch(console.error);
