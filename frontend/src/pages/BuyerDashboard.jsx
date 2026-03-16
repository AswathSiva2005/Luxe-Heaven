import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    cartItems: 0,
    wishlistItems: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username") || "Buyer";
  const profileImage = localStorage.getItem("profileImage");
  const buyerHighlights = [
    {
      label: "Cart ready",
      value: `${stats.cartItems} items waiting`,
      tone: "indigo",
    },
    {
      label: "Wishlist picks",
      value: `${stats.wishlistItems} saved for later`,
      tone: "rose",
    },
    {
      label: "Order activity",
      value: `${stats.orders} orders placed`,
      tone: "amber",
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [cartRes, wishlistRes, ordersRes] = await Promise.all([
        api.get("/cart").catch(() => ({ data: { count: 0 } })),
        api.get("/wishlist").catch(() => ({ data: { count: 0 } })),
        api.get("/orders").catch(() => ({ data: { count: 0 } })),
      ]);

      setStats({
        cartItems: cartRes.data?.count || cartRes.data?.items?.length || 0,
        wishlistItems: wishlistRes.data?.count || wishlistRes.data?.items?.length || 0,
        orders: ordersRes.data?.count || ordersRes.data?.orders?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: "🛍️",
      title: "Browse Products",
      description: "Discover fresh arrivals and trending picks",
      action: () => navigate("/products"),
      color: "#6366f1",
      badge: "Shop",
    },
    {
      icon: "🛒",
      title: "Review Cart",
      description: `${stats.cartItems} items ready for checkout`,
      action: () => navigate("/cart"),
      color: "#10b981",
      badge: "Cart",
    },
    {
      icon: "❤️",
      title: "Open Wishlist",
      description: `${stats.wishlistItems} saved styles and products`,
      action: () => navigate("/wishlist"),
      color: "#ef4444",
      badge: "Saved",
    },
    {
      icon: "📦",
      title: "Track Orders",
      description: `${stats.orders} purchases to monitor`,
      action: () => navigate("/orders"),
      color: "#f59e0b",
      badge: "Orders",
    },
    {
      icon: "💬",
      title: "Get Support",
      description: "Reach support for delivery or product help",
      action: () => navigate("/support"),
      color: "#0ea5e9",
      badge: "Help",
    },
  ];

  return (
    <div className="dashboard buyer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {username}! 👋</h1>
          <p className="dashboard-subtitle">Your shopping activity, saved picks, and next steps in one place</p>
        </div>
        <div className="dashboard-profile-badge">
          {profileImage ? (
            <img
              src={`http://localhost:5000/uploads/profiles/${profileImage}`}
              alt="Profile"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/48x48?text=U";
              }}
            />
          ) : (
            <span>{username[0]?.toUpperCase() || "B"}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="dashboard-banner buyer-banner">
            {buyerHighlights.map((item) => (
              <div key={item.label} className={`banner-chip ${item.tone}`}>
                <span className="banner-chip-label">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          {/* STATS CARDS */}
          <div className="stats-grid">
            <div className="stat-card buyer-card">
              <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
                🛒
              </div>
              <div className="stat-content">
                <h3>{stats.cartItems}</h3>
                <p>Items in Cart</p>
                <span className="stat-trend">Ready whenever you are</span>
              </div>
            </div>
            <div className="stat-card buyer-card">
              <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                ❤️
              </div>
              <div className="stat-content">
                <h3>{stats.wishlistItems}</h3>
                <p>Wishlist Items</p>
                <span className="stat-trend">Saved for your next order</span>
              </div>
            </div>
            <div className="stat-card buyer-card">
              <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                📦
              </div>
              <div className="stat-content">
                <h3>{stats.orders}</h3>
                <p>Total Orders</p>
                <span className="stat-trend">Your order history at a glance</span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="dashboard-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="quick-action-card buyer-action-card"
                  onClick={action.action}
                  style={{ "--action-color": action.color }}
                >
                  <span className="quick-action-badge">{action.badge}</span>
                  <div className="quick-action-icon">{action.icon}</div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <span className="quick-action-cta">Open →</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
