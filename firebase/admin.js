const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("./path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://coffee-server-4f96c.appspot.com",
});

const bucket = getStorage().bucket();

module.exports = bucket;
