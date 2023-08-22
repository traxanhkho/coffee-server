const Joi = require("joi");
const mongoose = require("mongoose");
const { User } = require("./user");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User,
  },
  aboutMe: String,
  position: String,
  numberPhone: String,
  address: String,
  image: {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
  },
});

const Profile = mongoose.model("profile", profileSchema);

function validateProfile(profile) {
  const profileSchema = Joi.object({
    aboutMe: Joi.string(),
    position: Joi.string(),
    address: Joi.string(),
    numberPhone: Joi.string(),
  });

  return profileSchema.validate(profile);
}

module.exports = { Profile, validateProfile };
