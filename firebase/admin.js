const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("../etc/secrets/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

const bucket = getStorage().bucket();

module.exports = bucket;
