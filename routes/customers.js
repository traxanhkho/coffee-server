const express = require("express");
const _ = require("lodash");
const { Customer, validateCustomer } = require("../models/customer");
const getAddressFromVnLocation = require("../utils/getAddressFromVnLocation");

const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find();

  res.send(customers);
});

router.post("/", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const address = await getAddressFromVnLocation(
    req.body.address.city,
    req.body.address.district,
    req.body.address.ward
  );

  address.street = req.body.address.street;

  const customer = new Customer({
    name: req.body.name,
    numberPhone: req.body.numberPhone,
    address: _.cloneDeep(address),
  });

  await customer.save();

  res.send(customer);
});

router.get("/:customerId", async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);
  if (!customer) return res.status(404).send("could not found this customer");

  res.send(customer);
});

router.delete("/:customerId", async (req, res) => {
  const customerDeleted = await Customer.findByIdAndDelete(
    req.params.customerId
  );
  if (!customerDeleted) res.status(404).send("could not found this customer");

  res.send(customerDeleted);
});

router.put("/:customerId", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.params.customerId);
  if (!customer) return res.status(404).send("could not found this customer");

  const address = await getAddressFromVnLocation(
    req.body.address.city,
    req.body.address.district,
    req.body.address.ward
  );

  address.street = req.body.address.street;

  let customerUpdated = {
    name: req.body.name,
    numberPhone: req.body.numberPhone,
    address: _.cloneDeep(address),
  };

  customerUpdated = await Customer.findByIdAndUpdate(
    req.params.customerId,
    customerUpdated,
    { new: true }
  );

  res.send(customerUpdated);
});

module.exports = router;
