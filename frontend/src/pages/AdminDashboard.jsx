import { useState, useEffect } from "react";
import api from "../services/api";
import { buildUploadUrl } from "../utils/assetUrl";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const adminName = localStorage.getItem("username") || "Admin";
  const profileImage = localStorage.getItem("profileImage");
  const [activeTab, setActiveTab] = useState("users"); // users, settings
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [discountConfig, setDiscountConfig] = useState({
    enabled: false,
    tiers: [
      { minQty: 0, maxQty: 5, discountPercent: 0 },
      { minQty: 6, maxQty: 10, discountPercent: 5 },
      { minQty: 11, maxQty: 9999, discountPercent: 15 }
    ]
  });
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "settings") {
      fetchDiscountConfig();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/users/admin/all");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountConfig = async () => {
    try {
      setDiscountLoading(true);
      const res = await api.get("/settings/discount");
      setDiscountConfig(res.data.discount);
    } catch (error) {
      console.error("Error fetching discount config:", error);
      alert("Unable to fetch discount configuration");
    } finally {
      setDiscountLoading(false);
    }
  };

  const saveDiscountConfig = async () => {
    try {
      setDiscountLoading(true);
      await api.put("/settings/discount", discountConfig);
      alert("Discount configuration saved");
      fetchDiscountConfig();
    } catch (error) {
      console.error("Error saving discount config:", error);
      alert(error.response?.data?.msg || "Unable to save discount configuration");
    } finally {
      setDiscountLoading(false);
    }
  };

  const downloadReport = async (period = "week") => {
    try {
      const res = await api.get(`/orders/export?period=${period}&format=csv`, {
        responseType: "blob"
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Unable to download report");
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/auth/users/admin/${userId}/role`, { role });
      alert(`User role updated to ${role}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error updating user role");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Dashboard</h1>
          <div className="admin-avatar" title={adminName}>
            {profileImage ? (
              <img
                src={buildUploadUrl(`uploads/profiles/${profileImage}`)}
                alt="Admin"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/42x42?text=A";
                }}
              />
            ) : (
              <span>{adminName[0]?.toUpperCase() || "A"}</span>
            )}
          </div>
        </div>
        <div className="admin-tabs">
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === "users" && (
        <div className="users-section">
          <div className="section-header">
            <h2>User Management</h2>
            <p>Manage buyer and seller accounts</p>
          </div>
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="user-name">{user.name}</td>
                      <td className="user-email">{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="user-actions">
                        {user.role === "buyer" && (
                          <button
                            onClick={() => updateUserRole(user._id, "seller")}
                            className="btn-promote"
                          >
                            Promote to Seller
                          </button>
                        )}
                        {user.role === "seller" && (
                          <button
                            onClick={() => updateUserRole(user._id, "buyer")}
                            className="btn-demote"
                          >
                            Demote to Buyer
                          </button>
                        )}
                        {user.role === "admin" && (
                          <span className="admin-label">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="empty-state">No users found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="settings-section">
          <div className="section-header">
            <h2>System Settings</h2>
            <p>Configure discounts and export reports</p>
          </div>
          {discountLoading ? (
            <div className="loading">Loading settings...</div>
          ) : (
            <div className="settings-grid">
              <div className="settings-card">
                <div className="card-header">
                  <h3>Discount Configuration</h3>
                  <p>Set up automatic quantity-based discounts</p>
                </div>
                <div className="discount-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={discountConfig.enabled}
                      onChange={(e) => setDiscountConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                    Enable Automatic Discounts
                  </label>
                </div>

                <div className="tier-list">
                  <h4>Discount Tiers</h4>
                  {discountConfig.tiers.map((tier, idx) => (
                    <div key={idx} className="tier-row">
                      <div className="tier-inputs">
                        <input
                          type="number"
                          value={tier.minQty}
                          min={0}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setDiscountConfig(prev => {
                              const updated = [...prev.tiers];
                              updated[idx] = { ...updated[idx], minQty: value };
                              return { ...prev, tiers: updated };
                            });
                          }}
                          placeholder="Min Qty"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          value={tier.maxQty}
                          min={0}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setDiscountConfig(prev => {
                              const updated = [...prev.tiers];
                              updated[idx] = { ...updated[idx], maxQty: value };
                              return { ...prev, tiers: updated };
                            });
                          }}
                          placeholder="Max Qty"
                        />
                        <span>:</span>
                        <input
                          type="number"
                          value={tier.discountPercent}
                          min={0}
                          max={100}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setDiscountConfig(prev => {
                              const updated = [...prev.tiers];
                              updated[idx] = { ...updated[idx], discountPercent: value };
                              return { ...prev, tiers: updated };
                            });
                          }}
                          placeholder="Discount %"
                        />
                        <span>%</span>
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn-add-tier"
                    onClick={() =>
                      setDiscountConfig(prev => ({
                        ...prev,
                        tiers: [...prev.tiers, { minQty: 0, maxQty: 0, discountPercent: 0 }]
                      }))
                    }
                  >
                    + Add Tier
                  </button>
                </div>

                <div className="settings-actions">
                  <button className="btn-submit" onClick={saveDiscountConfig} disabled={discountLoading}>
                    {discountLoading ? "Saving..." : "Save Settings"}
                  </button>
                  <button className="btn-secondary" onClick={() => fetchDiscountConfig()}>
                    Reset
                  </button>
                </div>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h3>Report Export</h3>
                  <p>Download sales reports for analysis</p>
                </div>
                <div className="export-options">
                  <button className="btn-export" onClick={() => downloadReport("week")}>
                    📊 Weekly Report
                  </button>
                  <button className="btn-export" onClick={() => downloadReport("month")}>
                    📈 Monthly Report
                  </button>
                </div>
                <p className="export-note">Reports include all order data in CSV format</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
