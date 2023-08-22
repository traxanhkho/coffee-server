const Joi = require("joi");
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  numberPhone: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    city: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    district: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    ward: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    street: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: true,
  },
});

customerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(_.pick(this, ["_id"]), config.get("jwtPrivateKey"));
  return token;
};

const Customer = mongoose.model("customer", customerSchema);

function validateCustomerUpdate(customer) {
  const customerUpdateSchema = Joi.object({
    name: Joi.string().required(),
    numberPhone: Joi.string(),
    address: Joi.object({
      city: Joi.string() , 
      district: Joi.string() , 
      ward: Joi.string() , 
      street: Joi.string(),
    }).required(),
  });

  return customerUpdateSchema.validate(customer);
}

function validateCustomer(customer) {
  const customerSchema = Joi.object({
    numberPhone: Joi.string().required(),
    password: Joi.string().required(),
    createdAt: Joi.date().default(Date.now),
  });

  return customerSchema.validate(customer);
}

module.exports = { Customer, validateCustomer, validateCustomerUpdate };
