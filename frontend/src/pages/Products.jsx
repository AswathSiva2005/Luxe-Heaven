import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import { buildUploadUrl } from "../utils/assetUrl";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const CATEGORY_OPTIONS = [
    "",
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

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const res = await api.get("/products", {
          signal: controller.signal,
          params: {
            search: search || undefined,
            category: category || undefined,
            subCategory: subCategory || undefined,
            inStock: inStockOnly ? "true" : undefined
          }
        });
        setProducts(res.data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
        }
      }
    };

    const timer = setTimeout(fetchProducts, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, subCategory, inStockOnly]);

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

  const openProductDetails = (id) => {
    navigate(`/products/${id}`);
  };

  const role = localStorage.getItem("role");

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-8 md:px-8">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Discover Products</h2>
        <p className="mt-1 text-slate-600">Find your perfect items from our curated collection.</p>
      </div>

      <div className="glass-card mb-8 p-4 md:p-5">
        <div className="relative mb-4">
          <input
            type="text"
            className="ui-input pl-10"
            placeholder="Search for products, brands and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className="ui-input"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory("");
            }}
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.filter((c) => c).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {SUBCATEGORY_OPTIONS[category] ? (
            <select className="ui-input" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
              <option value="">All Types</option>
              {SUBCATEGORY_OPTIONS[category].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ) : (
            <div className="ui-input flex items-center text-slate-400">Select category for types</div>
          )}

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            In stock only
          </label>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-600">No products available yet. Check back later.</div>
      ) : (
        <motion.div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={gridVariants} initial="hidden" animate="visible">
          {products.map((p) => (
            <motion.div
              className="glass-card cursor-pointer overflow-hidden"
              key={p._id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={() => openProductDetails(p._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openProductDetails(p._id);
                }
              }}
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                <img
                  src={buildUploadUrl(`uploads/${p.image}`)}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                />
              </div>

              <div className="p-4">
                <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                <p className="mt-1 text-sm text-slate-600">{p.description?.substring(0, 70)}...</p>
                <p className="mt-2 text-xl font-extrabold text-brand-700">₹ {p.price}</p>
                {p.category && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Category: {p.category}</p>}
                {p.subCategory && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type: {p.subCategory}</p>}

                {p.stockQuantity <= 0 && (
                  <div className="mt-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">Out of stock</div>
                )}
                {p.stockQuantity > 0 && p.stockQuantity < 5 && (
                  <div className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Only {p.stockQuantity} left</div>
                )}

                {role === "buyer" || role === "user" || !role ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      className="ui-btn-soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductDetails(p._id);
                      }}
                      title="View Details"
                    >
                      Details
                    </button>

                    <button
                      className="ui-btn-soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p._id);
                      }}
                      disabled={p.stockQuantity <= 0}
                      title="Add to Cart"
                    >
                      Cart
                    </button>

                    <button
                      className="ui-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        buyNow(p);
                      }}
                      disabled={p.stockQuantity <= 0}
                      title="Buy Now"
                    >
                      Buy Now
                    </button>

                    <button
                      className="ui-btn-soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(p._id);
                      }}
                      disabled={p.stockQuantity <= 0}
                      title="Add to Wishlist"
                    >
                      Wishlist
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">View only</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
