const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { sendAdminNotification } = require("../utils/mailer");
const auth = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 3);
const LOGIN_LOCK_HOURS = Number(process.env.LOGIN_LOCK_HOURS || 1);

const profileStorage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads", "profiles"),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const uploadProfile = multer({ storage: profileStorage });

// USER REGISTER – supports buyer, seller (admin only via DB/seed)
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      address,
      role = "buyer",
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const allowedRoles = ["buyer", "seller"];
    const roleToSave = allowedRoles.includes(role) ? role : "buyer";

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ msg: "An account with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      phone: phone || undefined,
      address: address || undefined,
      role: roleToSave,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET
    );

    res.status(201).json({
      msg: "Account created successfully",
      token,
      role: user.role,
      name: user.name,
      userId: user._id,
      profileImage: user.profileImage || "",
      phone: user.phone || "",
      sellerUpiId: user.sellerUpiId || "",
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "An account with this email already exists" });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ msg: firstError?.message || "Validation failed" });
    }
    res.status(500).json({ msg: "Registration failed. Please try again." });
  }
});

// LOGIN – buyer, seller, admin (admin can be in DB or legacy check)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select("+password +failedLoginAttempts +lockUntil");

    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Check lockout state
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMs = user.lockUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return res.status(403).json({
        msg: `Account locked due to failed login attempts. Try again in ${remainingMinutes} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const update = { failedLoginAttempts: attempts };

      let lockMsg;
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOGIN_LOCK_HOURS * 60 * 60 * 1000);
        update.lockUntil = lockUntil;
        lockMsg = `Account locked for ${LOGIN_LOCK_HOURS} hour(s) due to repeated failed login.`;
      }

      await User.findByIdAndUpdate(user._id, update, { new: true });

      if (lockMsg) {
        sendAdminNotification(
          "User account locked due to failed login attempts",
          `<p>User <strong>${user.email}</strong> has been locked out after ${attempts} failed login attempts.</p>
           <p>Lock duration: ${LOGIN_LOCK_HOURS} hour(s).</p>`
        );
        return res.status(403).json({ msg: lockMsg });
      }

      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Successful login - reset counters
    if (user.failedLoginAttempts || user.lockUntil) {
      await User.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        lockUntil: null,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      userId: user._id,
      profileImage: user.profileImage || "",
      phone: user.phone || "",
      sellerUpiId: user.sellerUpiId || "",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Login failed. Please try again." });
  }
});

// GET CURRENT USER PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email phone address role profileImage sellerUpiId createdAt");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ msg: "Unable to fetch profile" });
  }
});

// UPDATE CURRENT USER PROFILE
router.put("/profile", auth, uploadProfile.single("profileImage"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { name, phone, sellerUpiId, street, city, state, pincode, country } = req.body;

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (sellerUpiId !== undefined) user.sellerUpiId = String(sellerUpiId).trim();

    user.address = {
      street: street !== undefined ? String(street).trim() : user.address?.street,
      city: city !== undefined ? String(city).trim() : user.address?.city,
      state: state !== undefined ? String(state).trim() : user.address?.state,
      pincode: pincode !== undefined ? String(pincode).trim() : user.address?.pincode,
      country: country !== undefined ? String(country).trim() : (user.address?.country || "India"),
    };

    if (req.file) {
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        profileImage: user.profileImage || "",
        sellerUpiId: user.sellerUpiId || "",
        address: user.address || {},
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ msg: firstError?.message || "Validation failed" });
    }
    res.status(500).json({ msg: "Unable to update profile" });
  }
});

// ADMIN ROUTES

// GET ALL USERS (Admin only)
router.get("/users/admin/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Error fetching users", error: error.message });
  }
});

// UPDATE USER ROLE (Admin only)
router.put("/users/admin/:userId/role", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ msg: "User role updated successfully", user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ msg: "Error updating user role", error: error.message });
  }
});

module.exports = router;
