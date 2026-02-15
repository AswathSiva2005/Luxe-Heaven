import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [token, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist");
      setItems(res.data.items || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (productId) => {
    try {
      await api.post("/cart/add", { productId, quantity: 1 });
      alert("Added to cart!");
      // Optionally remove from wishlist
      // await removeFromWishlist(productId);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart");
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await api.delete(`/wishlist/${wishlistId}`);
      setItems(items.filter(item => item._id !== wishlistId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Error removing from wishlist");
    }
  };

  const buyNow = (product) => {
    navigate("/checkout", { 
      state: { 
        items: [{
          productId: product,
          quantity: 1,
          subtotal: product.price
        }], 
        total: product.price,
        fromCart: false 
      } 
    });
  };

  if (loading) {
    return <div className="wishlist-container"><div className="loading">Loading wishlist...</div></div>;
  }

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">My Wishlist ❤️</h2>

      {items.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item._id} className="wishlist-item">
              <div className="item-image">
                <img
                  src={`http://localhost:5000/uploads/${item.productId?.image}`}
                  alt={item.productId?.name}
                />
              </div>
              <div className="item-info">
                <h4>{item.productId?.name}</h4>
                <p className="item-price">₹{item.productId?.price}</p>
                {item.productId?.description && (
                  <p className="item-description">{item.productId.description.substring(0, 100)}...</p>
                )}
              </div>
              <div className="item-actions">
                <button
                  onClick={() => moveToCart(item.productId?._id)}
                  className="btn-cart"
                >
                  🛒 Add to Cart
                </button>
                <button
                  onClick={() => buyNow(item.productId)}
                  className="btn-buy-now"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
