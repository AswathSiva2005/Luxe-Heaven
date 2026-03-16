import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Redirect sellers to order management page
    if (role === "seller") {
      navigate("/seller/orders");
      return;
    }

    // For buyers/users, fetch their orders
    fetchOrders();
  }, [token, navigate, role]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      Placed: "status-placing",
      Confirmed: "status-confirmed",
      Shipped: "status-shipped",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled"
    };
    return classes[status] || "";
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Purchases</h1>
        <p className="orders-count">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders. Start shopping now!</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`order-card ${expandedOrder === order._id ? "expanded" : ""}`}
            >
              {/* Order Header with Product Images */}
              <div
                className="order-card-header"
                onClick={() =>
                  setExpandedOrder(expandedOrder === order._id ? null : order._id)
                }
              >
                <div className="order-header-left">
                  <div className="product-thumbnails">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000/uploads/${item.productId?.image}`}
                        alt={item.productId?.name}
                        className="thumb"
                        title={item.productId?.name}
                      />
                    ))}
                    {order.items?.length > 3 && (
                      <div className="more-items">+{order.items.length - 3}</div>
                    )}
                  </div>
                  <div className="order-id-info">
                    <div className="order-id">
                      <span className="id-label">Order ID:</span>
                      <span className="order-number">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                  </div>
                </div>

                <div className="order-header-right">
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status === "Cancelled" ? "CANCELLED" : order.status.toUpperCase()}
                  </span>
                  <span className="expand-icon">{expandedOrder === order._id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Order Details - Expandable */}
              {expandedOrder === order._id && (
                <>
                  {/* Items Section */}
                  <div className="order-items-section">
                    <h3 className="section-title">Order Items</h3>
                    <div className="order-items">
                      {order.items?.map((item, index) => (
                        <div key={index} className="order-item-card">
                          <div className="order-item-image">
                            <img
                              src={`http://localhost:5000/uploads/${item.productId?.image}`}
                              alt={item.productId?.name}
                            />
                          </div>
                          <div className="order-item-info">
                            <h4>{item.productId?.name}</h4>
                            <div className="item-meta">
                              <span className="qty">Qty: {item.quantity}</span>
                              <span className="divider">•</span>
                              <span className="price">₹{item.price}</span>
                            </div>
                          </div>
                          <div className="order-item-total">
                            <p className="item-subtotal">₹{item.price * item.quantity}</p>
                            <p className="item-calc">₹{item.price} × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {order.status !== "Cancelled" && (
                    <div className="order-timeline-section">
                      <h3 className="section-title">Delivery Status</h3>
                      <div className="timeline">
                        <div className={`timeline-step ${order.status === "Placed" || ["Confirmed", "Shipped", "Delivered"].includes(order.status) ? "completed" : ""}`}>
                          <div className="timeline-marker">✓</div>
                          <div className="timeline-label">Order Placed</div>
                        </div>
                        <div className={`timeline-step ${["Confirmed", "Shipped", "Delivered"].includes(order.status) ? "completed" : ""}`}>
                          <div className="timeline-marker">✓</div>
                          <div className="timeline-label">Confirmed</div>
                        </div>
                        <div className={`timeline-step ${["Shipped", "Delivered"].includes(order.status) ? "completed" : ""}`}>
                          <div className="timeline-marker">✓</div>
                          <div className="timeline-label">Shipped</div>
                        </div>
                        <div className={`timeline-step ${order.status === "Delivered" ? "completed" : ""}`}>
                          <div className="timeline-marker">✓</div>
                          <div className="timeline-label">Delivered</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  <div className="order-details-grid">
                    <div className="address-section">
                      <h3 className="section-title">Delivery Address</h3>
                      <div className="address-content">
                        <p className="address-name">{order.shippingAddress?.name}</p>
                        <p className="address-text">{order.shippingAddress?.address}</p>
                        <p className="address-text">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                        <p className="address-text">📱 {order.shippingAddress?.phone}</p>
                      </div>
                    </div>

                    <div className="payment-section">
                      <h3 className="section-title">Payment Details</h3>
                      <div className="payment-content">
                        <div className="payment-row">
                          <span>Payment Method:</span>
                          <span className="payment-value">{order.paymentMode}</span>
                        </div>
                        <div className="payment-row">
                          <span>Payment Status:</span>
                          <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="order-summary">
                    <div className="summary-item">
                      <span>Subtotal:</span>
                      <span>₹{order.subTotal ?? order.totalAmount}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="summary-item discount">
                        <span>Discount ({order.discountPercent ?? 0}%)</span>
                        <span>- ₹{order.discountAmount}</span>
                      </div>
                    )}
                    <div className="summary-item">
                      <span>Shipping:</span>
                      <span className="free">Free</span>
                    </div>
                    <div className="summary-item total-amount">
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
