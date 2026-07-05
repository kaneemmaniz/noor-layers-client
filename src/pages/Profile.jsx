import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ordersAPI } from "../api";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    role: "",
    userId: "",
    expiresAt: null,
  });
  
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    loadUserInfo();
    loadOrders();
  }, []);

  const loadUserInfo = () => {
    try {
      const token = localStorage.getItem("noor_token");
      const storedUser = JSON.parse(localStorage.getItem("noor_user") || "{}");
      
      let email = storedUser.email || "";
      let role = storedUser.role || "Customer";
      let userId = storedUser.id || "";
      let expiresAt = storedUser.expiresAt || null;
      
      // Decode JWT as fallback
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          email = email || payload.email || "";
          role = role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Customer";
          userId = userId || payload.sub || "";
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }
      
      const info = {
        firstName: storedUser.firstName || "",
        lastName: storedUser.lastName || "",
        phoneNumber: storedUser.phoneNumber || "",
        email: email,
        role: role,
        userId: userId,
        expiresAt: expiresAt,
      };
      
      setUserInfo(info);
      setEditForm({
        firstName: info.firstName,
        lastName: info.lastName,
        phoneNumber: info.phoneNumber,
      });
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      const ordersData = res.data?.items || res.data || res || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Since there's no backend endpoint, save to localStorage
    setTimeout(() => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("noor_user") || "{}");
        const updatedUser = {
          ...storedUser,
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          phoneNumber: editForm.phoneNumber.trim(),
        };
        localStorage.setItem("noor_user", JSON.stringify(updatedUser));
        
        setUserInfo({ ...userInfo, ...editForm });
        setEditing(false);
        toast.success("Profile updated! ✨");
      } catch (err) {
        toast.error("Failed to save profile");
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("noor_token");
      localStorage.removeItem("noor_user");
      localStorage.removeItem("accessToken");
      if (logout) logout();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#f59e0b",
      Processing: "#3b82f6",
      Paid: "#10b981",
      Shipped: "#8b5cf6",
      Delivered: "#059669",
      Cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getInitials = () => {
    if (userInfo.firstName || userInfo.lastName) {
      return ((userInfo.firstName?.[0] || "") + (userInfo.lastName?.[0] || "")).toUpperCase();
    }
    return userInfo.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim();
    return fullName || userInfo.email?.split("@")[0] || "User";
  };

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    pendingOrders: orders.filter(o => ["Pending", "Processing"].includes(o.status)).length,
    completedOrders: orders.filter(o => ["Delivered", "Paid", "Shipped"].includes(o.status)).length,
  };

  return (
    <div className="nl-profile-page">
      <div className="container">
        {/* Header */}
        <div className="nl-profile-header">
          <div className="nl-profile-avatar">{getInitials()}</div>
          <div className="nl-profile-info">
            <h1>{getDisplayName()}</h1>
            <p>{userInfo.email}</p>
            <span className={`nl-profile-badge ${userInfo.role === "Admin" ? "admin" : ""}`}>
              {userInfo.role === "Admin" ? "🛡️ Admin" : "🛍️ Customer"}
            </span>
          </div>
          <button className="btn nl-btn-outline nl-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="nl-profile-stats">
          <div className="nl-stat-mini">
            <div className="nl-stat-mini__icon" style={{ background: "#fef3c7", color: "#92400e" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-mini__val">{stats.totalOrders}</div>
              <div className="nl-stat-mini__label">Total Orders</div>
            </div>
          </div>

          <div className="nl-stat-mini">
            <div className="nl-stat-mini__icon" style={{ background: "#dbeafe", color: "#1e40af" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-mini__val">{stats.pendingOrders}</div>
              <div className="nl-stat-mini__label">In Progress</div>
            </div>
          </div>

          <div className="nl-stat-mini">
            <div className="nl-stat-mini__icon" style={{ background: "#d1fae5", color: "#065f46" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-mini__val">{stats.completedOrders}</div>
              <div className="nl-stat-mini__label">Completed</div>
            </div>
          </div>

          <div className="nl-stat-mini">
            <div className="nl-stat-mini__icon" style={{ background: "#fce7f3", color: "#9d174d" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-mini__val">₦{stats.totalSpent.toLocaleString()}</div>
              <div className="nl-stat-mini__label">Total Spent</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="nl-profile-grid">
          <aside className="nl-profile-sidebar">
            <button
              className={`nl-profile-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Account Info
            </button>

            <button
              className={`nl-profile-tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              Order History
              {orders.length > 0 && <span className="nl-tab-badge">{orders.length}</span>}
            </button>

            {userInfo.role === "Admin" && (
              <button
                className="nl-profile-tab nl-profile-tab--admin"
                onClick={() => navigate("/admin/overview")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Admin Dashboard
              </button>
            )}
          </aside>

          <main className="nl-profile-content">
            {/* ACCOUNT INFO */}
            {activeTab === "profile" && (
              <div className="nl-profile-card">
                <div className="nl-profile-card__head">
                  <div>
                    <h2>Account Information</h2>
                    <p>Manage your personal details</p>
                  </div>
                  {!editing && (
                    <button className="btn nl-btn-outline btn-sm" onClick={() => setEditing(true)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSaveProfile}>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="nl-form-label">First Name</label>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          className="nl-form-input"
                          placeholder="Enter first name"
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="nl-form-label">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          className="nl-form-input"
                          placeholder="Enter last name"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="nl-form-label">Phone Number</label>
                        <input
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                          className="nl-form-input"
                          placeholder="+234 800 000 0000"
                        />
                      </div>

                      <div className="col-12">
                        <label className="nl-form-label">Email (cannot be changed)</label>
                        <input
                          type="email"
                          value={userInfo.email}
                          className="nl-form-input"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="nl-profile-actions">
                      <button type="button" className="btn nl-btn-outline" onClick={() => {
                        setEditing(false);
                        setEditForm({
                          firstName: userInfo.firstName,
                          lastName: userInfo.lastName,
                          phoneNumber: userInfo.phoneNumber,
                        });
                      }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn nl-btn" disabled={saving}>
                        {saving ? <><span className="nl-spinner" /> Saving...</> : "Save Changes"}
                      </button>
                    </div>

                    <div className="nl-info-note">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <span>Profile changes are saved locally for now. Backend sync coming soon.</span>
                    </div>
                  </form>
                ) : (
                  <div className="nl-info-list">
                    <div className="nl-info-item">
                      <div className="nl-info-item__label">First Name</div>
                      <div className="nl-info-item__val">
                        {userInfo.firstName || <span className="nl-text-muted">Not set</span>}
                      </div>
                    </div>

                    <div className="nl-info-item">
                      <div className="nl-info-item__label">Last Name</div>
                      <div className="nl-info-item__val">
                        {userInfo.lastName || <span className="nl-text-muted">Not set</span>}
                      </div>
                    </div>

                    <div className="nl-info-item">
                      <div className="nl-info-item__label">Email Address</div>
                      <div className="nl-info-item__val">{userInfo.email}</div>
                    </div>

                    <div className="nl-info-item">
                      <div className="nl-info-item__label">Phone Number</div>
                      <div className="nl-info-item__val">
                        {userInfo.phoneNumber || <span className="nl-text-muted">Not set</span>}
                      </div>
                    </div>

                    <div className="nl-info-item">
                      <div className="nl-info-item__label">Account Type</div>
                      <div className="nl-info-item__val">
                        <span className={`nl-profile-badge ${userInfo.role === "Admin" ? "admin" : ""}`}>
                          {userInfo.role}
                        </span>
                      </div>
                    </div>

                    <div className="nl-info-item">
                      <div className="nl-info-item__label">User ID</div>
                      <div className="nl-info-item__val nl-info-item__val--mono">
                        {userInfo.userId}
                      </div>
                    </div>

                    {userInfo.expiresAt && (
                      <div className="nl-info-item">
                        <div className="nl-info-item__label">Session Expires</div>
                        <div className="nl-info-item__val">
                          {new Date(userInfo.expiresAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="nl-profile-card">
                <div className="nl-profile-card__head">
                  <div>
                    <h2>Order History</h2>
                    <p>All your past and current orders</p>
                  </div>
                </div>

                {loading ? (
                  <div className="nl-loading-state">
                    <div className="nl-spinner-large" />
                    <p>Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="nl-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    </svg>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <button className="btn nl-btn" onClick={() => navigate("/")}>
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="nl-orders-list">
                   {orders.map((order) => {
  // ✅ Handle multiple possible field names
  const orderId = order.orderId || order.id;
  const shortId = String(orderId).substring(0, 8).toUpperCase();
  
  return (
    <div key={orderId} className="nl-order-card">
      <div className="nl-order-card__head">
        <div>
          <div className="nl-order-id">
            Order #{shortId}
          </div>
          <div className="nl-order-date">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Date unavailable"}
          </div>
        </div>
        <span
          className="nl-order-status"
          style={{ background: getStatusColor(order.status) }}
        >
          {order.status || "Pending"}
        </span>
      </div>

      <div className="nl-order-card__body">
        {order.items && order.items.length > 0 ? (
          <div className="nl-order-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="nl-order-item">
                <span className="nl-order-item__name">
                  {item.productName || item.name || "Product"}
                  {item.quantity && (
                    <span className="nl-order-item__qty"> × {item.quantity}</span>
                  )}
                </span>
                <span className="nl-order-item__price">
                  ₦{Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="nl-order-items">
            <div className="nl-text-muted" style={{ padding: "8px 0", fontSize: "13px" }}>
              Click "View Details" to see items
            </div>
          </div>
        )}

        <div className="nl-order-card__foot">
          <div className="nl-order-total">
            Total: <strong>₦{Number(order.totalAmount || 0).toLocaleString()}</strong>
          </div>
          <button
            className="btn nl-btn-outline btn-sm"
            onClick={() => {
              if (!orderId) {
                console.error("No order ID!", order);
                return;
              }
              navigate(`/orders/${orderId}`);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
})}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}