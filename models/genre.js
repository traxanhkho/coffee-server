const Joi = require("joi");
const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

const Genre = mongoose.model("genre", genreSchema);

function validateGenre(genre) {
  const genreSchema = Joi.object({
    name: Joi.string().required(),
  });

  return genreSchema.validate(genre);
}

module.exports = { Genre, validateGenre };
