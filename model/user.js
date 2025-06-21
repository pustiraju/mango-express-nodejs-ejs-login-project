const mongoose = require("mongoose");
// Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,                                  
});
// Model
const registeredUser = mongoose.model("registeredUser", userSchema);




const userschema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);



// Export the model
module.exports = {
    User,
    registeredUser,
}
