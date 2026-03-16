const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dns = require("node:dns/promises");

require("dotenv").config();

// Fix for Node.js v24 DNS issue on Windows
dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aswathsiva0420:aswathsiva0420@cluster0.l4kdjc2.mongodb.net/consultancy_project?retryWrites=true&w=majority";

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "adminluxe@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "adminluxe@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    console.log("Admin user created successfully");
    console.log("Email: adminluxe@gmail.com");
    console.log("Password: admin123");
    console.log("Role: admin");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createAdmin();