require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dns = require("node:dns/promises");
const auth = require("./middleware/auth");

// Import all models to ensure they're registered
require("./models/User");
require("./models/Product");
require("./models/Cart");
require("./models/Wishlist");
require("./models/Order");
require("./models/DiscountConfig");
require("./models/SupportTicket");
require("./models/StockHistory");

// Fix for Node.js v24 DNS issue on Windows
// Set DNS servers explicitly to resolve MongoDB Atlas SRV records
dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);

const app = express();

// Create uploads directory and subfolders if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const supportUploadsDir = path.join(uploadsDir, "support");
const productUploadsDir = path.join(uploadsDir, "products");
const profileUploadsDir = path.join(uploadsDir, "profiles");

[uploadsDir, supportUploadsDir, productUploadsDir, profileUploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created ${dir}`);
  }
});

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ---------- DATABASE CONNECTION ---------- */
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aswathsiva0420:aswathsiva0420@cluster0.l4kdjc2.mongodb.net/consultancy_project?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for initial connection
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
    });
    console.log("✅ MongoDB Atlas Connected Successfully");
    console.log("📊 Database: consultancy_project");
  } catch (err) {
    console.error("\n❌ MongoDB Connection Error:", err.message);
    console.error("\n🔧 Troubleshooting Steps:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("\n1️⃣  MongoDB Atlas IP Whitelist:");
    console.error("   → Go to: https://cloud.mongodb.com/");
    console.error("   → Select your cluster → Network Access");
    console.error("   → Click 'Add IP Address'");
    console.error("   → Add '0.0.0.0/0' (allows all IPs) OR your current IP");
    console.error("   → Wait 1-2 minutes for changes to apply");
    console.error("\n2️⃣  Check Database User:");
    console.error("   → Go to: Database Access");
    console.error("   → Verify user 'aswathsiva0420' exists");
    console.error("   → Ensure password is correct");
    console.error("   → User should have 'Read and write' permissions");
    console.error("\n3️⃣  Verify Cluster Status:");
    console.error("   → Ensure cluster is running (not paused)");
    console.error("   → Check cluster status in Atlas dashboard");
    console.error("\n4️⃣  Network/Firewall:");
    console.error("   → Check internet connection");
    console.error("   → Disable VPN if using one");
    console.error("   → Check if corporate firewall blocks MongoDB ports");
    console.error("\n5️⃣  Node.js v24 DNS Fix:");
    console.error("   → DNS servers have been set to [1.1.1.1, 8.8.8.8]");
    console.error("   → If issue persists, try updating Node.js to v25+");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("\n💡 The server will continue running, but database operations will fail.");
    console.error("   Fix the connection and restart the server.\n");
  }
};

connectDB();

/* ---------- ROUTES ---------- */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/support", require("./routes/support.routes"));

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("E-Commerce Backend Running Successfully 🚀");
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB: Atlas Cloud Database`);
});

// Handle port conflicts gracefully
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`💡 Solution: Kill the process using port ${PORT} or use a different port.`);
    console.error(`\n   Windows PowerShell:`);
    console.error(`   Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force`);
    console.error(`\n   Or use Command Prompt:`);
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error(`   taskkill /PID <PID> /F`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
