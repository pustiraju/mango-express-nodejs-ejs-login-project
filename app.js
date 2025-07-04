const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const session = require("express-session");
const nodemailer = require("nodemailer");
const { registeredUser } = require("./model/user");
const { log } = require("console");
require("./db");

const app = express();
const port = 3000;

// Middleware and view setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware to store OTP
app.use(session({
  secret: 'raju@1995',
  resave: false,
  saveUninitialized: true,
}));

// Yahoo SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  secure: true,
  auth: {
    user: 'rajupusti@yahoo.com',
    pass: 'zjumdrbglwdvibsy'
  }
});

// Routes
app.get("/register", (req, res) => {
  res.render("fullpages/registerform");
});

app.get("/", (req, res) => {
  res.render("fullpages/loginform");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await registeredUser.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new registeredUser({ username, email, password : hashedPassword });
    await newUser.save();

    return res.render("fullpages/loginform", { message: "Registration successful! Please log in." });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).send("Server error during registration");
  }
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await registeredUser.findOne({ email });
    if (!user) {
      return res.render("fullpages/loginform", { error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("fullpages/loginform", { error: "Invalid password" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = otp;
    console.log("Generated OTP:", otp); // Log the generated OTP for debugging
    req.session.username = user.username;

    const mailOptions = {
      from: 'rajupusti@yahoo.com',
      to: email,
      subject: 'Your OTP for Login',
      text: `Hello ${user.username}, your OTP is ${otp}, generated at ${new Date().toLocaleString()}. Please use this OTP to complete your login process.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
        return res.status(500).send("Login successful but OTP email failed.");
      }

      console.log('Email sent:', info.response);
      return res.redirect("/receiver");
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send("Server error during login");
  }
});

// Show OTP form
app.get("/receiver", (req, res) => {
  res.render("layouts/receiver", {
    username: req.session.username || "User"
  });
});

// Verify OTP
app.post("/receiver", (req, res) => {
  const { otpInput } = req.body;
  console.log("Received OTP input:", otpInput); // ✅ corrected

  if (req.session.otp && otpInput === req.session.otp.toString()) {
    req.session.otp = null; // Clear OTP after use
    return res.send("✅ OTP verified successfully");
  } else {
    return res.status(400).send("❌ Invalid OTP");
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
