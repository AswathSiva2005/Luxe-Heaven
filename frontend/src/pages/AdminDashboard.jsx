import { useState, useEffect } from "react";
import api from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products"); // products, orders, add-product
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    productId: "",
    name: "",
    description: "",
    price: "",
    category: "T shirts",
    releaseDate: "",
    stockQuantity: "0",
    rating: "0",
    numberOfReviews: "0",
    imageFiles: null,
    availableSizes: [],
    availableColors: [],
    featured: false
  });

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/admin/all");
      // Filter out cancelled orders
      const activeOrders = (res.data.orders || []).filter(order => order.status !== "Cancelled");
      setOrders(activeOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        alert("Authentication failed. Please login again.");
        window.location.href = "/login";
      } else {
        alert("Error fetching orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      if (name === "featured") {
        setProductForm({ ...productForm, featured: checked });
      } else if (name.startsWith("size-")) {
        const size = name.replace("size-", "");
        setProductForm(prev => ({
          ...prev,
          availableSizes: checked
            ? [...prev.availableSizes, size]
            : prev.availableSizes.filter(s => s !== size)
        }));
      } else if (name.startsWith("color-")) {
        const color = name.replace("color-", "");
        setProductForm(prev => ({
          ...prev,
          availableColors: checked
            ? [...prev.availableColors, color]
            : prev.availableColors.filter(c => c !== color)
        }));
      }
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate images - only file upload required
    if (!editingProduct && (!productForm.imageFiles || productForm.imageFiles.length === 0)) {
      alert("Please upload at least one image file");
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all form fields
      formData.append("productId", productForm.productId);
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("category", productForm.category);
      formData.append("releaseDate", productForm.releaseDate);
      formData.append("stockQuantity", productForm.stockQuantity);
      formData.append("rating", productForm.rating);
      formData.append("numberOfReviews", productForm.numberOfReviews);
      formData.append("featured", productForm.featured);
      
      // Handle images - only file upload
      if (productForm.imageFiles && productForm.imageFiles.length > 0) {
        Array.from(productForm.imageFiles).forEach((file) => {
          formData.append("image", file);
        });
      }
      
      // Append arrays as comma-separated strings
      formData.append("availableSizes", productForm.availableSizes.join(","));
      formData.append("availableColors", productForm.availableColors.join(","));

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Product updated successfully!");
      } else {
        await api.post("/products/add", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Product added successfully!");
      }

      resetForm();
      fetchProducts();
      setActiveTab("products");
    } catch (error) {
      console.error("Error saving product:", error);
      if (error.response?.status === 401) {
        alert("Authentication failed. Please login again.");
        window.location.href = "/login";
      } else {
        alert(error.response?.data?.msg || "Error saving product");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      productId: "",
      name: "",
      description: "",
      price: "",
      category: "T shirts",
      releaseDate: "",
      stockQuantity: "0",
      rating: "0",
      numberOfReviews: "0",
      imageFiles: null,
      availableSizes: [],
      availableColors: [],
      featured: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      productId: product.productId || "",
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "T shirts",
      releaseDate: product.releaseDate ? new Date(product.releaseDate).toISOString().split("T")[0] : "",
      stockQuantity: product.stockQuantity?.toString() || "0",
      rating: product.rating?.toString() || "0",
      numberOfReviews: product.numberOfReviews?.toString() || "0",
      imageFiles: null,
      availableSizes: product.availableSizes || [],
      availableColors: product.availableColors || [],
      featured: product.featured || false
    });
    setActiveTab("add-product");
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/orders/admin/${orderId}/status`, { status });
      alert(res.data.msg || `Order ${status.toLowerCase()} successfully!`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMsg = error.response?.data?.msg || error.response?.data?.error || "Error updating order status";
      alert(errorMsg);
    }
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Gray", "Navy", "Red", "Blue", "Green", "Brown", "Beige", "Pink"];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={activeTab === "add-product" ? "active" : ""}
            onClick={() => {
              resetForm();
              setActiveTab("add-product");
            }}
          >
            Add New Product
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>
      </div>

      {activeTab === "products" && (
        <div className="products-section">
          <h2>All Products</h2>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card-admin">
                  <div className="product-images">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000/uploads/${product.images[0]}`}
                        alt={product.name}
                      />
                    ) : product.image ? (
                      <img
                        src={`http://localhost:5000/uploads/${product.image}`}
                        alt={product.name}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="product-details-admin">
                    <h3>{product.name}</h3>
                    <p className="product-id">ID: {product.productId}</p>
                    <p className="product-price">₹{product.price}</p>
                    <p className="product-stock">Stock: {product.stockQuantity}</p>
                    <div className="product-actions">
                      <button onClick={() => handleEdit(product)} className="btn-edit">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "add-product" && (
        <div className="add-product-section">
          <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label>Product ID *</label>
                <input
                  type="text"
                  name="productId"
                  value={productForm.productId}
                  onChange={handleInputChange}
                  placeholder="e.g., TSH-001, PAN-001, SNK-001"
                  required
                  disabled={!!editingProduct}
                />
                <small>Unique product identifier (will be converted to uppercase)</small>
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleInputChange}
                placeholder="Enter detailed product description"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="T shirts">T shirts</option>
                  <option value="Pants">Pants</option>
                  <option value="Sneakers">Sneakers</option>
                  <option value="Shirts">Shirts</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Release Date *</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={productForm.releaseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={productForm.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rating</label>
                <input
                  type="number"
                  name="rating"
                  value={productForm.rating}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="5"
                />
              </div>

              <div className="form-group">
                <label>Number of Reviews</label>
                <input
                  type="number"
                  name="numberOfReviews"
                  value={productForm.numberOfReviews}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Images *</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  name="imageFiles"
                  id="imageFiles"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(e) => {
                    setProductForm({ ...productForm, imageFiles: e.target.files });
                  }}
                  className="file-input"
                  required={!editingProduct}
                />
                <label htmlFor="imageFiles" className="file-upload-label">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">
                    {productForm.imageFiles && productForm.imageFiles.length > 0
                      ? `${productForm.imageFiles.length} file(s) selected`
                      : "Choose image files to upload"}
                  </span>
                  <span className="upload-button">Browse</span>
                </label>
              </div>
              <small>Select image files (JPG, PNG, WEBP, GIF) - You can select multiple images</small>
              {productForm.imageFiles && productForm.imageFiles.length > 0 && (
                <div className="selected-files">
                  {Array.from(productForm.imageFiles).map((file, index) => (
                    <div key={index} className="file-item">
                      <span>📄 {file.name}</span>
                      <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Available Sizes *</label>
              <div className="checkbox-group">
                {sizes.map((size) => (
                  <label key={size} className="checkbox-label">
                    <input
                      type="checkbox"
                      name={`size-${size}`}
                      checked={productForm.availableSizes.includes(size)}
                      onChange={handleInputChange}
                    />
                    {size}
                  </label>
                ))}
              </div>
              <small>Hold Ctrl/Cmd to select multiple sizes</small>
            </div>

            <div className="form-group">
              <label>Available Colors *</label>
              <div className="checkbox-group">
                {colors.map((color) => (
                  <label key={color} className="checkbox-label">
                    <input
                      type="checkbox"
                      name={`color-${color}`}
                      checked={productForm.availableColors.includes(color)}
                      onChange={handleInputChange}
                    />
                    {color}
                  </label>
                ))}
              </div>
              <small>Hold Ctrl/Cmd to select multiple colors</small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={productForm.featured}
                  onChange={handleInputChange}
                />
                Mark as Featured Product
              </label>
              <small>Featured products will be highlighted on the homepage</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </button>
              {editingProduct && (
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="orders-section">
          <h2>All Orders</h2>
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card-admin">
                  <div className="order-header-admin">
                    <div>
                      <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                      <p className="order-user">
                        Customer: {order.userId?.name || "N/A"} ({order.userId?.email || "N/A"})
                      </p>
                      <p className="order-date">
                        Placed: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="order-status-badge" style={{
                      backgroundColor: order.status === "Placed" ? "#2874f0" :
                                      order.status === "Confirmed" ? "#388e3c" :
                                      order.status === "Shipped" ? "#fb641b" :
                                      order.status === "Delivered" ? "#388e3c" :
                                      "#ff6161"
                    }}>
                      {order.status}
                    </div>
                  </div>

                  <div className="order-items-admin">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item-admin">
                        <img
                          src={`http://localhost:5000/uploads/${item.productId?.image || item.productId?.images?.[0]}`}
                          alt={item.productId?.name}
                        />
                        <div className="order-item-info-admin">
                          <h4>{item.productId?.name}</h4>
                          <p>Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer-admin">
                    <div className="order-address-admin">
                      <h4>Shipping Address:</h4>
                      <p>{order.shippingAddress?.name}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </p>
                      <p>Phone: {order.shippingAddress?.phone}</p>
                    </div>
                    <div className="order-summary-admin">
                      <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
                      <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                      <p className="order-total"><strong>Total: ₹{order.totalAmount}</strong></p>
                    </div>
                  </div>

                  {order.status === "Placed" && (
                    <div className="order-actions-admin">
                      <button
                        onClick={() => updateOrderStatus(order._id, "Confirmed")}
                        className="btn-accept"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order._id, "Cancelled")}
                        className="btn-reject"
                      >
                        Reject Order
                      </button>
                    </div>
                  )}

                  {order.status === "Confirmed" && (
                    <div className="order-actions-admin">
                      <button
                        onClick={() => updateOrderStatus(order._id, "Shipped")}
                        className="btn-ship"
                      >
                        Mark as Shipped
                      </button>
                    </div>
                  )}

                  {order.status === "Shipped" && (
                    <div className="order-actions-admin">
                      <button
                        onClick={() => updateOrderStatus(order._id, "Delivered")}
                        className="btn-deliver"
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
