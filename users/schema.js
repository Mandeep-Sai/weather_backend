const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorites: Array,
  role: {
    type: String,
    enum: ["admin", "user"],
  },
});

const userModel = model("user", userSchema);

module.exports = userModel;
