import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    sellerUpiId: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    profileImage: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/me");
        const user = res.data.user;
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          sellerUpiId: user.sellerUpiId || "",
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          pincode: user.address?.pincode || "",
          country: user.address?.country || "India",
          profileImage: user.profileImage || "",
        });
      } catch (err) {
        setError(err.response?.data?.msg || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());
      formData.append("sellerUpiId", form.sellerUpiId.trim());
      formData.append("street", form.street.trim());
      formData.append("city", form.city.trim());
      formData.append("state", form.state.trim());
      formData.append("pincode", form.pincode.trim());
      formData.append("country", form.country.trim());

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const user = res.data.user;
      updateField("profileImage", user.profileImage || "");
      localStorage.setItem("username", user.name || "");
      localStorage.setItem("profileImage", user.profileImage || "");
      localStorage.setItem("phone", user.phone || "");
      localStorage.setItem("sellerUpiId", user.sellerUpiId || "");
      setMessage("Profile updated successfully");
      setProfileImageFile(null);
      setImagePreview("");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-page"><div className="profile-shell">Loading profile...</div></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <h1>My Profile</h1>
        <p className="profile-subtitle">Update your account details and profile picture.</p>

        {message && <div className="profile-alert success">{message}</div>}
        {error && <div className="profile-alert error">{error}</div>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-image-row">
            <div className="profile-image-preview">
              {(imagePreview || form.profileImage) ? (
                <img
                  src={imagePreview || `http://localhost:5000/uploads/profiles/${form.profileImage}`}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/120x120?text=User";
                  }}
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div>
              <label>Profile Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div className="profile-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Email (read-only)</label>
              <input value={form.email} disabled />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            {role === "seller" && (
              <div className="input-group">
                <label>UPI ID (for QR payments)</label>
                <input value={form.sellerUpiId} onChange={(e) => updateField("sellerUpiId", e.target.value)} placeholder="example@upi" />
              </div>
            )}
            <div className="input-group full-width">
              <label>Street</label>
              <input value={form.street} onChange={(e) => updateField("street", e.target.value)} />
            </div>
            <div className="input-group">
              <label>City</label>
              <input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div className="input-group">
              <label>State</label>
              <input value={form.state} onChange={(e) => updateField("state", e.target.value)} />
            </div>
            <div className="input-group">
              <label>Pincode</label>
              <input value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
            </div>
            <div className="input-group">
              <label>Country</label>
              <input value={form.country} onChange={(e) => updateField("country", e.target.value)} />
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
