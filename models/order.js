const Joi = require("joi");
const mongoose = require("mongoose");
const { Customer } = require("./customer");
const { Product } = require("./product");
const { Topping } = require("./topping");

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: Customer,
  },
  products: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: Product,
      },
      size: {
        type: String,
        required: true,
      },
      totalAmount: {
        type: Number,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      toppings: [
        {
          toppingId: {
            type: mongoose.Types.ObjectId,
            ref: Topping,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
    },
  ],
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  note: String,
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("order", orderSchema);

function validateOrderStatus(orderStatus) {
  const orderStatusSchema = Joi.string().valid(
    "pending",
    "processing",
    "completed",
    "cancelled"
  );

  return orderStatusSchema.validate(orderStatus);
}



function validateOrder(order) {
  const orderSchema = Joi.object({
    customerId: Joi.string().required(),
    status: Joi.string()
      .valid("pending", "processing", "completed", "cancelled")
      .default("pending"),
    products: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().required().min(1),
        size: Joi.string().required().default("vừa"),
        toppings: Joi.array().items(
          Joi.object({
            toppingId: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
          })
        ),
      })
    ),
    note: Joi.string(),
  });

  return orderSchema.validate(order);
}

module.exports = { Order, validateOrder , validateOrderStatus };
