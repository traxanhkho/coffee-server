const bucket = require("../admin");

async function getFileStorage(filename) {
  return bucket.file(filename);
}

module.exports = getFileStorage;
