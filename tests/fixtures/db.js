const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  firstname: "Mike",
  lastname: "Jenkins",
  email: "m.jenkins@foobar.io",
  password: "foobar1234",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  firstname: "Drew",
  lastname: "James",
  email: "d.james@foobar.io",
  password: "foobar1234",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "Buy beers",
  completed: true,
  user: userOne._id
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Buy chips",
  user: userOne._id
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Buy the new Jaguar F-Type V8",
  user: userTwo._id
};

const setupDb = async () => {
  await User.deleteMany();
  await Task.deleteMany();

  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDb
};
