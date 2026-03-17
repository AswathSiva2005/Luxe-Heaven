import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { buildUploadUrl } from "../utils/assetUrl";
import { QRCodeSVG } from "qrcode.react";
import "./Checkout.css";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [total, setTotal] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountConfig, setDiscountConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValidUpiId = (upiId = "") => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [paymentMode, setPaymentMode] = useState("COD");

  const sellerPaymentDetails = items.reduce((acc, item, index) => {
    const seller = item.productId?.sellerId;
    if (!seller?._id || acc.some((entry) => entry.id === seller._id)) return acc;

    const upiId = (seller.sellerUpiId || "").trim();
    const sellerName = seller.name || `Seller ${index + 1}`;
    const upiLink = isValidUpiId(upiId)
      ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(sellerName)}`
      : "";

    acc.push({
      id: seller._id,
      name: sellerName,
      phone: seller.phone || "Not available",
      upiId,
      upiLink,
    });

    return acc;
  }, []);

  const outOfStockItems = items.filter((item, idx) => {
    const stock = item.productId?.stockQuantity;
    const qty = quantities[idx] || item.quantity || 1;
    return typeof stock === "number" && stock < qty;
  });

  const hasOutOfStock = outOfStockItems.length > 0;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDiscountConfig = async () => {
      try {
        const res = await api.get("/settings/discount");
        setDiscountConfig(res.data);
        return res.data;
      } catch (error) {
        console.warn("Unable to fetch discount config", error);
        return null;
      }
    };

    const initialize = async () => {
      const config = await fetchDiscountConfig();

      if (location.state) {
        const initialItems = location.state.items || [];
        setItems(initialItems);
        initializeQuantities(initialItems);
        const totals = computeTotals(initialItems, {}, config);
        setTotal(totals.subTotal);
        setDiscountPercent(totals.percent);
        setDiscountAmount(totals.discount);
      } else {
        // Fetch from cart if no state
        await fetchCart();
      }
    };

    initialize();
  }, [token, navigate, location.state]);

  const initializeQuantities = (itemsList) => {
    const quantitiesObj = {};
    itemsList.forEach((item, index) => {
      quantitiesObj[index] = item.quantity || 1;
    });
    setQuantities(quantitiesObj);
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      const cartItems = res.data.items || [];
      setItems(cartItems);
      initializeQuantities(cartItems);

      const totals = computeTotals(cartItems, {}, discountConfig);
      setTotal(totals.subTotal);
      setDiscountPercent(totals.percent);
      setDiscountAmount(totals.discount);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const computeTotals = (itemsList, quantitiesObj, config) => {
    const subTotal = itemsList.reduce((sum, item, idx) => {
      const qty = quantitiesObj[idx] || item.quantity || 1;
      const price = item.productId?.price || 0;
      return sum + price * qty;
    }, 0);

    const totalQty = itemsList.reduce((sum, item, idx) => {
      const qty = quantitiesObj[idx] || item.quantity || 1;
      return sum + qty;
    }, 0);

    const percent = (config?.discount?.enabled && config?.discount?.tiers)
      ? config.discount.tiers.find(t => totalQty >= t.minQty && totalQty <= t.maxQty)?.discountPercent || 0
      : 0;

    const discount = Math.round((subTotal * percent) / 100);

    return { subTotal, totalQty, percent, discount };
  };

  const updateTotals = (newQuantities) => {
    const { subTotal, percent, discount } = computeTotals(items, newQuantities, discountConfig);
    setTotal(subTotal);
    setDiscountPercent(percent);
    setDiscountAmount(discount);
  };

  const handleQuantityChange = (index, newQty) => {
    if (newQty < 1) return;

    setQuantities((prev) => {
      const updated = { ...prev, [index]: newQty };
      updateTotals(updated);
      return updated;
    });
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

    if (hasOutOfStock) {
      alert("One or more items are out of stock or exceed the available quantity. Please adjust quantities before placing the order.");
      return;
    }

    if (items.length === 0) {
      alert("No items to order");
      return;
    }

    setLoading(true);

    try {
      // Update items with new quantities
      const updatedItems = items.map((item, index) => ({
        ...item,
        quantity: quantities[index] || item.quantity || 1
      }));

      const orderData = {
        items: updatedItems,
        shippingAddress,
        paymentMode
      };

      // If from cart, use cart order endpoint, else use buy-now
      if (location.state?.fromCart) {
        await api.post("/orders/place", orderData);
      } else {
        // For buy now, we need productId and quantity
        const productId = updatedItems[0].productId._id || updatedItems[0].productId;
        const quantity = updatedItems[0].quantity || 1;
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
                  maxLength="10"
                  minLength="10"
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

            {paymentMode === "UPI" && (
              <div className="upi-section">
                <h4>UPI Payment Details</h4>
                <p>Scan QR and pay to the respective seller shown below.</p>
                {sellerPaymentDetails.map((seller) => (
                  <div key={seller.id} className="upi-seller-card">
                    <div className="upi-seller-meta">
                      <strong>{seller.name}</strong>
                      <span>Phone: {seller.phone}</span>
                      <span>UPI ID: {seller.upiId || "Seller has not added UPI ID yet"}</span>
                    </div>
                    {seller.upiLink ? (
                      <div className="upi-qr-wrap">
                        <QRCodeSVG value={seller.upiLink} size={100} className="upi-qr" includeMargin={false} />
                        <a className="upi-pay-link" href={seller.upiLink}>
                          Open in UPI App
                        </a>
                      </div>
                    ) : (
                      <div className="upi-no-qr">No QR available</div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                    src={buildUploadUrl(`uploads/${item.productId?.image}`)}
                    alt={item.productId?.name}
                  />
                  <div className="order-item-info">
                    <h4>{item.productId?.name}</h4>
                    <p className="item-price">Price: ₹{item.productId?.price}</p>
                    <p className="seller-line">
                      Seller Phone: {item.productId?.sellerId?.phone || "Not available"}
                    </p>
                    <div className="quantity-control">
                      <label>Quantity:</label>
                      <div className="qty-buttons">
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(index, (quantities[index] || 1) - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantities[index] || 1}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          className="qty-input"
                        />
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(index, (quantities[index] || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="order-item-price">Subtotal: ₹{(item.productId?.price || 0) * (quantities[index] || 1)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{total}</span>
              </div>
              {discountAmount > 0 && (
                <div className="total-row discount-row">
                  <span>Discount ({discountPercent}%)</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>₹{Math.max(0, total - discountAmount)}</span>
              </div>
            </div>

            {hasOutOfStock && (
              <div className="out-of-stock-warning">
                Some items are out of stock or exceed available quantity. Adjust the quantities or remove those items to continue.
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || hasOutOfStock}
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

