const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    min: 0,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  availableSizes: [{
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    required: true
  }],
  availableColors: [{
    type: String,
    enum: ["Black", "White", "Gray", "Navy", "Red", "Blue", "Green", "Brown", "Beige", "Pink"],
    required: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  // Keep old image field for backward compatibility
  image: String
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);
