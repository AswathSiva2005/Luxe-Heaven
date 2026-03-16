const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, "Please enter a valid phone number"],
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    sellerUpiId: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },
    role: {
      type: String,
      enum: { values: ["buyer", "seller", "admin"], message: "Role must be buyer, seller, or admin" },
      default: "buyer",
    },
    // Login security fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false
    }
  },
  { timestamps: true }
);

// Faster lookup when checking lock status
userSchema.index({ lockUntil: 1 });

module.exports = mongoose.model("User", userSchema);
