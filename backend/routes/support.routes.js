const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const SupportTicket = require("../models/SupportTicket");
const Product = require("../models/Product");
const Order = require("../models/Order");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "support"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({ storage });

// Create new support ticket
router.post("/tickets", auth, upload.array("attachments", 5), async (req, res) => {
  try {
    if (req.user.role !== "buyer" && req.user.role !== "user") {
      return res.status(403).json({ msg: "Only buyers can create tickets" });
    }

    const userId = req.user.id;
    const { subject, message, productId, orderId } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ msg: "Subject and message are required" });
    }

    const attachments = (req.files || []).map((file) => file.filename);

    let sellerId = null;
    let productRef = null;
    let orderRef = null;

    if (productId) {
      const product = await Product.findById(productId).select("sellerId");
      if (product) {
        sellerId = product.sellerId || null;
        productRef = productId;
      }
    }

    if (!sellerId && orderId) {
      const order = await Order.findById(orderId).populate("items.productId", "sellerId");
      if (order) {
        const firstSeller = order.items?.find((item) => item.productId?.sellerId)?.productId?.sellerId;
        if (firstSeller) sellerId = firstSeller;
        orderRef = orderId;
      }
    }

    const ticket = await SupportTicket.create({
      userId,
      sellerId,
      productId: productRef,
      orderId: orderRef,
      subject,
      messages: [{ sender: "user", message, attachments }],
      attachments
    });

    res.status(201).json({ msg: "Support ticket created", ticket });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ msg: "Unable to create support ticket" });
  }
});

// Get list of tickets
router.get("/tickets", auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const isSeller = req.user.role === "seller";
    const query = isAdmin ? {} : (isSeller ? { sellerId: req.user.id } : { userId: req.user.id });

    const tickets = await SupportTicket.find(query)
      .sort({ updatedAt: -1 })
      .populate("userId", "name email profileImage")
      .populate("sellerId", "name email profileImage")
      .populate("productId", "name image")
      .populate("orderId", "createdAt");

    res.json({ tickets });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ msg: "Unable to fetch support tickets" });
  }
});

// Get a single ticket
router.get("/tickets/:ticketId", auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId)
      .populate("userId", "name email profileImage")
      .populate("sellerId", "name email profileImage")
      .populate("productId", "name image")
      .populate("orderId", "createdAt");
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    // Ensure user can only access their own tickets (unless admin)
    const isOwner = ticket.userId?._id?.toString() === req.user.id;
    const isAssignedSeller = ticket.sellerId?._id?.toString() === req.user.id;
    if (req.user.role !== "admin" && !isOwner && !isAssignedSeller) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ msg: "Unable to fetch ticket" });
  }
});

// Add a message to a ticket (user or admin)
router.post("/tickets/:ticketId/messages", auth, upload.array("attachments", 5), async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    const isBuyerOwner = ticket.userId?.toString() === req.user.id;
    const isAssignedSeller = ticket.sellerId?.toString() === req.user.id;
    if (req.user.role !== "admin" && !isBuyerOwner && !isAssignedSeller) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ msg: "Message text is required" });
    }

    const attachments = (req.files || []).map((file) => file.filename);

    ticket.messages.push({
      sender: req.user.role === "admin" ? "admin" : (req.user.role === "seller" ? "seller" : "user"),
      message,
      attachments
    });

    if (req.user.role === "admin" || req.user.role === "seller") {
      ticket.status = "Pending";
    }

    await ticket.save();

    res.json({ msg: "Message added", ticket });
  } catch (error) {
    console.error("Error adding ticket message:", error);
    res.status(500).json({ msg: "Unable to add message" });
  }
});

// Update ticket status (admin only)
router.put("/tickets/:ticketId/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Open", "Pending", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    const isAssignedSeller = ticket.sellerId?.toString() === req.user.id;
    if (req.user.role !== "admin" && !isAssignedSeller) {
      return res.status(403).json({ msg: "Only assigned seller or admin can update status" });
    }

    ticket.status = status;
    await ticket.save();

    res.json({ msg: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ msg: "Unable to update ticket status" });
  }
});

module.exports = router;
