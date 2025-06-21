const express = require("express");
const mangoose = require("mongoose");
const app = express();
const path = require("path");
const { User, registeredUser } = require("./model/user");
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
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  registeredUser.findOne({email:"hufh@gmail.com"}).then((data) => {
    if (data) {
     
    setTimeout(()=>{
       res.send(data);
    },2000);
     
    } else {
      const user1 = new registeredUser({
        username: username,
        email: email,
        password: password,
      });

      user1.save()
        .then(() => {
          res.send("User registered successfully");
          console.log("User saved successfully");
        })
        .catch((err) => {
          console.error("Error registering user:", err);
        });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("fullpages/loginform", {});
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  //  const newuser = await new User({ name: username, password: password });
  //  console.log(User);
  // console.log(newuser);

  //   // Save the user to the database

  //  await newuser.save()

  //   .then(() => {
  //     console.log("User saved successfully");

  //   })
  //   .catch((err) => {
  //     console.error("Error saving user:", err);

  //   });

  res.send(`your username is ${username} and password is ${password}`);
});

app.listen(port, () => {
  console.log(`Example app running on  port http://localhost:${port}`);
});
