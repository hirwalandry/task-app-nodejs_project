const express = require("express");
const asyncMiddleware = require("../middleware/async");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post(
  "/users",
  asyncMiddleware(async (req, res) => {
    req.body = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      age: req.body.age,
    };
    const user = new User(req.body);
    await user.save();

    res.status(201).send({ user });
  })
);

router.post(
  "/users/login",
  asyncMiddleware(async (req, res) => {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  })
);

router.post(
  "/users/logout",
  auth,
  asyncMiddleware(async (req, res) => {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  })
);
router.post(
  "/users/logoutAll",
  auth,
  asyncMiddleware(async (req, res) => {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  })
);
router.get(
  "/users/me",
  auth,
  asyncMiddleware(async (req, res) => {
    res.send(req.user);
  })
);

router.patch(
  "/users/me",
  auth,
  asyncMiddleware(async (req, res) => {
    const updates = Object.keys(req.body);
    const includesData = ["name", "email", "password", "age"];
    const setToTrue = updates.every((update) => includesData.includes(update));

    if (!setToTrue) {
      return res.status(404).send({ error: "not icluded" });
    }
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    //    const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    res.send(req.user);
  })
);
router.delete(
  "/users/me",
  auth,
  asyncMiddleware(async (req, res) => {
    await req.user.remove();
    res.send(req.user);
  })
);

module.exports = router;
