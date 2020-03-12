const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

// With populate()
router.get("/tasks", auth, async (req, res) => {
  try {
    const match = { user: req.user._id };
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    console.log(e);
  }
});

// With find()
// router.get("/tasks", auth, async (req, res) => {
//   try {
//     const criterias = { user: req.user._id };
//     if (req.query.completed) {
//       criterias.completed = req.query.completed === "true";
//     }
//     const tasks = await Task.find(criterias, null, {
//       limit: parseInt(req.query.limit),
//       skip: parseInt(req.query.skip)
//     });
//     res.send(tasks);
//   } catch (e) {
//     console.log(e);
//   }
// });

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    user: req.user._id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdate = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid update" });
  }

  try {
    const task = await Task.findOne({ user: req.user._id, _id: req.params.id });
    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
