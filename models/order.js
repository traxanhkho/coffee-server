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
  orderShippingAddressInformation: {
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
  },
  products: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: Product,
      },
      size: {
        type: mongoose.Types.ObjectId,
        ref: Product,
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
            min: 0,
          },
        },
      ],
      note: String,
    },
  ],
  status: {
    type: Object,
    enum: [
      { name: "ordered", label: "Đã đặt hàng", step: 0 },
      { name: "pending", label: "Đang xử lý", step: 1 },
      { name: "processing", label: "Đang vận chuyển", step: 2 },
      { name: "completed", label: "Đã giao hàng", step: 4 },
      { name: "cancelled", label: "Giao hàng thất bại", step: 5 },
    ],
    default: { name: "ordered", label: "Đã đặt hàng", step: 0 },
  },
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
    orderShippingAddressInformation: Joi.object({
      address: Joi.object({
        city: Joi.string().required(),
        district: Joi.string().required(),
        street: Joi.string().required(),
        ward: Joi.string().required(),
      }),
      name: Joi.string().required(),
      numberPhone: Joi.string().required(),
    }),
    status: Joi.object({
      name: Joi.string()
        .valid("ordered", "pending", "processing", "completed", "cancelled")
        .required(),
      label: Joi.string().required(),
      step: Joi.number().integer().required(),
    }).default(Joi.object({ name: "ordered", label: "Đã đặt hàng", step: 0 })),
    products: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().required().min(1),
        size: Joi.string().required(),
        toppings: Joi.array().items(
          Joi.object({
            toppingId: Joi.string(),
            quantity: Joi.number().min(0),
          })
        ),
        note: Joi.string().allow("").optional(),
      })
    ),
  });

  return orderSchema.validate(order);
}

module.exports = { Order, validateOrder, validateOrderStatus };
