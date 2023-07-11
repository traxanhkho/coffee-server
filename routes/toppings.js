const express = require("express");
const { Topping, validateTopping } = require("../models/topping");
const bucket = require("../firebase/admin");
const getFileDownloadUrl = require("../utils/getFileDownloadUrl");
const multer = require("multer");
const _ = require("lodash");
const createFileStorage = require("../firebase/features/createFileStorage");
const deleteFileStorage = require("../firebase/features/deleteFileStorage");
const updateFileStorage = require("../firebase/features/updateFileStorage");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res) => {
  const toppings = await Topping.find();

  res.send(toppings);
});

router.post("/", upload.single("image"), async (req, res) => {
  const toppingValidate = {
    name: req.body.name,
    price: req.body.price,
  };
  const { error } = validateTopping(toppingValidate);
  if (error) return res.status(400).send(error.details[0].message);

  let newTopping = new Topping({
    name: req.body.name,
    price: req.body.price,
  });

  let image = {};
  if (req.file) {
    image = await createFileStorage(req.file);
  }

  newTopping.image = image;
  newTopping = await newTopping.save();
  res.send(newTopping);
});

router.delete("/:toppingId", async (req, res) => {
  const toppingDeleted = await Topping.findByIdAndDelete(req.params.toppingId);
  if (!toppingDeleted) return res.status(404).send("topping not found!");

  await deleteFileStorage(toppingDeleted.image.name);

  res.send(toppingDeleted);
});

router.put("/:toppingId", upload.single("image"), async (req, res) => {
  let topping = await Topping.findById(req.params.toppingId);
  if (!topping)
    return res.status(404).send("could not found this topping");

  let toppingUpdate = { name: req.body.name, price: req.body.price };
  
  const { error } = validateTopping(toppingUpdate);
  if (error) return res.status(400).send(error.details[0].message);

  let image = {};
  if (req.file) {
    if (topping["image"].name) {
      image = await updateFileStorage(topping["image"].name, req.file);
    } else {
      image = await createFileStorage(req.file);
    }

    toppingUpdate.image = _.cloneDeep(image);
  }

  topping = await Topping.findByIdAndUpdate(
    req.params.toppingId,
    toppingUpdate,
    { new: true }
  );

  res.send(topping);
});

module.exports = router;
