const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  oldStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  changeType: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Index for faster queries
stockHistorySchema.index({ productId: 1, createdAt: -1 });
stockHistorySchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model("StockHistory", stockHistorySchema);