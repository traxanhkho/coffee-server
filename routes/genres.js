const express = require("express");
const { Genre, validateGenre } = require("../models/genre");

const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.send(genres);
});

router.post("/", async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = new Genre({
    name: req.body.name,
  });
  genre = await genre.save();

  res.send(genre);
});

module.exports = router;
