const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://rajupusti:mango123@cluster0.8yfzk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  )
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


 
  