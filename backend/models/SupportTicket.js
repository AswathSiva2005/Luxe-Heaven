const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "seller", "admin"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["Open", "Pending", "Resolved", "Closed"],
    default: "Open"
  },
  messages: [supportMessageSchema],
  attachments: [String]
}, {
  timestamps: true
});

supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ sellerId: 1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
