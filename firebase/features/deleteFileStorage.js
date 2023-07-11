const bucket = require("../admin");

async function deleteFileStorage(filename) {
  if (!filename) return null;
  const file = bucket.file(filename);
  await file.delete();
}

module.exports = deleteFileStorage;
