const _ = require("lodash");
const { Topping } = require("../models/topping");
const { Product } = require("../models/product");


const getProductPrice = async (productId) => {
  const product = await Product.findById(productId);
  return product.price;
};

const getToppingPrices = async (toppings) => {
  const toppingIds = toppings.map((topping) => topping.toppingId);
  const foundToppings = await Topping.find({ _id: { $in: toppingIds } });
  return foundToppings.reduce((totalPrice, topping) => {
    const matchingTopping = toppings.find(
      (t) => t.toppingId.toString() === topping._id.toString()
    );
    const toppingPrice = topping.price * matchingTopping.quantity;
    return totalPrice + toppingPrice;
  }, 0);
};

const calculateTotalPrice = async (order) => {
  let totalPrice = 0;

  for (const item of order) {
    const productPrice = await getProductPrice(item.productId);
    const toppingPrices = await getToppingPrices(item.toppings);

    const itemTotalPrice = (productPrice + toppingPrices) * item.quantity;
    totalPrice += itemTotalPrice;
  }

  return res.send(totalPrice);

  req.body.totalPrice = totalPrice;
  next();
};

module.exports = calculateTotalPrice;
