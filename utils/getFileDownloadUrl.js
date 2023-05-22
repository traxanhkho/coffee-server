async function getFileDownloadUrl(file) {
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 10); // Set the expiration date to 10 years in the future

  const signedUrls = await file.getSignedUrl({
    action: "read",
    expires: expirationDate,
  });

  return signedUrls[0];
}


module.exports = getFileDownloadUrl ; 
