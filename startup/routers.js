const express = require("express");
const cors = require("cors");
const products = require("../routes/products");
const genres = require("../routes/genres");
const toppings = require("../routes/toppings");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/products", products);
  app.use("/api/genres", genres);
  app.use("/api/toppings", toppings);
};
