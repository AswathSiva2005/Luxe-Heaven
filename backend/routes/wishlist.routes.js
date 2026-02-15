const router = require("express").Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Add to wishlist
router.post("/add", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.json({ msg: "Already in wishlist", wishlist: existingItem });
    }

    const wishlistItem = await Wishlist.create({
      userId,
      productId
    });

    res.json({ msg: "Added to wishlist", wishlist: wishlistItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ msg: "Already in wishlist" });
    }
    console.error("Wishlist add error:", error);
    res.status(500).json({ msg: "Error adding to wishlist", error: error.message });
  }
});

// Get user's wishlist with populated products
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.find({ userId })
      .populate("productId", "name price image description")
      .sort({ createdAt: -1 });

    res.json({ 
      items: wishlistItems,
      count: wishlistItems.length
    });
  } catch (error) {
    console.error("Wishlist get error:", error);
    res.status(500).json({ msg: "Error fetching wishlist", error: error.message });
  }
});

// Remove from wishlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistId = req.params.id;

    const wishlistItem = await Wishlist.findOneAndDelete({ _id: wishlistId, userId });
    if (!wishlistItem) {
      return res.status(404).json({ msg: "Wishlist item not found" });
    }

    res.json({ msg: "Removed from wishlist" });
  } catch (error) {
    console.error("Wishlist delete error:", error);
    res.status(500).json({ msg: "Error removing from wishlist", error: error.message });
  }
});

// Remove by product ID
router.delete("/product/:productId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const wishlistItem = await Wishlist.findOneAndDelete({ userId, productId });
    if (!wishlistItem) {
      return res.status(404).json({ msg: "Item not in wishlist" });
    }

    res.json({ msg: "Removed from wishlist" });
  } catch (error) {
    console.error("Wishlist delete error:", error);
    res.status(500).json({ msg: "Error removing from wishlist", error: error.message });
  }
});

module.exports = router;
