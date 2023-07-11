const express = require("express");
const axios = require("axios");
const bucket = require("../firebase/admin");
const getFileDownloadUrl = require("../utils/getFileDownloadUrl");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const jsonFile = bucket.file("vn-location.json");

    const downloadURL = await getFileDownloadUrl(jsonFile);
    // Fetch the JSON data using Axios
    const response = await axios.get(downloadURL);
    const jsonData = response.data;

    // Send the JSON data as the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error retrieving JSON data:", error);
    res.status(500).send("Error retrieving JSON data");
  }
});

module.exports = router;
