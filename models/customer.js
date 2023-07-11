const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  numberPhone: {
    type: String,
    required: true,
  },
  address: {
    city: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    district: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    ward: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    street: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("customer", customerSchema);

function validateCustomer(customer) {
  const customerSchema = Joi.object({
    name: Joi.string().required(),
    numberPhone: Joi.string().required(),
    address: Joi.object({
      city: Joi.string(),
      district: Joi.string(),
      ward: Joi.string(),
      street: Joi.string(),
    }),
    createdAt: Joi.date().default(Date.now),
  });

  return customerSchema.validate(customer);
}

module.exports = { Customer, validateCustomer };
