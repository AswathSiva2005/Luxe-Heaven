const router = require("express").Router();
const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");
const User = require("../models/User");
const multer = require("multer");
const auth = require("../middleware/auth");
const mailer = require("../utils/mailer");

const path = require("path");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

  const normalized = String(value).trim();
  if (!normalized) return [];

  if (normalized.startsWith("[")) {
    try {
      const parsed = JSON.parse(normalized);
      return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
    } catch {
      return normalized.split("\n").map((item) => item.trim()).filter(Boolean);
    }
  }

  return normalized.split("\n").flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
}

async function notifySellerStockStatus(product, previousStock, currentStock, fallbackSellerId) {
  const sellerId = product.sellerId || fallbackSellerId;
  if (!sellerId) return;

  const seller = await User.findById(sellerId).select("name email");
  if (!seller?.email) return;

  if (currentStock === 0 && previousStock > 0) {
    await mailer.sendMail({
      to: seller.email,
      subject: `Out of Stock: ${product.name}`,
      html: `
        <h2>Out of Stock Alert</h2>
        <p>Hello ${seller.name || "Seller"},</p>
        <p>Your product <strong>${product.name}</strong> is now out of stock.</p>
        <p>Previous stock: <strong>${previousStock}</strong></p>
        <p>Current stock: <strong>${currentStock}</strong></p>
        <p>Please restock the item so customers can continue purchasing it.</p>
      `
    });
    return;
  }

  if (currentStock > 0 && currentStock <= 5) {
    await mailer.sendMail({
      to: seller.email,
      subject: `Low Stock Alert: ${product.name}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>Hello ${seller.name || "Seller"},</p>
        <p>Your product <strong>${product.name}</strong> is running low on stock.</p>
        <p>Previous stock: <strong>${previousStock}</strong></p>
        <p>Current stock: <strong>${currentStock}</strong></p>
        <p>Please restock soon to avoid missing sales.</p>
      `
    });
  }
}

// GET ALL PRODUCTS (Public)
router.get("/", async (req, res) => {
  try {
    const { category, subCategory, featured, search, inStock } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (featured === "true") query.featured = true;
    if (inStock === "true") query.stockQuantity = { $gt: 0 };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { productId: { $regex: search, $options: "i" } }
      ];
    }

    const products = await Product.find(query)
      .populate("sellerId", "name email phone sellerUpiId profileImage")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ msg: "Error fetching products", error: error.message });
  }
});

// ADD PRODUCT (Seller and Admin)
router.post("/add", auth, upload.array("image", 10), async (req, res) => {
  try {
    // Check if seller or admin
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Seller or Admin access required" });
    }

    const {
      productId,
      name,
      description,
      price,
      originalPrice,
      brand,
      storeName,
      category,
      subCategory,
      outerMaterial,
      occasion,
      casualType,
      manufacturerInfo,
      keyHighlights,
      releaseDate,
      stockQuantity,
      rating,
      numberOfReviews,
      images,
      availableSizes,
      availableColors,
      featured
    } = req.body;

    // Handle images - file upload only
    let productImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        productImages.push(file.filename);
      });
    } else if (images) {
      // Fallback for URLs if provided (though UI doesn't show this option)
      productImages = images.split(",").map(img => img.trim()).filter(img => img);
    }
    
    if (productImages.length === 0) {
      return res.status(400).json({ msg: "At least one image is required" });
    }

    // Parse sizes, colors, and rich detail fields
    const sizes = parseArrayField(availableSizes);
    const colors = parseArrayField(availableColors);
    const parsedHighlights = parseArrayField(keyHighlights);

    const product = await Product.create({
      productId: productId.toUpperCase(),
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      brand: brand?.trim() || "",
      storeName: storeName?.trim() || "",
      category,
      subCategory: subCategory || "",
      outerMaterial: outerMaterial?.trim() || "",
      occasion: occasion?.trim() || "",
      casualType: casualType?.trim() || "",
      manufacturerInfo: manufacturerInfo?.trim() || "",
      keyHighlights: parsedHighlights,
      releaseDate: new Date(releaseDate),
      stockQuantity: parseInt(stockQuantity) || 0,
      rating: parseFloat(rating) || 0,
      numberOfReviews: parseInt(numberOfReviews) || 0,
      images: productImages,
      availableSizes: sizes,
      availableColors: colors,
      featured: featured === "true" || featured === true,
      image: req.files && req.files.length > 0 ? req.files[0].filename : productImages[0] || "",
      sellerId: req.user.role === "seller" ? req.user.id : null
    });

    await notifySellerStockStatus(product, Math.max(product.stockQuantity, 1), product.stockQuantity, req.user.id);

    res.json({ msg: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Product ID already exists" });
    }
    res.status(500).json({ msg: "Error adding product", error: error.message });
  }
});

// GET SELLER'S PRODUCTS
router.get("/seller/my-products", auth, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ msg: "Seller access required" });
    }

    const products = await Product.find({ sellerId: req.user.id })
      .populate("sellerId", "name email phone sellerUpiId profileImage")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ msg: "Error fetching products", error: error.message });
  }
});

// UPDATE PRODUCT (Seller can update own products, Admin can update any)
router.put("/:id", auth, upload.array("image", 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId", "name email phone sellerUpiId profileImage");
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check permissions: seller can only update own products, admin can update any
    if (req.user.role === "seller" && product.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only update your own products" });
    }
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({ msg: "Admin or Seller access required" });
    }

    const updateData = { ...req.body };

    // Handle images
    if (req.body.images) {
      updateData.images = req.body.images.split(",").map(img => img.trim()).filter(img => img);
    }
    if (req.files && req.files.length > 0) {
      updateData.images = updateData.images || [];
      req.files.forEach(file => {
        updateData.images.push(file.filename);
      });
      updateData.image = req.files[0].filename;
    }

    // Handle sizes, colors, and rich product detail fields
    if (req.body.availableSizes) {
      updateData.availableSizes = parseArrayField(req.body.availableSizes);
    }

    if (req.body.availableColors) {
      updateData.availableColors = parseArrayField(req.body.availableColors);
    }

    if (req.body.keyHighlights !== undefined) {
      updateData.keyHighlights = parseArrayField(req.body.keyHighlights);
    }

    // Convert types
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stockQuantity !== undefined) updateData.stockQuantity = parseInt(updateData.stockQuantity) || 0;
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
    if (updateData.numberOfReviews) updateData.numberOfReviews = parseInt(updateData.numberOfReviews);
    if (updateData.releaseDate) updateData.releaseDate = new Date(updateData.releaseDate);
    if (updateData.productId) updateData.productId = updateData.productId.toUpperCase();
    if (updateData.subCategory !== undefined) updateData.subCategory = updateData.subCategory || "";
    if (updateData.brand !== undefined) updateData.brand = updateData.brand?.trim() || "";
    if (updateData.storeName !== undefined) updateData.storeName = updateData.storeName?.trim() || "";
    if (updateData.outerMaterial !== undefined) updateData.outerMaterial = updateData.outerMaterial?.trim() || "";
    if (updateData.occasion !== undefined) updateData.occasion = updateData.occasion?.trim() || "";
    if (updateData.casualType !== undefined) updateData.casualType = updateData.casualType?.trim() || "";
    if (updateData.manufacturerInfo !== undefined) updateData.manufacturerInfo = updateData.manufacturerInfo?.trim() || "";
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === "true" || updateData.featured === true;
    }

    // Track stock change
    const oldStock = product.stockQuantity;
    const newStock = updateData.stockQuantity !== undefined ? updateData.stockQuantity : oldStock;
    const stockChanged = oldStock !== newStock;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Create stock history entry if stock changed
    if (stockChanged) {
      const changeType = newStock > oldStock ? "restock" : "manual";
      await StockHistory.create({
        productId: req.params.id,
        sellerId: req.user.role === "seller" ? req.user.id : product.sellerId || req.user.id,
        oldStock,
        newStock,
        changeType,
        notes: req.body.notes || ""
      });

      await notifySellerStockStatus(updatedProduct, oldStock, newStock, req.user.id);
    }

    res.json({ msg: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ msg: "Error updating product", error: error.message });
  }
});

// DELETE PRODUCT (Seller can delete own products, Admin can delete any)
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check permissions: seller can only delete own products, admin can delete any
    if (req.user.role === "seller" && product.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only delete your own products" });
    }
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({ msg: "Admin or Seller access required" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ msg: "Error deleting product", error: error.message });
  }
});

// GET STOCK HISTORY (Seller can view own products' history, Admin can view all)
router.get("/stock-history/:productId", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check permissions: seller can only view own products, admin can view any
    if (req.user.role === "seller" && product.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only view history for your own products" });
    }
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({ msg: "Admin or Seller access required" });
    }

    const history = await StockHistory.find({ productId: req.params.productId })
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.json({ history, product: { name: product.name, currentStock: product.stockQuantity } });
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ msg: "Error fetching stock history", error: error.message });
  }
});

// GET ALL STOCK HISTORY FOR SELLER
router.get("/stock-history", auth, async (req, res) => {
  console.log("Stock history route called");
  try {
    console.log("Stock history request for user:", req.user.id, "role:", req.user.role);
    
    if (req.user.role !== "seller") {
      console.log("Access denied: user is not a seller");
      return res.status(403).json({ msg: "Seller access required" });
    }

    const history = await StockHistory.find({ sellerId: req.user.id })
      .populate("productId", "name productId image images stockQuantity")
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent too much data

    console.log("Found", history.length, "stock history records");
    res.json({ history });
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ msg: "Error fetching stock history", error: error.message });
  }
});

// GET SINGLE PRODUCT (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ msg: "Error fetching product", error: error.message });
  }
});

module.exports = router;
