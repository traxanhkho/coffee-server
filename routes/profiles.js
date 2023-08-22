const express = require("express");
const { Profile, validateProfile } = require("../models/profile");
const multer = require("multer");
const _ = require("lodash");
const createFileStorage = require("../firebase/features/createFileStorage");
const updateFileStorage = require("../firebase/features/updateFileStorage");
const auth = require("../middleware/auth");
const { User } = require("../models/user");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/me", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id }).populate({
      path: "userId",
      select: "-password -isAdmin",
    });
    if (!profile) return res.status(404).send("Could not found this Profile.");

    res.send(profile);
  } catch (exception) {
    res.status(400).send(exception);
  }
});

router.put("/:userId", upload.single("image"), async (req, res) => {
  let profileUpdated = {
    aboutMe: JSON.parse(req.body.aboutMe),
    position: JSON.parse(req.body.position),
    address: JSON.parse(req.body.address),
    numberPhone: JSON.parse(req.body.numberPhone),
  };

  const { error } = validateProfile(profileUpdated);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const profileSelected = await Profile.findOne({
      userId: req.params.userId,
    });
    if (!profileSelected)
      return res.status(404).send("Could not found this profile.");

    let image = {};
    if (req.file) {
      if (profileSelected["image"].name) {
        image = await updateFileStorage(
          profileSelected["image"].name,
          req.file
        );
      } else {
        image = await createFileStorage(req.file);
      }

      profileUpdated.image = _.cloneDeep(image);
    }

    profileUpdated = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      profileUpdated,
      { new: true }
    );

    if (!profileUpdated)
      return res.status(404).send("Could not found this profile.");

    const username = JSON.parse(req.body.name);
    if (!username) return res.status(400).send("User name is empty.");
    let currentUser = await User.findByIdAndUpdate(req.params.userId, {
      name: username,
    });
    if (!currentUser) return res.status(404).send("Could not found this user.");

    res.send(profileUpdated);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
