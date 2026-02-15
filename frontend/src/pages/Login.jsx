import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    if (email === "aswi@gmail.com" && password === "12345") {
      // Get token from backend for admin
      try {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("username", res.data.name);
        navigate("/admin");
        return;
      } catch (error) {
        // If backend login fails, create a mock token for admin
        const adminToken = "admin_token_" + Date.now();
        localStorage.setItem("token", adminToken);
        localStorage.setItem("role", "admin");
        localStorage.setItem("username", "Admin");
        navigate("/admin");
        return;
      }
    }

    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("username", res.data.name);
    localStorage.setItem("userId", res.data.userId);
    navigate("/products");
  };

  return (
    <div className="login-grid">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
        <p className="subtitle">Login to continue shopping</p>

        <form onSubmit={login} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}
