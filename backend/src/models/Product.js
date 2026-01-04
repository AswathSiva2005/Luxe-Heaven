const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Please add a product ID'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['t-shirts', 'pants', 'sneakers'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please add a release date'],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: 0,
      default: 0,
    },
    sizes: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '6', '7', '8', '9', '10', '11', '12'],
      },
    ],
    colors: [
      {
        type: String,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

