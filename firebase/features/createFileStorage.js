const getFileDownloadUrl = require("../../utils/getFileDownloadUrl");
const bucket = require("../admin");

async function createFileStorage(file) {
  const destination = "product-" + Date.now() + "-" + file.originalname;

  // Perform further operations with the file and product ID
  const uploadedFiles = await bucket.upload(file.path, {
    destination,
  });

  const uploadedFile = uploadedFiles[0];
  const fileUrl = await getFileDownloadUrl(uploadedFile);

  return {
    name: uploadedFile.name,
    url: fileUrl,
  };
}

module.exports = createFileStorage;
