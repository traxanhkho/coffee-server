const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const { validateUser, User } = require("../models/user");
const { Profile } = require("../models/profile");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find().select("-password");
  res.send(users);
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));

  const userId = new ObjectId(user._id);
  const newProfile = await Profile({ userId });

  await newProfile.save();
});

router.delete("/:userId", [auth, admin], async (req, res) => {
  try {
    let userDeleted = await User.findByIdAndDelete(req.params.userId);
    if (!userDeleted) return res.status(404).send("Could not found this User!");

    res.send(userDeleted);

    await Profile.findOneAndDelete({
      userId: userDeleted._id,
    });

  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
