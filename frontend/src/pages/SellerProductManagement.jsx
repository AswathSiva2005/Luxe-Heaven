import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { buildUploadUrl } from "../utils/assetUrl";
import "./SellerProductManagement.css";

const initialForm = {
  productId: "",
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  brand: "",
  storeName: "",
  category: "",
  subCategory: "",
  outerMaterial: "",
  occasion: "",
  casualType: "",
  manufacturerInfo: "",
  keyHighlights: [],
  releaseDate: "",
  stockQuantity: "",
  rating: "0",
  numberOfReviews: "0",
  availableSizes: [],
  availableColors: [],
  featured: false,
};

const APPAREL_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZE_OPTIONS = ["6", "7", "8", "9", "10", "11", "12"];
const COLOR_OPTIONS = ["Black", "White", "Gray", "Navy", "Red", "Blue", "Green", "Brown", "Beige", "Pink"];
const CATEGORY_OPTIONS = [
  "Tshirt",
  "Pants",
  "Shoes",
  "Men",
  "Women",
  "Electronics",
  "Home",
  "Sports",
  "Books",
  "Toys",
  "Accessories",
  "Other",
];

const SUBCATEGORY_OPTIONS = {
  Tshirt: ["Crew Neck", "V-Neck", "Polo", "Tank Top"],
  Pants: ["Jeans", "Chinos", "Shorts", "Track Pants"],
  Shoes: ["Sneakers", "Boots", "Sandals", "Loafers"]
};

const KEY_HIGHLIGHT_OPTIONS = {
  Shoes: {
    Sneakers: [
      "Lightweight & breathable design",
      "Non-slip grip outsole",
      "Shock-absorbing cushioned sole",
      "Comfort fit for daily wear",
      "Flexible sole for easy movement"
    ],
    Boots: [
      "Durable upper for long wear",
      "Strong traction outsole",
      "Ankle support structure",
      "Comfort cushioning",
      "All-weather suitable design"
    ],
    Sandals: [
      "Open breathable design",
      "Soft comfort footbed",
      "Lightweight sole",
      "Anti-slip outsole",
      "Quick-dry upper material"
    ],
    Loafers: [
      "Slip-on convenience",
      "Elegant casual styling",
      "Soft inner lining",
      "Flexible sole",
      "Lightweight everyday comfort"
    ],
    __default: [
      "Comfort fit",
      "Durable outsole",
      "Breathable upper",
      "Lightweight feel",
      "Everyday casual use"
    ]
  },
  Tshirt: {
    __default: [
      "Soft breathable fabric",
      "Comfort regular fit",
      "Skin-friendly material",
      "Fade-resistant color",
      "Everyday wear essential"
    ]
  },
  Pants: {
    __default: [
      "Comfortable stretch fit",
      "Durable stitch quality",
      "Breathable fabric",
      "Everyday casual style",
      "Easy movement comfort"
    ]
  },
  __default: [
    "Premium quality build",
    "Comfort-oriented design",
    "Durable for long-term use",
    "Modern and stylish look",
    "Value for money"
  ]
};

export default function SellerProductManagement() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [myProducts, setMyProducts] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedHighlightOption, setSelectedHighlightOption] = useState("");
  const sizeOptions = form.category === "Shoes" ? SHOE_SIZE_OPTIONS : APPAREL_SIZE_OPTIONS;

  const getHighlightOptions = () => {
    const categoryMap = KEY_HIGHLIGHT_OPTIONS[form.category];
    if (categoryMap) {
      if (typeof categoryMap === "object" && !Array.isArray(categoryMap)) {
        return categoryMap[form.subCategory] || categoryMap.__default || [];
      }
      return categoryMap;
    }

    return KEY_HIGHLIGHT_OPTIONS.__default;
  };

  const highlightOptions = getHighlightOptions();

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const res = await api.get("/products/seller/my-products");
      setMyProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      productId: product.productId,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
      brand: product.brand || "",
      storeName: product.storeName || "",
      category: product.category,
      subCategory: product.subCategory || "",
      outerMaterial: product.outerMaterial || "",
      occasion: product.occasion || "",
      casualType: product.casualType || "",
      manufacturerInfo: product.manufacturerInfo || "",
      keyHighlights: product.keyHighlights || [],
      releaseDate: product.releaseDate.split('T')[0],
      stockQuantity: product.stockQuantity.toString(),
      rating: product.rating.toString(),
      numberOfReviews: product.numberOfReviews.toString(),
      availableSizes: product.availableSizes || [],
      availableColors: product.availableColors || [],
      featured: product.featured || false,
    });
    setExistingImages(product.images || []);
    setImages([]);
    setPreviews([]);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setImages([]);
    setPreviews([]);
    setExistingImages([]);
    setSelectedHighlightOption("");
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSelectedHighlight = () => {
    if (!selectedHighlightOption) return;
    setForm((prev) => ({
      ...prev,
      keyHighlights: prev.keyHighlights.includes(selectedHighlightOption)
        ? prev.keyHighlights
        : [...prev.keyHighlights, selectedHighlightOption],
    }));
    setSelectedHighlightOption("");
  };

  const removeHighlight = (value) => {
    setForm((prev) => ({
      ...prev,
      keyHighlights: prev.keyHighlights.filter((item) => item !== value),
    }));
  };

  const handleSizeToggle = (size) => {
    setForm((prev) => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter((s) => s !== size)
        : [...prev.availableSizes, size],
    }));
  };

  const handleColorToggle = (color) => {
    setForm((prev) => ({
      ...prev,
      availableColors: prev.availableColors.includes(color)
        ? prev.availableColors.filter((c) => c !== color)
        : [...prev.availableColors, color],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setImages(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => index !== i);
    const newPreviews = previews.filter((_, i) => index !== i);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const validateForm = () => {
    if (!form.productId.trim()) {
      setError("Product ID is required");
      return false;
    }
    if (!form.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (form.originalPrice && parseFloat(form.originalPrice) < parseFloat(form.price)) {
      setError("Original price should be greater than or equal to selling price");
      return false;
    }
    if (!form.category) {
      setError("Category is required");
      return false;
    }

    // If category requires a type (e.g., T-shirt, Pants, Shoes), ensure the subtype is provided
    if (SUBCATEGORY_OPTIONS[form.category] && !form.subCategory) {
      setError("Please select the specific type for the chosen category");
      return false;
    }

    if (!form.releaseDate) {
      setError("Release date is required");
      return false;
    }
    if (form.availableSizes.length === 0) {
      setError("At least one size is required");
      return false;
    }
    if (form.availableColors.length === 0) {
      setError("At least one color is required");
      return false;
    }
    // Check if at least one image exists (new or existing)
    if (images.length === 0 && existingImages.length === 0) {
      setError("At least one image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("productId", form.productId.trim().toUpperCase());
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("originalPrice", form.originalPrice || "");
      formData.append("brand", form.brand.trim());
      formData.append("storeName", form.storeName.trim());
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory || "");
      formData.append("outerMaterial", form.outerMaterial.trim());
      formData.append("occasion", form.occasion.trim());
      formData.append("casualType", form.casualType.trim());
      formData.append("manufacturerInfo", form.manufacturerInfo.trim());
      formData.append("keyHighlights", JSON.stringify(form.keyHighlights));
      formData.append("releaseDate", form.releaseDate);
      formData.append("stockQuantity", form.stockQuantity || "0");
      formData.append("rating", form.rating || "0");
      formData.append("numberOfReviews", form.numberOfReviews || "0");
      formData.append("featured", form.featured);

      form.availableSizes.forEach((size) => {
        formData.append("availableSizes", size);
      });
      form.availableColors.forEach((color) => {
        formData.append("availableColors", color);
      });

      images.forEach((image) => {
        formData.append("image", image);
      });

      if (editingId) {
        // Update existing product
        await api.put(`/products/${editingId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Product updated successfully!");
      } else {
        // Create new product
        await api.post("/products/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Product added successfully!");
      }

      setForm(initialForm);
      setImages([]);
      setPreviews([]);
      setExistingImages([]);
      setEditingId(null);
      setSelectedHighlightOption("");
      fetchMyProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      setSuccess("Product deleted successfully!");
      fetchMyProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete product.");
    }
  };

  return (
    <div className="seller-product-page">
      <div className="page-header">
        <h1>📦 Manage Your Products</h1>
        <div className="header-actions">
          <button className="btn-toggle" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hide Form" : "Add New Product"}
          </button>
        </div>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h2>{editingId ? "✏️ Edit Product" : "Add New Product"}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Product ID *</label>
                <input
                  type="text"
                  value={form.productId}
                  onChange={(e) => updateForm("productId", e.target.value)}
                  placeholder="e.g. PROD001"
                  readOnly={editingId ? true : false}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. Premium T-Shirt"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Original Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => updateForm("originalPrice", e.target.value)}
                  placeholder="Optional MRP / struck price"
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                  placeholder="e.g. Asian"
                />
              </div>

              <div className="form-group">
                <label>Store Name</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => updateForm("storeName", e.target.value)}
                  placeholder="e.g. AsianFootwears"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                    subCategory: "",
                    availableSizes: [],
                    keyHighlights: [],
                  }))}
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {SUBCATEGORY_OPTIONS[form.category] && (
                <div className="form-group">
                  <label>{form.category} Type *</label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      subCategory: e.target.value,
                      keyHighlights: [],
                    }))}
                    required
                  >
                    <option value="">Select Type</option>
                    {SUBCATEGORY_OPTIONS[form.category].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => updateForm("stockQuantity", e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Release Date *</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => updateForm("releaseDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Describe your product..."
                rows="4"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Showcase Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Outer Material</label>
                <input
                  type="text"
                  value={form.outerMaterial}
                  onChange={(e) => updateForm("outerMaterial", e.target.value)}
                  placeholder="e.g. Synthetic"
                />
              </div>

              <div className="form-group">
                <label>Occasion</label>
                <input
                  type="text"
                  value={form.occasion}
                  onChange={(e) => updateForm("occasion", e.target.value)}
                  placeholder="e.g. Casual"
                />
              </div>

              <div className="form-group">
                <label>Type for Casual / Product Type</label>
                <input
                  type="text"
                  value={form.casualType}
                  onChange={(e) => updateForm("casualType", e.target.value)}
                  placeholder="e.g. Sneakers"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Key Highlights</label>
              <div className="highlight-picker-row">
                <select
                  value={selectedHighlightOption}
                  onChange={(e) => setSelectedHighlightOption(e.target.value)}
                  disabled={highlightOptions.length === 0}
                >
                  <option value="">Select highlight</option>
                  {highlightOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-highlight"
                  onClick={addSelectedHighlight}
                  disabled={!selectedHighlightOption}
                >
                  Add
                </button>
              </div>
              {form.keyHighlights.length > 0 && (
                <div className="selected-highlights">
                  {form.keyHighlights.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="highlight-chip"
                      onClick={() => removeHighlight(item)}
                      title="Remove highlight"
                    >
                      {item} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Manufacturer Info</label>
              <textarea
                value={form.manufacturerInfo}
                onChange={(e) => updateForm("manufacturerInfo", e.target.value)}
                placeholder="Add manufacturer or brand information"
                rows="4"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Product Images {editingId ? "(Optional - Upload new to replace)" : "*"}</h2>
            {editingId && existingImages.length > 0 && (
              <div className="existing-images">
                <p className="existing-label">Current Images:</p>
                <div className="image-previews">
                  {existingImages.map((img, index) => (
                    <div key={index} className="image-preview">
                      <img src={buildUploadUrl(`uploads/${img}`)} alt={`Existing ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="image-upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="image-upload" className="upload-label">
                <span>📷</span>
                <span>Click to upload images (Max 5)</span>
              </label>

              {previews.length > 0 && (
                <div className="image-previews">
                  {previews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Available Sizes *</h2>
            <div className="checkbox-group">
              {sizeOptions.map((size) => (
                <label key={size} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.availableSizes.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Available Colors *</h2>
            <div className="checkbox-group">
              {COLOR_OPTIONS.map((color) => (
                <label key={color} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.availableColors.includes(color)}
                    onChange={() => handleColorToggle(color)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateForm("featured", e.target.checked)}
              />
              <span>Mark as Featured Product</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Product" : "Add Product")}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                if (editingId) {
                  cancelEdit();
                } else {
                  setForm(initialForm);
                  setImages([]);
                  setPreviews([]);
                  setError("");
                  setSelectedHighlightOption("");
                }
              }}
            >
              {editingId ? "Cancel Edit" : "Reset Form"}
            </button>
          </div>
        </form>
      )}

      <div className="my-products-section">
        <h2>My Products ({myProducts.length})</h2>
        {myProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products added yet. Add your first product above!</p>
          </div>
        ) : (
          <div className="products-grid">
            {myProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-wrapper">
                  <img
                    src={buildUploadUrl(`uploads/${product.image}`)}
                    alt={product.name}
                  />
                  {product.stockQuantity <= 0 && (
                    <div className="stock-badge out-of-stock">OUT OF STOCK</div>
                  )}
                  {product.stockQuantity > 0 && product.stockQuantity < 5 && (
                    <div className="stock-badge low-stock">Only {product.stockQuantity} left</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">₹{product.price}</p>
                  <p className="category">{product.category}</p>
                  <p className="stock-info">
                    <strong>Stock:</strong> {product.stockQuantity || 0} items
                  </p>
                  <div className="product-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                          handleDelete(product._id);
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
