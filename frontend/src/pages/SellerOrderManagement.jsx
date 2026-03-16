import { useEffect, useState } from "react";
import api from "../services/api";
import "./SellerOrderManagement.css";

export default function SellerOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const ORDER_STATUSES = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  const STATUS_COLORS = {
    Placed: "#ff9f43",
    Confirmed: "#388e3c",
    Shipped: "#1976d2",
    Delivered: "#388e3c",
    Cancelled: "#d32f2f"
  };

  const fetchAdminOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/all");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const res = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: statusNotes
      });

      // Update local state
      setOrders(orders.map(order =>
        order._id === orderId ? res.data.order : order
      ));

      setStatusNotes("");
      setExpandedOrder(null);
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.msg || "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      Placed: ["Confirmed", "Cancelled"],
      Confirmed: ["Shipped", "Cancelled"],
      Shipped: ["Delivered"],
      Delivered: [],
      Cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  const filteredOrders = filterStatus === "All"
    ? orders
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return <div className="seller-orders"><div className="loading">Loading orders...</div></div>;
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <h1>Order Management Dashboard</h1>
        <p className="orders-count">Total Orders: {orders.length}</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filterStatus === "All" ? "active" : ""}`}
          onClick={() => setFilterStatus("All")}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map(status => (
          <button
            key={status}
            className={`tab ${filterStatus === status ? "active" : ""}`}
            onClick={() => setFilterStatus(status)}
          >
            {status} ({orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`order-card ${expandedOrder === order._id ? "expanded" : ""}`}
            >
              <div
                className="card-header"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="order-info">
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="customer-name">👤 {order.userId?.name}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="card-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLORS[order.status] }}
                  >
                    {order.status}
                  </span>
                  <span className="expand-icon">{expandedOrder === order._id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="card-content">
                  {/* Items */}
                  <div className="section">
                    <h4 className="section-title">Items</h4>
                    <div className="items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="item">
                          <img
                            src={`http://localhost:5000/uploads/${item.productId?.image}`}
                            alt={item.productId?.name}
                          />
                          <div className="item-info">
                            <p className="item-name">{item.productId?.name}</p>
                            <p className="item-qty">Qty: {item.quantity}</p>
                            <p className="item-price">₹{item.price}</p>
                          </div>
                          <div className="item-total">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="amount-summary">
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="section">
                    <h4 className="section-title">Customer & Delivery</h4>
                    <div className="details-grid">
                      <div className="detail-box">
                        <label>Customer</label>
                        <p>{order.userId?.name}</p>
                        <p className="small">{order.userId?.email}</p>
                      </div>
                      <div className="detail-box">
                        <label>Phone</label>
                        <p>{order.shippingAddress?.phone}</p>
                      </div>
                      <div className="detail-box">
                        <label>Address</label>
                        <p>{order.shippingAddress?.address}</p>
                        <p className="small">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                      </div>
                      <div className="detail-box">
                        <label>Payment</label>
                        <p>{order.paymentMode}</p>
                        <span className="payment-status">{order.paymentStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Section */}
                  {order.status !== "Delivered" && order.status !== "Cancelled" && (
                    <div className="section status-update">
                      <h4 className="section-title">Update Order Status</h4>
                      <div className="update-actions">
                        {getNextStatuses(order.status).map(nextStatus => (
                          <button
                            key={nextStatus}
                            className={`status-btn status-${nextStatus.toLowerCase()}`}
                            onClick={() => handleStatusUpdate(order._id, nextStatus)}
                            disabled={updatingOrder === order._id}
                          >
                            {updatingOrder === order._id ? "Updating..." : `Mark as ${nextStatus}`}
                          </button>
                        ))}
                      </div>
                      <div className="notes-input">
                        <label>Notes (optional)</label>
                        <textarea
                          placeholder="Add notes about this update..."
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          rows="3"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status History */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="section history">
                      <h4 className="section-title">Status History</h4>
                      <div className="timeline-list">
                        {order.statusHistory.map((entry, idx) => (
                          <div key={idx} className="timeline-entry">
                            <span className="timeline-status">{entry.status}</span>
                            <span className="timeline-date">
                              {new Date(entry.timestamp).toLocaleString("en-IN")}
                            </span>
                            {entry.notes && <span className="timeline-notes">{entry.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
