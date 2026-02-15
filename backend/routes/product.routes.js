const router = require("express").Router();
const Product = require("../models/Product");
const multer = require("multer");
const auth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

// GET ALL PRODUCTS (Public)
router.get("/", async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { productId: { $regex: search, $options: "i" } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ msg: "Error fetching products", error: error.message });
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

// ADD PRODUCT (Admin only)
router.post("/add", auth, upload.array("image", 10), async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const {
      productId,
      name,
      description,
      price,
      category,
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

    // Parse sizes and colors
    const sizes = Array.isArray(availableSizes) 
      ? availableSizes 
      : (availableSizes ? availableSizes.split(",").map(s => s.trim()) : []);
    
    const colors = Array.isArray(availableColors)
      ? availableColors
      : (availableColors ? availableColors.split(",").map(c => c.trim()) : []);

    const product = await Product.create({
      productId: productId.toUpperCase(),
      name,
      description,
      price: parseFloat(price),
      category,
      releaseDate: new Date(releaseDate),
      stockQuantity: parseInt(stockQuantity) || 0,
      rating: parseFloat(rating) || 0,
      numberOfReviews: parseInt(numberOfReviews) || 0,
      images: productImages,
      availableSizes: sizes,
      availableColors: colors,
      featured: featured === "true" || featured === true,
      image: req.files && req.files.length > 0 ? req.files[0].filename : productImages[0] || ""
    });

    res.json({ msg: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Product ID already exists" });
    }
    res.status(500).json({ msg: "Error adding product", error: error.message });
  }
});

// UPDATE PRODUCT (Admin only)
router.put("/:id", auth, upload.array("image", 10), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
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

    // Handle sizes and colors
    if (req.body.availableSizes) {
      updateData.availableSizes = Array.isArray(req.body.availableSizes)
        ? req.body.availableSizes
        : req.body.availableSizes.split(",").map(s => s.trim());
    }

    if (req.body.availableColors) {
      updateData.availableColors = Array.isArray(req.body.availableColors)
        ? req.body.availableColors
        : req.body.availableColors.split(",").map(c => c.trim());
    }

    // Convert types
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity);
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
    if (updateData.numberOfReviews) updateData.numberOfReviews = parseInt(updateData.numberOfReviews);
    if (updateData.releaseDate) updateData.releaseDate = new Date(updateData.releaseDate);
    if (updateData.productId) updateData.productId = updateData.productId.toUpperCase();
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === "true" || updateData.featured === true;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ msg: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ msg: "Error updating product", error: error.message });
  }
});

// DELETE PRODUCT (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ msg: "Error deleting product", error: error.message });
  }
});

module.exports = router;
