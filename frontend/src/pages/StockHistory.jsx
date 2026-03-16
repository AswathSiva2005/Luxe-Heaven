import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { buildUploadUrl } from "../utils/assetUrl";
import "./StockHistory.css";

export default function StockHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStockHistory();
  }, []);

  const fetchStockHistory = async () => {
    try {
      const res = await api.get("/products/stock-history");
      setHistory(res.data.history);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load stock history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "restock":
        return "📦";
      case "sale":
        return "🛒";
      case "manual":
        return "✏️";
      case "initial":
        return "🎯";
      default:
        return "📝";
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case "restock":
        return "green";
      case "sale":
        return "red";
      case "manual":
        return "blue";
      case "initial":
        return "purple";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="stock-history-page">
        <div className="loading">Loading stock history...</div>
      </div>
    );
  }

  return (
    <div className="stock-history-page">
      <div className="page-header">
        <h1>📊 Stock History & Restock Events</h1>
        <p>Track all stock changes for your products</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      {history.length === 0 ? (
        <div className="empty-state">
          <p>No stock history found. Stock changes will appear here.</p>
        </div>
      ) : (
        <div className="history-container">
          {history.map((entry) => (
            <div key={entry._id} className="history-card">
              <div className="history-header">
                <div className="product-info">
                  <img
                    src={buildUploadUrl(`uploads/${entry.productId?.image}`)}
                    alt={entry.productId?.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
                    }}
                  />
                  <div>
                    <h3>{entry.productId?.name}</h3>
                    <p className="product-id">ID: {entry.productId?.productId}</p>
                  </div>
                </div>
                <div className="change-type" style={{ color: getChangeColor(entry.changeType) }}>
                  {getChangeIcon(entry.changeType)} {entry.changeType}
                </div>
              </div>

              <div className="stock-change">
                <div className="stock-values">
                  <span className="old-stock">{entry.oldStock}</span>
                  <span className="arrow">→</span>
                  <span className="new-stock">{entry.newStock}</span>
                </div>
                <div className="change-amount">
                  {entry.newStock > entry.oldStock ? "+" : ""}{entry.newStock - entry.oldStock}
                </div>
              </div>

              <div className="history-details">
                <p className="timestamp">{formatDate(entry.createdAt)}</p>
                {entry.notes && <p className="notes">{entry.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}