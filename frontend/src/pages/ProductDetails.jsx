import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./ProductDetails.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/720x720?text=No+Image";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.availableColors?.[0] || "");
    setSelectedSize(product.availableSizes?.[0] || "");
    setSelectedImage(0);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product?.originalPrice || !product?.price || product.originalPrice <= product.price) {
      return 0;
    }
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product]);

  const addToCart = async () => {
    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await api.post("/cart/add", { productId: product._id });
      alert("Added to cart");
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding to cart");
    }
  };

  const buyNow = () => {
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
          subtotal: product.price,
        }],
        total: product.price,
        fromCart: false,
      },
    });
  };

  if (loading) {
    return <div className="product-details-page"><div className="product-loading">Loading product details...</div></div>;
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="product-error-card">
          <h2>Unable to open this product</h2>
          <p>{error || "Product not found"}</p>
          <button onClick={() => navigate("/products")}>Back to Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="product-details-shell">
        <button className="back-link" onClick={() => navigate("/products")}>← Back to Products</button>

        <div className="product-details-grid">
          <div className="product-gallery-panel">
            <div className="main-product-image">
              <img
                src={galleryImages[selectedImage] ? `http://localhost:5000/uploads/${galleryImages[selectedImage]}` : FALLBACK_IMAGE}
                alt={product.name}
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="thumbnail-strip">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={`thumbnail-button ${selectedImage === index ? "active" : ""}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={`http://localhost:5000/uploads/${image}`}
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-summary-panel">
            <div className="summary-topbar">
              <span className="brand-chip">{product.brand || product.category}</span>
              {product.storeName && <span className="store-chip">Visit store: {product.storeName}</span>}
            </div>

            <h1>{product.name}</h1>
            <p className="summary-description">{product.description}</p>

            <div className="rating-row">
              <span className="rating-pill">{Number(product.rating || 0).toFixed(1)} ★</span>
              <span className="review-count">{product.numberOfReviews || 0} reviews</span>
              {product.subCategory && <span className="sub-category">{product.subCategory}</span>}
            </div>

            <div className="price-block">
              {discountPercent > 0 && <span className="discount-badge">{discountPercent}% OFF</span>}
              <div className="price-row">
                <span className="sale-price">₹{Number(product.price).toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="original-price">₹{Number(product.originalPrice).toLocaleString()}</span>
                )}
              </div>
            </div>

            {product.availableColors?.length > 0 && (
              <div className="selector-block">
                <div className="selector-label">Selected Color: <strong>{selectedColor || product.availableColors[0]}</strong></div>
                <div className="chip-list">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      className={`selector-chip ${selectedColor === color ? "selected" : ""}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.availableSizes?.length > 0 && (
              <div className="selector-block">
                <div className="selector-label">Select Size</div>
                <div className="chip-list size-list">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      className={`selector-chip size-chip ${selectedSize === size ? "selected" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="delivery-card">
              <h3>Delivery details</h3>
              <p>Standard delivery available. Delivery timing depends on your location and current stock availability.</p>
              <div className="delivery-meta">
                <span>Stock: {product.stockQuantity > 0 ? `${product.stockQuantity} available` : "Out of stock"}</span>
                <span>Release date: {new Date(product.releaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            {(role === "buyer" || role === "user" || !role) && (
              <div className="product-cta-row">
                <button className="detail-btn secondary" onClick={addToCart} disabled={product.stockQuantity <= 0}>Add to Cart</button>
                <button className="detail-btn primary" onClick={buyNow} disabled={product.stockQuantity <= 0}>Buy Now</button>
              </div>
            )}
          </div>
        </div>

        <div className="product-content-grid">
          <section className="detail-card">
            <h2>Key Highlights</h2>
            {product.keyHighlights?.length ? (
              <ul className="highlights-list">
                {product.keyHighlights.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted-copy">No highlights added yet.</p>
            )}
          </section>

          <section className="detail-card">
            <h2>Specifications</h2>
            <div className="spec-grid">
              <div className="spec-row"><span>Outer material</span><strong>{product.outerMaterial || "Not specified"}</strong></div>
              <div className="spec-row"><span>Occasion</span><strong>{product.occasion || "Not specified"}</strong></div>
              <div className="spec-row"><span>Type</span><strong>{product.casualType || product.subCategory || "Not specified"}</strong></div>
              <div className="spec-row"><span>Category</span><strong>{product.category}</strong></div>
              <div className="spec-row"><span>Brand</span><strong>{product.brand || "Not specified"}</strong></div>
              <div className="spec-row"><span>Store</span><strong>{product.storeName || "Not specified"}</strong></div>
            </div>
          </section>
        </div>

        <section className="detail-card full-width-card">
          <h2>Description</h2>
          <p className="long-copy">{product.description}</p>
        </section>

        <section className="detail-card full-width-card">
          <h2>Manufacturer Info</h2>
          <p className="long-copy">{product.manufacturerInfo || "Manufacturer information has not been added yet."}</p>
        </section>
      </div>
    </div>
  );
}
