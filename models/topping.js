const Joi = require("joi");
const mongoose = require("mongoose");

const toppingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
});

const Topping = mongoose.model("Topping", toppingSchema);

function validateTopping(topping) {
  const toppingSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
  });

  return toppingSchema.validate(topping);
}

module.exports = { Topping, validateTopping };
