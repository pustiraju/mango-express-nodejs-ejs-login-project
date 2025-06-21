const express = require("express");
const mangoose = require("mongoose");
const app = express();
const path = require("path");
const {  registeredUser } = require("./model/user");
const { log } = require("console");
const bcrypt = require("bcrypt");
require("./db");
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/register", (req, res) => {
  res.render("fullpages/registerform", {});
});

app.get("/", (req, res) => {
  res.render("fullpages/loginform", {});
});





app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
    registeredUser.findOne({ email: email })
      .then(async (existingUser) => {
      if (existingUser) {
        return res.status(400).send("User already exists");
      }else {
        const newUser = new registeredUser({
          username: username,
          email: email,
          password: password,
        });
        await newUser.save();
        res.status(201).send("User registered successfully");
      }
});
});


app.post("/", async (req, res) => {
  const { username, password } = req.body;
    log(req.body);
  const user = await registeredUser.findOne({ username });
log(user);
  //const isMatch = await bcrypt.compare(password, user.password);
  if (!user || !isMatch) {
    return res.status(400).send("Invalid username or password");
  }else {
    res.status(200).send("Login successful");
  } 
 
});

app.listen(port, () => {
  console.log(`Example app running on  port http://localhost:${port}`);
});
