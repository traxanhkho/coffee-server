const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect("mongodb+srv://datdang0899:1234@cluster0.m9m1trx.mongodb.net/")
    .then(() => console.log("Connected to MongoDB database...."))
    .catch((err) => console.error(err));
};
