import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { bucket } from "firebase-admin/storage";

admin.initializeApp();

export const uploadImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { base64Data, folder, filename } = data;

  if (!base64Data) {
    throw new functions.https.HttpsError("invalid-argument", "base64Data is required");
  }

  const folderName = folder || "images";
  const timestamp = Date.now();
  const fileName = filename || `${timestamp}-${Math.random().toString(36).substr(2, 9)}.jpg`;
  const filePath = `${folderName}/${fileName}`;

  try {
    const bucketRef = bucket();
    const file = bucketRef.file(filePath);

    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    await file.save(buffer, {
      metadata: {
        contentType: "image/jpeg",
        metadata: {
          uploadedBy: context.auth.uid,
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    const [metadata] = await file.getMetadata();
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketRef.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    return {
      success: true,
      url: downloadUrl,
      path: filePath,
      fullPath: filePath,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw new functions.https.HttpsError("internal", "Failed to upload image");
  }
});

export const deleteImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { path } = data;

  if (!path) {
    throw new functions.https.HttpsError("invalid-argument", "path is required");
  }

  try {
    const bucketRef = bucket();
    await bucketRef.file(path).delete();
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw new functions.https.HttpsError("internal", "Failed to delete image");
  }
});
