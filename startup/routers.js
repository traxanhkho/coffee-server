const products = require("../routes/products");
const express = require("express");
const cors = require("cors");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/products", products);
};
