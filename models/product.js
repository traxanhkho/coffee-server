const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  toppings: [String],
  sizes: [
    new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    }),
  ],
  price: {
    type: Number,
    required: true,
  },
  numberInStock: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
  },
});

const Product = mongoose.model("Product", productSchema);

function validateProduct(product) {
  const productSchema = Joi.object({
    name: Joi.string().min(8).max(255).required(),
    genre: Joi.string().required(),
    description: Joi.string().required(),
    toppings: Joi.array(), 
    sizes: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number(),
        })
      )
      .required(),
    price: Joi.number().required(),
    numberInStock: Joi.number().required(),
  });

  return productSchema.validate(product);
}

module.exports = { Product, validateProduct };
