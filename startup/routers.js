const products = require("../routes/products");
const express = require("express");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/products", products);
};
