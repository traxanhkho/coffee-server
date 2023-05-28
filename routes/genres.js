const express = require("express");
const { Genre, validateGenre } = require("../models/genre");
const multer = require("multer");
const bucket = require("../firebase/admin");

const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.send(genres);
});

router.post("/", async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({
    name: req.body.name,
  });

  await genre.save();

  res.send(genre);
});

router.put("/:genreId", async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newGenre = await Genre.findByIdAndUpdate(req.params.genreId, req.body, {
    new: true,
  });
  if (!newGenre) return res.status(404).send("Genre not found");

  res.send(newGenre);
});

router.get("/:genreId", async (req, res) => {
  const genre = await Genre.findById(req.params.genreId);
  if (!genre) return res.status(404).send("Genre not found");

  res.send(genre);
});


// Configure multer
const upload = multer({ dest: "uploads/" }); // Specify the destination folder for uploaded files

router.post("/upload-image", upload.single("image"), async (req, res) => {
  const file = req.file; // Access the uploaded file via req.file
  const genreId = req.body.genreId; // Access the product ID via req.body.productId

  const destination = "genre-" + Date.now() + "-" + file.originalname;
  // Perform further operations with the file and product ID
  const uploadedFiles = await bucket.upload(file.path, {
    destination,
  });

  const uploadedFile = uploadedFiles[0];
  const fileUrl = await getFileDownloadUrl(uploadedFile);

  let genre = await Genre.findById(genreId);
  if (!genre) return res.status(404).json({ message: "Product not found" });

  genre.image = {
    name: destination,
    url: fileUrl,
  };

  genre = await genre.save();

  res.send(genre);
});

// router.delete('/:genreId' , async (req, res) =>{
//    const genre =  await Genre.findByIdAndDelete(req.params.genreId) ; 
//    if(!genre) return res.status(404).send('Genre not found') ; 

//    await bucket.file('')

//    res.send(genre) ; 
// })

module.exports = router;
