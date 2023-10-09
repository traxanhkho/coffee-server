const express = require("express");
const _ = require("lodash");
const auth = require("../middleware/auth");
const getAddressFromVnLocation = require("../utils/getAddressFromVnLocation");

const {
  Order,
  validateOrderStatus,
  validateOrder,
} = require("../models/order");

const { Product } = require("../models/product");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/getOrdersByCustomer", auth, async (req, res) => {
  try {
    let orders = await Order.find({ customerId: req.user._id })
      .populate("products.productId")
      .populate("products.toppings.toppingId");

    res.send(orders);
  } catch (ex) {
    res.status(500).send(ex);
  }
});

router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("products.productId")
      .populate("products.toppings.toppingId");

    if (!order) return res.status(404).send("could not found this order");

    res.send(order);
  } catch (ex) {
    res.status(500).send(ex);
  }
});

router.get("/", async (req, res) => {
  try {
    let orders = await Order.find()
      .populate("customerId")
      .populate("products.productId")
      .populate("products.toppings.toppingId");

    if (!orders) return res.status(400).send("order is empty!");
    res.send(orders);
  } catch (ex) {
    res.status(500).send(`error message: ${ex}`);
  }
});

// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) - 1 || 0;
//     const limit = parseInt(req.query.limit) || 5;

//     const orders = await Order.find()
//       .skip(page * limit)
//       .limit(limit)
//       .populate("customerId")
//       .populate("products.productId")
//       .populate("products.toppings.toppingId");

//     const allOrders = await Order.find()
//       .populate("customerId")
//       .populate("products.productId")
//       .populate("products.toppings.toppingId");

//     const total = await Order.countDocuments();

//     const response = {
//       total,
//       allOrders,
//       page: page + 1,
//       limit,
//       orders,
//     };

//     res.send(response);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: true, message: "Internal Server Error" });
//   }
// });

router.get("/calculateTotalPrice/:orderId", async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate("products.productId")
    .populate("products.toppings.toppingId");

  // Calculate the total price
  let totalPrice = 0;
  for (const product of order.products) {
    const size = product.productId.sizes.find((s) => s.name === product.size);
    const productPrice = size.price + product.productId.price;

    // Calculate the total price of toppings
    let toppingsPrice = 0;
    for (const topping of product.toppings) {
      toppingsPrice += topping.toppingId.price * topping.quantity;
    }

    totalPrice += (productPrice + toppingsPrice) * product.quantity;
  }
  res.send({ totalPrice });
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let convertShoppingCartObjectId = JSON.parse(
      JSON.stringify(req.body.products),
      (key, value) => {
        if (key === "productId" || key === "toppingId" || key === "size") {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    );

    const address = await getAddressFromVnLocation(
      req.body.orderShippingAddressInformation.address.city,
      req.body.orderShippingAddressInformation.address.district,
      req.body.orderShippingAddressInformation.address.ward
    );

    address.street = req.body.orderShippingAddressInformation.address.street;

    let order = new Order({
      customerId: new mongoose.Types.ObjectId(req.user._id),
      orderShippingAddressInformation: {
        name: req.body.orderShippingAddressInformation.name,
        numberPhone: req.body.orderShippingAddressInformation.numberPhone,
        address: _.cloneDeep(address),
      },
      products: _.cloneDeep(convertShoppingCartObjectId),
    });

    order = await order.save();

    const newOrder = await Order.findById(order._id)
      .populate("products.productId")
      .populate("products.toppings.toppingId");

    return res.send(newOrder);
  } catch (ex) {
    res.status(500).send(ex);
  }
});

router.delete("/:orderId", async (req, res) => {
  try {
    const orderDeleted = await Order.findByIdAndDelete(req.params.orderId);
    if (!orderDeleted)
      return res.status(404).send("could not found this order");

    res.send(orderDeleted);
  } catch (ex) {
    res.status(400).send(ex);
  }
});

router.put("/updateOrderStatus/:orderId", async (req, res) => {
  const { error } = validateOrderStatus(req.body.status);

  if (error) return res.status(400).send(error.details[0].message);

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).send("could not found this order");

  const orderUpdated = await Order.findByIdAndUpdate(
    req.params.orderId,
    { status: req.body.status },
    { new: true }
  );

  res.send(orderUpdated);
});

module.exports = router;
