import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="logo-icon">🛍️</span>
        <span className="nav-logo">Luxe Heaven</span>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {role === "user" && (
          <>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">Orders</Link>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin">Admin</Link>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        )}

        {!role && (
          <>
            <Link to="/register" className="ghost-btn">Register</Link>
            <Link to="/login" className="primary-btn">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
