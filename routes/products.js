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

// Configure multer
const upload = multer({ dest: "uploads/" }); // Specify the destination folder for uploaded files

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const product = JSON.parse(req.body);

    const { error } = validateProduct(product);
    if (error) return res.status(400).send(error.details[0].message);

    let newProduct = new Product({
      name: product.name,
      genre: product.genre,
      description: product.description,
      toppings: product.toppings,
      sizes: product.sizes,
      price: product.price,
      numberInStock: product.numberInStock,
    });

    const file = req.file; // Access the uploaded file via req.file
    if (!file) return res.status(400).send("file is not define");

    const destination = "product-" + Date.now() + "-" + file.originalname;

    // Perform further operations with the file and product ID
    const uploadedFiles = await bucket.upload(file.path, {
      destination,
    });

    const uploadedFile = uploadedFiles[0];
    const fileUrl = await getFileDownloadUrl(uploadedFile);

    newProduct.image = {
      name: uploadedFile.name,
      url: fileUrl,
    };

    newProduct = await newProduct.save();
    res.send(newProduct);
  } catch (error) {
    res.status(500).send(error);
  }
});

// router.post("/upload-image", upload.single("image"), async (req, res) => {
//   const file = req.file; // Access the uploaded file via req.file
//   const productId = req.body.productId; // Access the product ID via req.body.productId

//   const destination = "product-" + Date.now() + "-" + file.originalname;
//   // Perform further operations with the file and product ID
//   const uploadedFiles = await bucket.upload(file.path, {
//     destination,
//   });
//   const uploadedFile = uploadedFiles[0];
//   const fileUrl = await getFileDownloadUrl(uploadedFile);

//   let product = await Product.findById(productId);
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   product.image = {
//     name: destination,
//     url: fileUrl,
//   };

//   product = await product.save();

//   res.send(product);
// });

module.exports = router;
