const mongoose = require("mongoose");

const ALLOWED_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "5", "6", "7", "8", "9", "10", "11", "12"];

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
  originalPrice: {
    type: Number,
    min: 0,
    default: null
  },
  brand: {
    type: String,
    trim: true,
    default: ""
  },
  storeName: {
    type: String,
    trim: true,
    default: ""
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  // Optional subtype used for things like T-shirt style, pant type, shoe style, etc.
  subCategory: {
    type: String,
    trim: true,
    default: ""
  },
  outerMaterial: {
    type: String,
    trim: true,
    default: ""
  },
  occasion: {
    type: String,
    trim: true,
    default: ""
  },
  casualType: {
    type: String,
    trim: true,
    default: ""
  },
  manufacturerInfo: {
    type: String,
    trim: true,
    default: ""
  },
  keyHighlights: [{
    type: String,
    trim: true
  }],
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
    enum: ALLOWED_SIZE_OPTIONS,
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
  image: String,
  // Seller who added this product
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, {
  timestamps: true
});

// Index category for faster filtering
productSchema.index({ category: 1 });

module.exports = mongoose.model("Product", productSchema);
