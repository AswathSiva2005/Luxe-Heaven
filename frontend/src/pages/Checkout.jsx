import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [paymentMode, setPaymentMode] = useState("COD");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (location.state) {
      setItems(location.state.items || []);
      setTotal(location.state.total || 0);
    } else {
      // Fetch from cart if no state
      fetchCart();
    }
  }, [token, navigate, location.state]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async () => {
    // Validate shipping address
    const { name, phone, address, city, state, pincode } = shippingAddress;
    if (!name || !phone || !address || !city || !state || !pincode) {
      alert("Please fill all shipping address fields");
      return;
    }

    if (items.length === 0) {
      alert("No items to order");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        shippingAddress,
        paymentMode
      };

      // If from cart, use cart order endpoint, else use buy-now
      if (location.state?.fromCart) {
        await api.post("/orders/place", orderData);
      } else {
        // For buy now, we need productId and quantity
        const productId = items[0].productId._id || items[0].productId;
        const quantity = items[0].quantity || 1;
        await api.post("/orders/buy-now", {
          productId,
          quantity,
          ...orderData
        });
      }

      alert("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.response?.data?.msg || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <p>No items to checkout</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-content">
        <div className="checkout-left">
          {/* Shipping Address */}
          <div className="checkout-section">
            <h3>Shipping Address</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  maxlength="10"
                  minlength="10"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="Enter your state"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="Enter pincode"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMode"
                  value="COD"
                  checked={paymentMode === "COD"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                <span>Cash on Delivery (COD)</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMode"
                  value="Card"
                  checked={paymentMode === "Card"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                <span>Credit/Debit Card</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMode"
                  value="UPI"
                  checked={paymentMode === "UPI"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                <span>UPI</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMode"
                  value="Net Banking"
                  checked={paymentMode === "Net Banking"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                <span>Net Banking</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-right">
          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="order-items">
              {items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={`http://localhost:5000/uploads/${item.productId?.image}`}
                    alt={item.productId?.name}
                  />
                  <div className="order-item-info">
                    <h4>{item.productId?.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    <p className="order-item-price">₹{item.subtotal || item.productId?.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{total}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-place-order"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

