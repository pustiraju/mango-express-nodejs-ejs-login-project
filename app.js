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
  const { email , password } = req.body;
    
  const userdetails = await registeredUser.findOne({ email: email });
  const isMatch = await bcrypt.compare(password, userdetails.password);
 
 
  if  (!userdetails.email || !isMatch) {
     res.render("fullpages/loginform", {
          error: "WRONG CREDENTIALS",
        });
  }else {
    res.render("fullpages/loginform", {
          message: "LOGIN successful",
        });
  } 
 
});

app.listen(port, () => {
  console.log(`Example app running on  port http://localhost:${port}`);
});
