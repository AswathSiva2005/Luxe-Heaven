const router = require("express").Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");
const DiscountConfig = require("../models/DiscountConfig");
const User = require("../models/User");
const auth = require("../middleware/auth");
const mailer = require("../utils/mailer");

const DEFAULT_DISCOUNT_TIERS = [
  { minQty: 0, maxQty: 5, discountPercent: 0 },
  { minQty: 6, maxQty: 10, discountPercent: 5 },
  { minQty: 11, maxQty: 9999, discountPercent: 15 }
];

async function getDiscountForQty(quantity) {
  const config = await DiscountConfig.findOne({ key: "default" });
  if (!config || !config.enabled) return { percent: 0, config: null };
  const percent = config.getDiscountForQty(quantity);
  return { percent, config };
}

async function notifySellerStockStatus(product, previousStock, currentStock, fallbackSellerId) {
  const sellerId = product.sellerId || fallbackSellerId;
  if (!sellerId) return;

  const seller = await User.findById(sellerId).select("name email");
  if (!seller?.email) return;

  if (currentStock === 0 && previousStock > 0) {
    await mailer.sendMail({
      to: seller.email,
      subject: `Out of Stock: ${product.name}`,
      html: `
        <h2>Out of Stock Alert</h2>
        <p>Hello ${seller.name || "Seller"},</p>
        <p>Your product <strong>${product.name}</strong> is now out of stock after recent orders.</p>
        <p>Previous stock: <strong>${previousStock}</strong></p>
        <p>Current stock: <strong>${currentStock}</strong></p>
        <p>Please restock the item so it remains available for buyers.</p>
      `
    });
    return;
  }

  if (currentStock > 0 && currentStock <= 5) {
    await mailer.sendMail({
      to: seller.email,
      subject: `Low Stock Alert: ${product.name}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>Hello ${seller.name || "Seller"},</p>
        <p>Your product <strong>${product.name}</strong> is running low on stock after recent orders.</p>
        <p>Previous stock: <strong>${previousStock}</strong></p>
        <p>Current stock: <strong>${currentStock}</strong></p>
        <p>Please restock soon to avoid missing sales.</p>
      `
    });
  }
}

// Place order from cart
router.post("/place", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMode, items: requestItems } = req.body;

    if (!shippingAddress || !paymentMode) {
      return res.status(400).json({ msg: "Shipping address and payment mode are required" });
    }

    let items;

    // If items with updated quantities are provided from checkout, use those
    if (requestItems && requestItems.length > 0) {
      items = requestItems.map(item => ({
        productId: item.productId._id || item.productId,
        quantity: parseInt(item.quantity) || 1,
        price: item.productId?.price || item.price
      }));
    } else {
      // Otherwise, get from cart
      const cartItems = await Cart.find({ userId }).populate("productId");

      if (cartItems.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      items = cartItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
      }));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Ensure all items are available in stock and reserve them
      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, session }
        );

        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            msg: `Product ${item.productId} is out of stock or does not have enough quantity.`
          });
        }

        // Track stock change
        await StockHistory.create(
          [
            {
              productId: item.productId,
              sellerId: product.sellerId || req.user.id,
              oldStock: product.stockQuantity + item.quantity,
              newStock: product.stockQuantity,
              changeType: "sale",
              notes: `Order placed by ${req.user.name || req.user.email}`
            }
          ],
          { session }
        );

        await notifySellerStockStatus(product, product.stockQuantity + item.quantity, product.stockQuantity, req.user.id);
      }

      // Calculate totals
      const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

      const { percent: discountPercent } = await getDiscountForQty(totalQty);
      const discountAmount = Math.round((subTotal * discountPercent) / 100);
      const totalAmount = Math.max(0, subTotal - discountAmount);

      // Create order
      const [order] = await Order.create(
        [
          {
            userId,
            items,
            subTotal,
            discountPercent,
            discountAmount,
            totalAmount,
            shippingAddress,
            paymentMode,
            paymentStatus: paymentMode === "COD" ? "Pending" : "Paid"
          }
        ],
        { session }
      );

      // Clear cart after order
      await Cart.deleteMany({ userId }, { session });

      await session.commitTransaction();
      session.endSession();

      res.json({
        msg: "Order placed successfully",
        order: await Order.findById(order._id).populate("items.productId", "name image")
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
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

    // Start transaction to ensure stock and order remain in sync
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Reserve stock
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stockQuantity: { $gte: quantity } },
        { $inc: { stockQuantity: -quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "Insufficient stock for this product" });
      }

      // Track stock change
      await StockHistory.create(
        [
          {
            productId: productId,
            sellerId: updatedProduct.sellerId || req.user.id,
            oldStock: updatedProduct.stockQuantity + quantity,
            newStock: updatedProduct.stockQuantity,
            changeType: "sale",
            notes: `Buy now order by ${req.user.name || req.user.email}`
          }
        ],
        { session }
      );

      await notifySellerStockStatus(updatedProduct, updatedProduct.stockQuantity + quantity, updatedProduct.stockQuantity, req.user.id);

      // Create order with single item
      const items = [{
        productId: updatedProduct._id,
        quantity,
        price: updatedProduct.price
      }];

      const subTotal = updatedProduct.price * quantity;
      const { percent: discountPercent } = await getDiscountForQty(quantity);
      const discountAmount = Math.round((subTotal * discountPercent) / 100);
      const totalAmount = Math.max(0, subTotal - discountAmount);

      const [order] = await Order.create(
        [
          {
            userId,
            items,
            subTotal,
            discountPercent,
            discountAmount,
            totalAmount,
            shippingAddress,
            paymentMode,
            paymentStatus: paymentMode === "COD" ? "Pending" : "Paid"
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.json({ 
        msg: "Order placed successfully",
        order: await Order.findById(order._id).populate("items.productId", "name image")
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
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

// GET ALL ORDERS (Seller/Admin)
router.get("/all", auth, async (req, res) => {
  try {
    // Allow sellers and admins to view all orders
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({ msg: "Access required (seller or admin)" });
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

// GET ALL ORDERS (Admin only) - Legacy endpoint
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

// UPDATE ORDER STATUS (Seller/Admin)
router.put("/:orderId/status", auth, async (req, res) => {
  try {
    // Allow sellers and admins to update order status
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({ msg: "Access required (seller or admin)" });
    }

    const { status, notes } = req.body;
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

    // Prevent updating if already cancelled
    if (order.status === "Cancelled" && status !== "Cancelled") {
      return res.status(400).json({ msg: "Cannot update a cancelled order" });
    }

    // Add to status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      notes,
      updatedBy: req.user.id
    });

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
      .populate("items.productId", "name image images price")
      .populate("statusHistory.updatedBy", "name");

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

// EXPORT ORDERS FOR REPORTING (Admin only)
router.get("/export", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { period = "week", format = "csv" } = req.query;
    let since = new Date();
    if (period === "month") {
      since.setDate(since.getDate() - 30);
    } else {
      // default to 7 days
      since.setDate(since.getDate() - 7);
    }

    const orders = await Order.find({ createdAt: { $gte: since } })
      .populate("userId", "name email")
      .populate("items.productId", "name")
      .sort({ createdAt: -1 });

    const rows = orders.map((order) => {
      const itemSummary = order.items
        .map(i => `${i.quantity}× ${i.productId?.name || "Product"}`)
        .join("; ");
      return {
        orderId: order._id.toString(),
        orderDate: order.createdAt.toISOString(),
        customerName: order.userId?.name || "",
        customerEmail: order.userId?.email || "",
        status: order.status,
        paymentStatus: order.paymentStatus,
        subTotal: order.subTotal ?? 0,
        discountPercent: order.discountPercent ?? 0,
        discountAmount: order.discountAmount ?? 0,
        totalAmount: order.totalAmount,
        items: itemSummary
      };
    });

    if (format === "csv") {
      const { Parser } = require("json2csv");
      const parser = new Parser();
      const csv = parser.parse(rows);

      res.header("Content-Type", "text/csv");
      res.attachment(`orders-${period}-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({ orders: rows });
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({ msg: "Error exporting orders" });
  }
});

// UPDATE ORDER STATUS (Admin only) - Legacy endpoint
router.put("/admin/:orderId/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { status, notes } = req.body;
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

    // Prevent updating if already cancelled
    if (order.status === "Cancelled" && status !== "Cancelled") {
      return res.status(400).json({ msg: "Cannot update a cancelled order" });
    }

    // Add to status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      notes,
      updatedBy: req.user.id
    });

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
      .populate("items.productId", "name image images price")
      .populate("statusHistory.updatedBy", "name");

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
