const router = require("express").Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Add to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (product.stockQuantity <= 0) {
      return res.status(400).json({ msg: "Product is out of stock" });
    }

    // Check if item already in cart
    const existingItem = await Cart.findOne({ userId, productId });
    
    if (existingItem) {
      const requestedTotal = existingItem.quantity + quantity;
      if (requestedTotal > product.stockQuantity) {
        return res.status(400).json({ msg: "Cannot add more than available stock" });
      }
      existingItem.quantity = requestedTotal;
      await existingItem.save();
      return res.json({ msg: "Cart updated", cart: existingItem });
    }

    const cartItem = await Cart.create({
      userId,
      productId,
      quantity
    });

    res.json({ msg: "Added to cart", cart: cartItem });
  } catch (error) {
    console.error("Cart add error:", error);
    res.status(500).json({ msg: "Error adding to cart", error: error.message });
  }
});

// Get user's cart with populated products
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ userId })
      .populate({
        path: "productId",
        select: "name price image description stockQuantity sellerId",
        populate: {
          path: "sellerId",
          select: "name email phone sellerUpiId profileImage",
        },
      })
      .sort({ createdAt: -1 });

    const items = cartItems.map(item => ({
      _id: item._id,
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.productId ? item.productId.price * item.quantity : 0
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({ 
      items,
      total,
      count: items.length
    });
  } catch (error) {
    console.error("Cart get error:", error);
    res.status(500).json({ msg: "Error fetching cart", error: error.message });
  }
});

// Update cart item quantity
router.put("/:id", auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user.id;
    const cartId = req.params.id;

    const cartItem = await Cart.findOne({ _id: cartId, userId });
    if (!cartItem) {
      return res.status(404).json({ msg: "Cart item not found" });
    }

    if (quantity <= 0) {
      await Cart.findByIdAndDelete(cartId);
      return res.json({ msg: "Item removed from cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ msg: "Cart updated", cart: cartItem });
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({ msg: "Error updating cart", error: error.message });
  }
});

// Remove from cart
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = req.params.id;

    const cartItem = await Cart.findOneAndDelete({ _id: cartId, userId });
    if (!cartItem) {
      return res.status(404).json({ msg: "Cart item not found" });
    }

    res.json({ msg: "Removed from cart" });
  } catch (error) {
    console.error("Cart delete error:", error);
    res.status(500).json({ msg: "Error removing from cart", error: error.message });
  }
});

// Clear entire cart
router.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.deleteMany({ userId });
    res.json({ msg: "Cart cleared" });
  } catch (error) {
    console.error("Cart clear error:", error);
    res.status(500).json({ msg: "Error clearing cart", error: error.message });
  }
});

module.exports = router;
