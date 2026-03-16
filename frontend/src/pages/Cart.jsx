import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { buildUploadUrl } from "../utils/assetUrl";
import "./Cart.css";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    try {
      await api.put(`/cart/${cartId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error updating quantity");
    }
  };

  const removeItem = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item");
    }
  };

  const proceedToCheckout = () => {
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate("/checkout", { state: { items, total, fromCart: true } });
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
    return <div className="cart-container"><div className="loading">Loading cart...</div></div>;
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Shopping Cart 🛒</h2>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-wrapper">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={buildUploadUrl(`uploads/${item.productId?.image}`)}
                    alt={item.productId?.name}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.productId?.name}</h4>
                  <p className="item-price">₹{item.productId?.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="item-actions">
                  <p className="subtotal">₹{item.subtotal}</p>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => buyNow(item.productId)}
                    className="btn-buy-now"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-title">Price Details</div>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="discount">Free</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{total}</span>
            </div>
            <button onClick={proceedToCheckout} className="btn-checkout">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
