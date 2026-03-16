const router = require("express").Router();
const auth = require("../middleware/auth");
const DiscountConfig = require("../models/DiscountConfig");

// Get current discount configuration
router.get("/discount", auth, async (req, res) => {
  try {
    const config = await DiscountConfig.findOne({ key: "default" });
    if (!config) {
      return res.json({
        discount: {
          enabled: false,
          tiers: [
            { minQty: 0, maxQty: 5, discountPercent: 0 },
            { minQty: 6, maxQty: 10, discountPercent: 5 },
            { minQty: 11, maxQty: 9999, discountPercent: 15 }
          ]
        }
      });
    }

    res.json({ discount: config });
  } catch (error) {
    console.error("Error fetching discount config:", error);
    res.status(500).json({ msg: "Error fetching discount configuration" });
  }
});

// Update discount configuration (admin only)
router.put("/discount", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { enabled, tiers } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ msg: "enabled must be a boolean" });
    }

    if (!Array.isArray(tiers) || tiers.length === 0) {
      return res.status(400).json({ msg: "tiers must be a non-empty array" });
    }

    // Validate tiers
    const validated = tiers.map((tier) => {
      const minQty = Number(tier.minQty);
      const maxQty = Number(tier.maxQty);
      const discountPercent = Number(tier.discountPercent);
      if (Number.isNaN(minQty) || Number.isNaN(maxQty) || Number.isNaN(discountPercent)) {
        throw new Error("Tier values must be numbers");
      }
      if (minQty < 0 || maxQty < 0 || discountPercent < 0) {
        throw new Error("Tier values must be non-negative");
      }
      return { minQty, maxQty, discountPercent };
    });

    let config = await DiscountConfig.findOne({ key: "default" });
    if (!config) {
      config = await DiscountConfig.create({ key: "default", enabled, tiers: validated });
    } else {
      config.enabled = enabled;
      config.tiers = validated;
      await config.save();
    }

    res.json({ msg: "Discount configuration updated", discount: config });
  } catch (error) {
    console.error("Error updating discount config:", error);
    res.status(500).json({ msg: error.message || "Error updating discount configuration" });
  }
});

module.exports = router;
