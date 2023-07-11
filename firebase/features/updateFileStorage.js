const bucket = require("../admin");
const getFileDownloadUrl = require("../../utils/getFileDownloadUrl");

async function updateFileStorage(filePath, fileUpdate) {
  const options = {
    destination: filePath,
  };

  const uploadedFiles = await bucket.upload(fileUpdate.path, options);

  const uploadedFile = uploadedFiles[0];
  const fileUrl = await getFileDownloadUrl(uploadedFile);
  return {
    name: uploadedFile.name,
    url: fileUrl,
  };
}

module.exports = updateFileStorage;
