const express = require("express");
const _ = require("lodash");
const { Genre, validateGenre } = require("../models/genre");
const multer = require("multer");
const createFileStorage = require("../firebase/features/createFileStorage");
const updateFileStorage = require("../firebase/features/updateFileStorage");
const deleteFileStorage = require("../firebase/features/deleteFileStorage");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  if (!genres) return res.status(400).send("genres is empty!");

  res.send(genres);
});

router.post("/", upload.single("image"), async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newGenre = new Genre({
    name: req.body.name,
  });

  let image = {};
  if (req.file) {
    image = await createFileStorage(req.file);
    newGenre.image = _.cloneDeep(image);
  }

  await newGenre.save();

  res.send(newGenre);
});

router.put("/:genreId", upload.single("image"), async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let genreUpdate = await Genre.findById(req.params.genreId);
    if (!genreUpdate) return res.status(404).send("Genre not found");

    genreUpdate.name = req.body.name;

    let image = {};
    if (req.file) {
      if (genreUpdate["image"].name) {
        image = await updateFileStorage(genreUpdate["image"].name, req.file);
      } else {
        image = await createFileStorage(req.file);
      }

      genreUpdate.image = _.cloneDeep(image);
    }

    genreUpdate = await Genre.findByIdAndUpdate(
      req.params.genreId,
      _.cloneDeep(genreUpdate),
      { new: true }
    );

    res.send(genreUpdate);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:genreId", async (req, res) => {
  const genre = await Genre.findById(req.params.genreId);
  if (!genre) return res.status(404).send("Genre not found");

  res.send(genre);
});

router.delete("/:genreId", async (req, res) => {
  try {
    let genreDeleted = await Genre.findByIdAndDelete(req.params.genreId);
    if (!genreDeleted) return res.status(404).send("genre is not found!");

    if (genreDeleted["image"].name)
      deleteFileStorage(genreDeleted["image"].name);

    res.send(genreDeleted);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
