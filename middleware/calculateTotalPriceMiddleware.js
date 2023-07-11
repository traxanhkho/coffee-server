// Assuming you have the necessary Mongoose models (Product and Topping) imported and configured

const { Product } = require("../models/product");
const { Topping } = require("../models/topping");

// Create a middleware function to calculate the total price
const calculateTotalPriceMiddleware = async (req, res, next) => {
  const shoppingCart = req.body.products ; 

  const getProductPrice = async (productId) => {
    const product = await Product.findById(productId);
    return product.price;
  };

  const getToppingPrices = async (toppings) => {
    const toppingIds = toppings.map((topping) => topping.toppingId);
    const foundToppings = await Topping.find({ _id: { $in: toppingIds } });

    return res.send(foundToppings) ; 

    return foundToppings.reduce((totalPrice, topping) => {
      const matchingTopping = toppings.find(
        (t) => t.toppingId.toString() === topping._id.toString()
      );
      const toppingPrice = topping.price * matchingTopping.quantity;
      return totalPrice + toppingPrice;
    }, 0);
  };

  try {
    let totalPrice = 0;

    for (const item of shoppingCart) {
      const productPrice = await getProductPrice(item.productId);
      const toppingPrices = await getToppingPrices(item.toppings);
      return res.send(String(productPrice));


      const itemTotalPrice = (productPrice + toppingPrices) * item.quantity;
      totalPrice += itemTotalPrice;
    }


    req.body.totalPrice = totalPrice;
    next();
  } catch (error) {
    res.send(error);
  }
};

module.exports = calculateTotalPriceMiddleware;
