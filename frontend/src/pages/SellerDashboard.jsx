import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const sellerName = localStorage.getItem("username") || "Seller";
  const profileImage = localStorage.getItem("profileImage");
  const sellerHighlights = [
    {
      label: "Catalog live",
      value: `${stats.products} active listings`,
      tone: "violet",
    },
    {
      label: "Order queue",
      value: `${stats.orders} orders to manage`,
      tone: "emerald",
    },
    {
      label: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      tone: "amber",
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch seller's products and orders
      const [productsRes, ordersRes] = await Promise.all([
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/orders").catch(() => ({ data: { orders: [] } })),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data?.orders || [];

      // Calculate revenue from orders
      const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        products: products.length,
        orders: orders.length,
        revenue: revenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: "📦",
      title: "Manage Products",
      description: `${stats.products} listings available to edit`,
      action: () => navigate("/seller/products"),
      color: "#6366f1",
      badge: "Catalog",
    },
    {
      icon: "📊",
      title: "Order Management",
      description: `${stats.orders} orders to fulfill and review`,
      action: () => navigate("/seller/orders"),
      color: "#10b981",
      badge: "Orders",
    },
    {
      icon: "📈",
      title: "Stock History",
      description: "Review inventory movement and stock changes",
      action: () => navigate("/seller/stock-history"),
      color: "#8b5cf6",
      badge: "Inventory",
    },
    {
      icon: "🎯",
      title: "View Storefront",
      description: "See products the way customers see them",
      action: () => navigate("/products"),
      color: "#f59e0b",
      badge: "Preview",
    },
    {
      icon: "💬",
      title: "Seller Support",
      description: "Contact support for product or order issues",
      action: () => navigate("/support"),
      color: "#ef4444",
      badge: "Support",
    },
  ];

  return (
    <div className="dashboard seller-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{sellerName}, your store is live 🏪</h1>
          <p className="dashboard-subtitle">Manage inventory, orders, and performance from one control center</p>
        </div>
        <div className="dashboard-profile-badge">
          {profileImage ? (
            <img
              src={`http://localhost:5000/uploads/profiles/${profileImage}`}
              alt="Profile"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/48x48?text=S";
              }}
            />
          ) : (
            <span>{sellerName[0]?.toUpperCase() || "S"}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="dashboard-banner seller-banner">
            {sellerHighlights.map((item) => (
              <div key={item.label} className={`banner-chip ${item.tone}`}>
                <span className="banner-chip-label">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          {/* STATS CARDS */}
          <div className="stats-grid">
            <div className="stat-card seller-card">
              <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
                📦
              </div>
              <div className="stat-content">
                <h3>{stats.products}</h3>
                <p>Total Products</p>
                <span className="stat-trend">Keep your catalog updated</span>
              </div>
            </div>
            <div className="stat-card seller-card">
              <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                📊
              </div>
              <div className="stat-content">
                <h3>{stats.orders}</h3>
                <p>Total Orders</p>
                <span className="stat-trend">Track incoming fulfillment work</span>
              </div>
            </div>
            <div className="stat-card seller-card">
              <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                💰
              </div>
              <div className="stat-content">
                <h3>₹{stats.revenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
                <span className="stat-trend">Your sales performance so far</span>
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
                  className="quick-action-card seller-action-card"
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

          {/* SELLER INFO */}
          <div className="dashboard-section">
            <div className="info-card">
              <h3>📝 Seller Information</h3>
              <p>
                Use the seller tools above to manage your catalog, monitor order flow, and review inventory activity.
                This dashboard now shows seller-specific actions only.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
