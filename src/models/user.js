const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true
    },
    lastname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error("Email must be a valid email");
        }
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(val) {
        if (val.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(val) {
        if (val < 0) {
          throw new Error("Age must be a positive number");
        }
      }
    },
    avatar: {
      type: Buffer
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "user"
});

userSchema.methods.toJSON = function() {
  const userData = this.toObject();
  delete userData.password;
  delete userData.tokens;
  delete userData.avatar;

  return userData;
};

userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);

  this.tokens = this.tokens.concat({ token });
  await this.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

userSchema.pre("remove", async function(next) {
  this.populate("task");
  await Task.deleteMany({ user: this._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
