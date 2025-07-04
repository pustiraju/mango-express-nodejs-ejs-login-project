const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const registeredUser = mongoose.model("registeredUser", userSchema);



// Export the model
module.exports = {

    registeredUser,
}
