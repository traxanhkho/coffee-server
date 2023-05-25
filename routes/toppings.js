const express = require("express");
const { Topping, validateTopping } = require("../models/topping");
const bucket = require("../firebase/admin");
const getFileDownloadUrl = require("../utils/getFileDownloadUrl");
const multer = require("multer");

const router = express.Router();

router.get("/", async (req, res) => {
  const toppings = await Topping.find();

  res.send(toppings);
});

router.post("/", async (req, res) => {
  const { error } = validateTopping(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let topping = new Topping({
    name: req.body.name,
    price: req.body.price,
  });

  topping = await topping.save();
  res.send(topping);
});

// Configure multer
const upload = multer({ dest: "uploads/" }); // Specify the destination folder for uploaded files

router.post("/upload-image", upload.single("image"), async (req, res) => {
  const file = req.file; // Access the uploaded file via req.file
  const toppingId = req.body.toppingId; // Access the topping ID via req.body.toppingId

  const destination = "topping-" + Date.now() + "-" + file.originalname;
  // Perform further operations with the file and topping ID
  const uploadedFiles = await bucket.upload(file.path, {
    destination,
  });
  const uploadedFile = uploadedFiles[0];
  const fileUrl = await getFileDownloadUrl(uploadedFile);

  const topping = await Topping.findById(toppingId);
  if (!topping) return res.status(404).json({ message: "Topping not found" });

  topping.image = fileUrl;

  await topping.save();

  res.send(topping);
});

module.exports = router;
