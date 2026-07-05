import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import toast from "react-hot-toast";
import "./AdminPages.css";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", color: "#F39C12" },
  { value: "Processing", label: "Processing", color: "#3498DB" },
  { value: "Paid", label: "Paid", color: "#2ECC71" },
  { value: "Shipped", label: "Shipped", color: "#9B59B6" },
  { value: "Delivered", label: "Delivered", color: "#27AE60" },
  { value: "Cancelled", label: "Cancelled", color: "#E74C3C" },
];

// Statuses considered "active" — shown in default "All" view
const ACTIVE_STATUSES = ["Pending", "Processing", "Paid", "Shipped", "Delivered"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllOrders();
      const items = res.data?.items || res.data?.data || res.data || [];
      const list = Array.isArray(items) ? items : [];

      const normalized = list.map((o) => ({
  id: o.id || o.orderId,
  date: o.createdAt || o.date || new Date().toISOString(),
  status: o.status || "Pending",
  total: Number(o.totalAmount || o.total || 0),
  customerEmail: o.customer?.email || o.customerEmail || o.email || "—",
  customerName: o.customer?.firstName
    ? `${o.customer.firstName} ${o.customer.lastName || ""}`.trim()
    : o.customerName || "Customer",
  customerId: o.customer?.id || null,
  itemsCount: (o.items || []).length,
  items: o.items || [],
}));

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(normalized);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Status updated to ${newStatus}`);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (str) =>
    new Date(str).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ═══ SMART FILTERING ═══
  const filtered = orders
    .filter((o) => {
      if (filter === "all") {
        // "All" = active orders only (NO cancelled)
        return ACTIVE_STATUSES.includes(o.status);
      }
      // Specific status filter
      return o.status.toLowerCase() === filter.toLowerCase();
    })
    .filter((o) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        String(o.id).toLowerCase().includes(s) ||
        o.customerEmail.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s)
      );
    });

  // ═══ STATS — Only count ACTIVE orders (not cancelled) ═══
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;

  const stats = {
    total: activeOrders.length, // Only active orders
    pending: orders.filter((o) => o.status === "Pending").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    revenue: orders
      .filter((o) => ["Paid", "Shipped", "Delivered"].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0),
  };

  // Count helper for tabs
  const getCount = (status) => {
    if (status === "all") return activeOrders.length;
    return orders.filter((o) => o.status.toLowerCase() === status.toLowerCase()).length;
  };

  return (
    <div className="nl-admin-page-wrap">
      {/* Header */}
      <div className="nl-admin-welcome">
        <h2>Orders Management 📦</h2>
        <p>View, update, and manage all customer orders</p>
      </div>

      {/* Stats */}
      <div className="nl-admin-stat-grid">
        <div className="nl-admin-stat" style={{ "--accent": "#E8920A" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <path d="M9 11H1l3-9h11l3 9h-3" />
              <circle cx="6" cy="15" r="2" />
              <circle cx="18" cy="15" r="2" />
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{stats.total}</div>
            <div className="nl-admin-stat__label">Active Orders</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": "#F39C12" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{stats.pending}</div>
            <div className="nl-admin-stat__label">Pending</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": "#9B59B6" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <rect x="1" y="6" width="14" height="11" rx="1" />
              <path d="M15 9h4l3 3v5h-7V9z" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{stats.shipped}</div>
            <div className="nl-admin-stat__label">Shipped</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": "#2ECC71" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">₦{stats.revenue.toLocaleString()}</div>
            <div className="nl-admin-stat__label">Revenue</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="nl-admin-toolbar">
        <div className="nl-admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="nl-admin-filter-tabs">
          <button
            className={`nl-admin-filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Active
            <span className="nl-admin-filter-tab__count">{getCount("all")}</span>
          </button>
          {["Pending", "Processing", "Paid", "Shipped", "Delivered"].map((s) => (
            <button
              key={s}
              className={`nl-admin-filter-tab ${
                filter.toLowerCase() === s.toLowerCase() ? "active" : ""
              }`}
              onClick={() => setFilter(s)}
            >
              {s}
              <span className="nl-admin-filter-tab__count">{getCount(s)}</span>
            </button>
          ))}

          {/* Cancelled tab — visually separated with archive style */}
          {cancelledCount > 0 && (
            <button
              className={`nl-admin-filter-tab nl-admin-filter-tab--archive ${
                filter === "Cancelled" ? "active" : ""
              }`}
              onClick={() => setFilter("Cancelled")}
              title="View archived/cancelled orders"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              Archive
              <span className="nl-admin-filter-tab__count">{cancelledCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Info banner when viewing cancelled */}
      {filter === "Cancelled" && (
        <div className="nl-admin-info-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <div>
            <strong>Viewing Cancelled Orders Archive</strong>
            <span>These orders are kept for record-keeping. They won't appear in your active orders.</span>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="nl-admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#8B7355" }}>
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#8B7355" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>
              {filter === "Cancelled" ? "🗄️" : "📦"}
            </div>
            <p style={{ margin: 0, marginBottom: "0.5rem", fontWeight: 600, color: "#1A1208" }}>
              {filter === "all" 
                ? "No active orders right now"
                : filter === "Cancelled"
                ? "No cancelled orders"
                : `No ${filter.toLowerCase()} orders`}
            </p>
            <p style={{ margin: 0, fontSize: "0.88rem" }}>
              {filter === "all"
                ? "All caught up! New orders will appear here."
                : "Try a different filter or search."}
            </p>
          </div>
        ) : (
          <div className="nl-orders-admin-table">
            <div className="nl-orders-admin-table__head">
              <div>Order ID</div>
              <div>Customer</div>
              <div>Date</div>
              <div>Items</div>
              <div>Total</div>
              <div>Status</div>
            </div>

            {filtered.map((order) => {
              const statusConfig =
                STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0];
              const isUpdating = updatingId === order.id;
              const isCancelled = order.status === "Cancelled";

              return (
                <div
                  key={order.id}
                  className={`nl-orders-admin-row ${isCancelled ? "is-cancelled" : ""}`}
                >
                  <div className="nl-orders-admin-row__id">
                    #{String(order.id).substring(0, 8).toUpperCase()}
                  </div>

                  <div>
                    <div className="nl-orders-admin-row__name">{order.customerName}</div>
                    <div className="nl-orders-admin-row__email">{order.customerEmail}</div>
                  </div>

                  <div className="nl-orders-admin-row__date">{formatDate(order.date)}</div>

                  <div>
                    <span className="nl-orders-admin-row__items">{order.itemsCount} items</span>
                  </div>

                  <div className="nl-orders-admin-row__total">
                    ₦{order.total.toLocaleString()}
                  </div>

                  <div>
                    {isCancelled ? (
                      // Cancelled orders show as locked badge (can't change)
                      <span
                        className="nl-orders-admin-row__locked-badge"
                        style={{
                          background: `${statusConfig.color}15`,
                          color: statusConfig.color,
                          borderColor: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isUpdating}
                        className="nl-orders-admin-row__select"
                        style={{
                          background: `${statusConfig.color}15`,
                          color: statusConfig.color,
                          borderColor: statusConfig.color,
                        }}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}