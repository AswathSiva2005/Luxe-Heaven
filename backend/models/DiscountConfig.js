const mongoose = require("mongoose");

const discountTierSchema = new mongoose.Schema({
  minQty: { type: Number, required: true, min: 0 },
  maxQty: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, required: true, min: 0, max: 100 }
});

const discountConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: "default"
  },
  enabled: {
    type: Boolean,
    default: false
  },
  tiers: {
    type: [discountTierSchema],
    default: [
      { minQty: 0, maxQty: 5, discountPercent: 0 },
      { minQty: 6, maxQty: 10, discountPercent: 5 },
      { minQty: 11, maxQty: 9999, discountPercent: 15 }
    ]
  }
}, {
  timestamps: true
});

// Simple helper to compute discount percent for a given quantity
discountConfigSchema.methods.getDiscountForQty = function (quantity) {
  if (!this.enabled) return 0;
  const tier = this.tiers.find(t => quantity >= t.minQty && quantity <= t.maxQty);
  return tier ? tier.discountPercent : 0;
};

module.exports = mongoose.model("DiscountConfig", discountConfigSchema);
