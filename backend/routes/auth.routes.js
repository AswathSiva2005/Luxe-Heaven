const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// USER REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hash,
    role: "user"
  });

  res.json({ msg: "User registered successfully" });
});

// LOGIN (USER + ADMIN)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 🔴 FIXED ADMIN LOGIN
  if (email === "aswi@gmail.com" && password === "12345") {
    const token = jwt.sign(
      { id: "admin", role: "admin", name: "Admin" },
      "secretkey"
    );

    return res.json({
      token,
      role: "admin",
      name: "Admin",
      userId: "admin"
    });
  }

  // USER LOGIN
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: "user", name: user.name },
    "secretkey"
  );

  res.json({
    token,
    role: "user",
    name: user.name,
    userId: user._id
  });
});

module.exports = router;
