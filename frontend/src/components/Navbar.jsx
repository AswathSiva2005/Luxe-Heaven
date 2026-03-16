import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import companyLogo from "../assets/company logo.jpeg";
import api from "../services/api";

export default function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        const image = res.data?.user?.profileImage || "";
        setProfileImage(image);
        localStorage.setItem("profileImage", image);
      } catch (error) {
        console.warn("Unable to fetch profile for navbar", error);
      }
    };

    fetchProfile();
  }, [role]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItemsByRole = {
    buyer: [
      { label: "Dashboard", to: "/buyer/dashboard" },
      { label: "Products", to: "/products" },
      { label: "Cart", to: "/cart" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Orders", to: "/orders" },
      { label: "Support", to: "/support" },
    ],
    seller: [
      { label: "Dashboard", to: "/seller/dashboard" },
      { label: "Add Product", to: "/seller/products" },
      { label: "Browse", to: "/products" },
      { label: "Orders", to: "/seller/orders" },
      { label: "Support", to: "/support" },
    ],
    user: [
      { label: "Dashboard", to: "/buyer/dashboard" },
      { label: "Products", to: "/products" },
      { label: "Cart", to: "/cart" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Orders", to: "/orders" },
    ],
    admin: [{ label: "Admin", to: "/admin" }],
  };

  const navItems = role ? navItemsByRole[role] || [] : [];

  const navLinkClass =
    "rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <motion.img
            whileHover={{ rotate: -6, scale: 1.06 }}
            src={companyLogo}
            alt="Luxe Heaven"
            className="h-10 w-10 rounded-xl object-cover shadow-md"
          />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Luxe Heaven</span>
        </Link>

        <button
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 md:hidden"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          type="button"
        >
          Menu
        </button>

        <div className="hidden items-center gap-1.5 md:flex">
          <Link to="/" className={navLinkClass}>Home</Link>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass}>{item.label}</Link>
          ))}

          {role ? (
            <>
              <Link
                to="/profile"
                className="ml-2 inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-50"
                title="Profile"
              >
                {profileImage ? (
                  <img
                    src={`http://localhost:5000/uploads/profiles/${profileImage}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-600">👤</span>
                )}
              </Link>
              <button className="ml-2 rounded-xl border border-rose-300 bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="ui-btn-soft ml-2">Register</Link>
              <Link to="/login" className="ui-btn-primary">Login</Link>
            </>
          )}
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/" className={navLinkClass} onClick={() => setIsMobileOpen(false)}>Home</Link>
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClass} onClick={() => setIsMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            {role ? (
              <>
                <Link to="/profile" className={navLinkClass} onClick={() => setIsMobileOpen(false)}>Profile</Link>
                <button
                  className="rounded-lg border border-rose-300 bg-rose-500 px-3 py-2 text-sm font-semibold text-white"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="ui-btn-soft" onClick={() => setIsMobileOpen(false)}>Register</Link>
                <Link to="/login" className="ui-btn-primary" onClick={() => setIsMobileOpen(false)}>Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
