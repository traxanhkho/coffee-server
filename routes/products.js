const express = require("express");
const multer = require("multer");
const { validateProduct, Product } = require("../models/product");
const bucket = require("../firebase/admin");
const getFileDownloadUrl = require("../utils/getFileDownloadUrl");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

router.post("/", async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let product = new Product({
    name: req.body.name,
    genre: req.body.genre,
    description: req.body.description,
    toppings: req.body.toppings,
    sizes: req.body.sizes,
    price: req.body.price,
    numberInStock: req.body.numberInStock,
  });

  product = await product.save();
  res.send(product);
});

// Configure multer
const upload = multer({ dest: "uploads/" }); // Specify the destination folder for uploaded files

router.post("/upload-image", upload.single("image"), async (req, res) => {
  const file = req.file; // Access the uploaded file via req.file
  const productId = req.body.productId; // Access the product ID via req.body.productId

  const destination = "product-" + Date.now() + "-" + file.originalname;
  // Perform further operations with the file and product ID
  const uploadedFiles = await bucket.upload(file.path, {
    destination,
  });
  const uploadedFile = uploadedFiles[0];
  const fileUrl = await getFileDownloadUrl(uploadedFile);

  let product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.image = {
    name: destination,
    url: fileUrl,
  };

  product = await product.save();

  res.send(product);
});

module.exports = router;
