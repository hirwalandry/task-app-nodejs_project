const express = require("express");
const asyncMiddleware = require("../middleware/async");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post(
  "/tasks",
  auth,
  asyncMiddleware(async (req, res) => {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();

    res.status(201).send(task);
  })
);

router.get(
  "/tasks",
  auth,
  asyncMiddleware(async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "";
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    const tasks = await Task.find({ owner: req.user._id });
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  })
);
router.get(
  "/tasks/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const _id = req.params.id;

    // const task = await Task.findById(_id)
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  })
);

router.patch(
  "/tasks/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const updates = Object.keys(req.body);
    const toValidate = ["description", "completed"];
    const setToTrue = updates.every((update) => toValidate.includes(update));
    if (!setToTrue) {
      res.status(400).send({ error: "not included" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    await task.save();
    //  const updateById = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    res.send(task);
  })
);
router.delete(
  "/tasks/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const deleteById = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!deleteById) {
      return res.status(404).send();
    }
    res.send(deleteById);
  })
);

module.exports = router;
