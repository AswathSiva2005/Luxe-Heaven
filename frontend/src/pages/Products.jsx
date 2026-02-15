import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  const addToCart = async (id) => {
    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }
    try {
      await api.post("/cart/add", { productId: id });
      alert("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.msg || "Error adding to cart");
    }
  };

  const addToWishlist = async (id) => {
    if (!token) {
      alert("Please login to add items to wishlist");
      navigate("/login");
      return;
    }
    try {
      await api.post("/wishlist/add", { productId: id });
      alert("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert(error.response?.data?.msg || "Error adding to wishlist");
    }
  };

  const buyNow = (product) => {
    if (!token) {
      alert("Please login to buy");
      navigate("/login");
      return;
    }
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

  return (
    <div className="products-page">
      <h2 className="page-title">🛍️ Our Products</h2>

      <div className="products-grid">
        {products.map(p => (
          <div className="product-card" key={p._id}>

            <div className="image-box">
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.name}
              />
            </div>

            <div className="product-info">
              <h4>{p.name}</h4>
              <p className="price">₹ {p.price}</p>

              <div className="btn-group">
                <button
                  className="cart-btn"
                  onClick={() => addToCart(p._id)}
                >
                  🛒 Add to Cart
                </button>

                <button
                  className="buy-btn"
                  onClick={() => buyNow(p)}
                >
                  🛍️ Buy Now
                </button>

                <button
                  className="wish-btn"
                  onClick={() => addToWishlist(p._id)}
                >
                  ❤️ Wishlist
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
