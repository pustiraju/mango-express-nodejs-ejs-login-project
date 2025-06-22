const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const { registeredUser } = require("./model/user");
require("./db");

const app = express();
const port = 3000;

// Set up EJS and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/register", (req, res) => {
  res.render("fullpages/registerform");
});

app.get("/", (req, res) => {
  res.render("fullpages/loginform");
});

// Register route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await registeredUser.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new registeredUser({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).send("User registered successfully");

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send("Server error during registration");
  }
});

// Login route
app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await registeredUser.findOne({ email });

    if (!user) {
      return res.render("fullpages/loginform", {
       
        redirect: true,
      });
      
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("fullpages/loginform", {
        error: "Invalid email or password",
      });
    }

    res.render("fullpages/loginform", {
      message: "Login successful",
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Server error during login");
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
