import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  role: "buyer",
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone.trim() || undefined,
        role: form.role,
        address:
          form.street || form.city || form.state || form.pincode
            ? {
                street: form.street.trim() || undefined,
                city: form.city.trim() || undefined,
                state: form.state.trim() || undefined,
                pincode: form.pincode.trim() || undefined,
                country: form.country.trim() || "India",
              }
            : undefined,
      };

      await api.post("/auth/register", payload);

      // Navigate to login page after successful registration
      navigate("/login", { state: { message: "Registration successful! Please login." } });
    } catch (err) {
      const msg = err.response?.data?.msg || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1240px] items-center px-4 py-8 md:px-8">
      <motion.div
        className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="text-xl">🛍️</span>
            Luxe Heaven
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">Join as a buyer or seller to get started.</p>
        </div>

        {error && <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Full name *</label>
            <input className="ui-input" type="text" placeholder="e.g. John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email *</label>
            <input className="ui-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password *</label>
              <input className="ui-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Confirm password *</label>
              <input className="ui-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span></label>
            <input className="ui-input" type="tel" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">I want to register as *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${form.role === "buyer" ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-300 bg-white text-slate-700"}`}>
                <input type="radio" name="role" checked={form.role === "buyer"} onChange={() => update("role", "buyer")} className="sr-only" />
                Buyer
              </label>
              <label className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${form.role === "seller" ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-300 bg-white text-slate-700"}`}>
                <input type="radio" name="role" checked={form.role === "seller"} onChange={() => update("role", "seller")} className="sr-only" />
                Seller
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Street <span className="font-normal text-slate-400">(optional)</span></label>
            <input className="ui-input" type="text" placeholder="Street address" value={form.street} onChange={(e) => update("street", e.target.value)} autoComplete="street-address" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
              <input className="ui-input" type="text" placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">State</label>
              <input className="ui-input" type="text" placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} autoComplete="address-level1" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Pincode</label>
              <input className="ui-input" type="text" placeholder="e.g. 600001" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} autoComplete="postal-code" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Country</label>
              <input className="ui-input" type="text" placeholder="Country" value={form.country} onChange={(e) => update("country", e.target.value)} autoComplete="country-name" />
            </div>
          </div>

          <button type="submit" className="ui-btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-brand-700">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
