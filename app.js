const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const session = require("express-session");
const nodemailer = require("nodemailer");
const User  = require("./model/user");
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
  const { name, email, password } = req.body;
  log("Received registration data:", { name, email, password }); 

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }else{
       const otp = Math.floor(100000 + Math.random() * 900000);
        const hashedPassword = await bcrypt.hash(password, 10);
    req.session.otp = otp;
    req.session.name = name;
    req.session.email = email;
    req.session.password = hashedPassword;
    console.log("Generated OTP:", otp); // Log the generated OTP for debugging

    const mailOptions = {
      from: 'rajupusti@yahoo.com',
      to: email,
      subject: 'Your OTP for Login',
      text: `Hello ${name}, your OTP is ${otp}, generated at ${new Date().toLocaleString()}. Please use this OTP to complete your registration process.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
       
      }

      console.log('Email sent:', info.response);
      return res.redirect("/receiver");
    });

    }

   

    
  } catch (error) {
    console.error("Registration Error:", error);
    // return res.status(500).send("Server error during registration");
   }
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
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
    req.session.username = user.name;

    const mailOptions = {
      from: 'rajupusti@yahoo.com',
      to: email,
      subject: 'Your OTP for Login',
      text: `Hello ${user.name}, your OTP is ${otp}, generated at ${new Date().toLocaleString()}. Please use this OTP to complete your login process.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
       
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
app.post("/receiver", async (req, res) => {
  const { otpInput } = req.body;
  console.log("Received OTP input:", otpInput); // ✅ corrected
   const { name, email, password } = req.session;
   log("Session data:", { name, email, password }); // Log session data for debugging

  if (req.session.otp && otpInput === req.session.otp.toString()) {
    req.session.otp = null; // Clear OTP after use
     log(name)
    const newUser = new User({ name, email, password });
    await newUser.save();
  

    return res.render("fullpages/loginform", { message: "Registration successful! Please log in." });
    
  } else {
    return res.status(400).render("layouts/receiver")
  }
});

app.get("/forgot", (req, res) => {
  res.render("fullpages/forgotpassword"); 
});


app.post("/forgot", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = otp;
    req.session.otpExpires = Date.now() + 5 * 60 * 1000; 
    console.log("Generated OTP for password reset:", otp); 
    const mailOptions = {
      from: 'rajupusti@yahoo.com',
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Hello ${user.name},\n\nYour OTP is: ${otp}\nGenerated at: ${new Date().toLocaleString()}\n\nPlease use this OTP within 5 minutes to reset your password.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
      console.log("OTP email sent:", info.response);
      res.redirect("/otpreceiver")
    }); 
   

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/otpreceiver", (req, res) => {
  res.render("layouts/otpreceiver");
});
app.post("/otpreceiver", async (req, res) => {
  const { otpInput } = req.body;
  console.log("Received OTP input:", otpInput); 

  if (req.session.otp && otpInput === req.session.otp.toString()) {
  
    req.session.otp = null; 
    return res.render("fullpages/newpassword");
  } else {
    return res.status(400).render("layouts/otpreceiver", { error: "Invalid OTP" });
  }
});
app.post("/newpassword", async (req, res) => {
  const { newPassword } = req.body;
  console.log("Received new password:", newPassword); 
  req.session.password = null;

  

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    req.session.password = hashedPassword;
    console.log("Hashed new password:", hashedPassword);

    const user = await User.findOneAndUpdate({ email: req.session.email }, { password: hashedPassword }, { new: true });

    req.session.otp = null; 
    return res.render("fullpages/loginform", { error: "Password reset successful! Please log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).render("fullpages/newpassword");
  }
});



app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
