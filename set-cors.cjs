const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");

const serviceAccount = require("./alostore-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "alostore-61726.firebasestorage.app",
});

async function setCors() {
  const storage = new Storage({
    projectId: "alostore-61726",
    keyFilename: "./alostore-firebase-adminsdk.json",
  });

  const corsConfig = [
    {
      origin: ["*"],
      method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
      maxAgeSeconds: 3600,
      responseHeader: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
    },
  ];

  try {
    await storage.bucket("alostore-61726.firebasestorage.app").setMetadata({
      cors: corsConfig,
    });
    console.log("CORS configured successfully!");
  } catch (error) {
    console.error("Error setting CORS:", error);
  }
}

setCors();
