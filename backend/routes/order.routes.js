const router = require("express").Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Place order from cart
router.post("/place", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMode } = req.body;

    if (!shippingAddress || !paymentMode) {
      return res.status(400).json({ msg: "Shipping address and payment mode are required" });
    }

    // Get cart items
    const cartItems = await Cart.find({ userId }).populate("productId");
    
    if (cartItems.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    // Prepare order items
    const items = cartItems.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price
    }));

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMode,
      paymentStatus: paymentMode === "COD" ? "Pending" : "Paid"
    });

    // Clear cart after order
    await Cart.deleteMany({ userId });

    res.json({ 
      msg: "Order placed successfully",
      order: await Order.findById(order._id).populate("items.productId", "name image")
    });
  } catch (error) {
    console.error("Order place error:", error);
    res.status(500).json({ msg: "Error placing order", error: error.message });
  }
});

// Buy Now - Place order directly without cart
router.post("/buy-now", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, shippingAddress, paymentMode } = req.body;

    if (!productId || !shippingAddress || !paymentMode) {
      return res.status(400).json({ msg: "Product ID, shipping address, and payment mode are required" });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Create order with single item
    const items = [{
      productId: product._id,
      quantity,
      price: product.price
    }];

    const totalAmount = product.price * quantity;

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMode,
      paymentStatus: paymentMode === "COD" ? "Pending" : "Paid"
    });

    res.json({ 
      msg: "Order placed successfully",
      order: await Order.findById(order._id).populate("items.productId", "name image")
    });
  } catch (error) {
    console.error("Buy now error:", error);
    res.status(500).json({ msg: "Error placing order", error: error.message });
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });

    res.json({ orders, count: orders.length });
  } catch (error) {
    console.error("Orders get error:", error);
    res.status(500).json({ msg: "Error fetching orders", error: error.message });
  }
});

// Get single order
router.get("/:orderId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("items.productId", "name image price description");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Order get error:", error);
    res.status(500).json({ msg: "Error fetching order", error: error.message });
  }
});

// GET ALL ORDERS (Admin only)
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });

    res.json({ orders, count: orders.length });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ msg: "Error fetching orders", error: error.message });
  }
});

// UPDATE ORDER STATUS (Admin only)
router.put("/admin/:orderId/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { status } = req.body;
    const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status. Valid statuses: " + validStatuses.join(", ") });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // If accepting order, update payment status
    if (status === "Confirmed" && order.paymentStatus === "Pending") {
      order.paymentStatus = "Paid";
    }

    // If cancelling, update payment status
    if (status === "Cancelled") {
      order.paymentStatus = "Failed";
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(req.params.orderId)
      .populate("userId", "name email")
      .populate("items.productId", "name image images price");

    res.json({ msg: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      msg: "Error updating order status", 
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

module.exports = router;
