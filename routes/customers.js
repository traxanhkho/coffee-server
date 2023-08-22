const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const express = require("express");
const _ = require("lodash");
const {
  Customer,
  validateCustomer,
  validateCustomerUpdate,
} = require("../models/customer");
const getAddressFromVnLocation = require("../utils/getAddressFromVnLocation");

const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find();

  res.send(customers);
});

router.post("/", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findOne({ numberPhone: req.body.numberPhone });
  if (customer) return res.status(400).send("Number phone already registered.");

  customer = new Customer(_.pick(req.body, ["numberPhone", "password"]));

  const salt = await bcrypt.genSalt(10);
  customer.password = await bcrypt.hash(customer.password, salt);

  await customer.save();

  const token = customer.generateAuthToken();

  res
    .header("x-auth-token", token)
    .send(_.pick(customer, ["_id", "numberPhone"]));
});

router.post("/auth", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findOne({ numberPhone: req.body.numberPhone });
  if (!customer) return res.status(404).send("Invalid email or password!");

  const validPassword = await bcrypt.compare(
    req.body.password,
    customer.password
  );
  if (!validPassword) return res.status(404).send("Invalid email or password");

  const token = customer.generateAuthToken();

  res.send(token);
});

router.get("/me", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select("-password");
    if (!customer) return res.status(404).send("could not found this customer");

    res.send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).send("could not found this customer");

    res.send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:customerId", async (req, res) => {
  const customerDeleted = await Customer.findByIdAndDelete(
    req.params.customerId
  );
  if (!customerDeleted) res.status(404).send("could not found this customer");

  res.send(customerDeleted);
});

router.put("/:customerId", async (req, res) => {
  const { error } = validateCustomerUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findById(req.params.customerId).select('-password');
    if (!customer) return res.status(404).send("could not found this customer");

    const address = await getAddressFromVnLocation(
      req.body.address.city,
      req.body.address.district,
      req.body.address.ward
    );

    address.street = req.body.address.street;

    let customerUpdated = {
      name: req.body.name,
      address: _.cloneDeep(address),
    };

    customerUpdated = await Customer.findByIdAndUpdate(
      req.params.customerId,
      customerUpdated,
      { new: true }
    ).select('-password');

    res.send(customerUpdated);
  } catch (ex) {
    res.status(400).send(ex);
  }
});

module.exports = router;
