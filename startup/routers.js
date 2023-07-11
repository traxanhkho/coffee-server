const express = require("express");
const cors = require("cors");
const products = require("../routes/products");
const genres = require("../routes/genres");
const toppings = require("../routes/toppings");
const orders = require("../routes/orders");
const customers = require("../routes/customers");
const locationVn = require("../routes/locationVn");
const users = require("../routes/users");
const auth = require("../routes/auth");
const bodyParser = require("body-parser");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use("/api/products", products);
  app.use("/api/genres", genres);
  app.use("/api/toppings", toppings);
  app.use("/api/orders", orders);
  app.use("/api/customers", customers);
  app.use("/api/locationVn", locationVn);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
};
