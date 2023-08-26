const express = require("express");
const multer = require("multer");
const _ = require("lodash");
const { validateProduct, Product } = require("../models/product");
const createFileStorage = require("../firebase/features/createFileStorage");
const updateFileStorage = require("../firebase/features/updateFileStorage");
const deleteFileStorage = require("../firebase/features/deleteFileStorage");

const router = express.Router();

router.get("/", async (req, res) => {
  const { category } = req.query;

  try {
    let products;
    // Use Mongoose to fetch products by category
    if (category) {
      products = await Product.find({ genre: category }).populate("toppings");
    } else {
      products = await Product.find().populate("toppings");
    }
    res.send(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Unable to fetch products" });
  }
});

router.get("/search", async (req, res) => {
  const searchTerm = req.query.q;

  try {
    const results = await Product.find({
      $or: [{ name: { $regex: searchTerm, $options: "i" } }],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while searching." });
  }
});

// Configure multer
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const product = {
      name: JSON.parse(req.body.name),
      genre: JSON.parse(req.body.genre),
      description: JSON.parse(req.body.description),
      toppings: JSON.parse(_.cloneDeep(req.body.toppings)),
      sizes: JSON.parse(_.cloneDeep(req.body.sizes)),
      price: JSON.parse(req.body.price),
      numberInStock: JSON.parse(req.body.numberInStock),
    };

    const { error } = validateProduct(product);
    if (error) return res.status(400).send(error.details[0].message);

    let newProduct = new Product(_.cloneDeep(product));

    const file = req.file; // Access the uploaded file via req.file
    let image;
    if (file) {
      image = await createFileStorage(file);
      newProduct.image = _.cloneDeep(image);
    }

    await newProduct.save();
    res.send(newProduct);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const productDeleted = await Product.findByIdAndDelete(
      req.params.productId
    );
    if (!productDeleted) return res.status(404).send("product not found");

    await deleteFileStorage(productDeleted.image.name);

    res.send(productDeleted);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:productId", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "toppings"
    );
    if (!product) return res.status(404).send("product is not found");
    res.send(product);
  } catch (ex) {
    res.status(500).send(ex);
  }
});

router.put("/:productId", upload.single("image"), async (req, res) => {
  let product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).send("Cound not found this product ");

  let productUpdate = {
    name: JSON.parse(req.body.name),
    genre: JSON.parse(req.body.genre),
    description: JSON.parse(req.body.description),
    toppings: JSON.parse(_.cloneDeep(req.body.toppings)),
    sizes: JSON.parse(_.cloneDeep(req.body.sizes)),
    price: JSON.parse(req.body.price),
    numberInStock: JSON.parse(req.body.numberInStock),
  };

  const { error } = validateProduct(productUpdate);
  if (error) return res.status(400).send(error.details[0].message);

  const fileUpdate = req.file;

  try {
    let image = {};
    if (fileUpdate) {
      if (product["image"].name) {
        image = await updateFileStorage(product["image"].name, fileUpdate);
      } else {
        image = await createFileStorage(fileUpdate);
      }

      productUpdate.image = _.cloneDeep(image);
    }

    product = await Product.findByIdAndUpdate(
      req.params.productId,
      _.cloneDeep(productUpdate),
      { new: true }
    );

    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
