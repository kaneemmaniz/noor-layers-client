import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { ordersAPI } from "../api";
import toast from "react-hot-toast";
import "./Orders.css";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#F39C12",
    bg: "rgba(243, 156, 18, .12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  processing: {
    label: "Processing",
    color: "#3498DB",
    bg: "rgba(52, 152, 219, .12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    ),
  },
  paid: {
    label: "Paid",
    color: "#2ECC71",
    bg: "rgba(46, 204, 113, .12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  shipped: {
    label: "Shipped",
    color: "#9B59B6",
    bg: "rgba(155, 89, 182, .12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <rect x="1" y="6" width="14" height="11" rx="1" />
        <path d="M15 9h4l3 3v5h-7V9z" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    ),
  },
  delivered: {
    label: "Delivered",
    color: "#27AE60",
    bg: "rgba(46, 204, 113, .12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  cancelled: {
    label: "Cancelled",
    color: "#E74C3C",
    bg: "rgba(231, 76, 60, .12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

// Active statuses — shown in default "All" view
const ACTIVE_STATUSES = ["pending", "processing", "paid", "shipped", "delivered"];

// Statuses where customer can cancel
const CANCELLABLE_STATUSES = ["pending", "processing"];

const FILTER_TABS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart() || {};

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll();
      const items = response.data?.items || response.data || [];

      const normalized = items.map((o) => ({
        id: o.id || o.orderId || "Unknown",
        date: o.createdAt || o.date || new Date().toISOString(),
        status: (o.status || "pending").toLowerCase(),
        total: Number(o.totalAmount || o.total || 0),
        items: (o.items || []).map((item) => ({
          id: item.id || item.productId,
          productId: item.productId || item.id,
          name: item.name || item.productName || "Product",
          price: Number(item.price || item.unitPrice || item.finalPrice || 0),
          quantity: item.quantity || 1,
          image: item.image || item.frontImageUrl || item.imageUrl || "/product1.png",
        })),
        shippingAddress: o.shippingAddress || "—",
        trackingNumber: o.trackingNumber || null,
        paymentReference: o.paymentReference || o.reference || null,
      }));

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(normalized);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ═══ SMART FILTERING ═══
  const filteredOrders = orders.filter((o) => {
    if (filter === "all") {
      // "All" = active orders only (NO cancelled)
      return ACTIVE_STATUSES.includes(o.status);
    }
    return o.status === filter;
  });

  // Active orders count (excludes cancelled)
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getOrderCount = (status) => {
    if (status === "all") return activeOrders.length;
    return orders.filter((o) => o.status === status).length;
  };

  const handleConfirmCancel = (order) => {
    setConfirmCancel(order);
  };

  const handleCancelOrder = async () => {
    if (!confirmCancel) return;

    setCancellingId(confirmCancel.id);
    try {
      await ordersAPI.cancel(confirmCancel.id);
      toast.success("Order cancelled successfully");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === confirmCancel.id ? { ...o, status: "cancelled" } : o
        )
      );

      setConfirmCancel(null);
    } catch (err) {
      console.error("Cancel failed:", err);

      if (err.response?.status === 403) {
        toast.error("You cannot cancel this order. Please contact support.", {
          duration: 5000,
        });
      } else if (err.response?.status === 404) {
        toast.error("Cancel feature not yet available. Contact support.", {
          duration: 5000,
        });
      } else {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to cancel order";
        toast.error(msg);
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = async (order) => {
    if (!addToCart) {
      navigate("/products");
      return;
    }

    let added = 0;
    for (const item of order.items) {
      try {
        await addToCart({ id: item.productId, name: item.name }, item.quantity);
        added++;
      } catch (err) {
        console.error("Failed to add item:", item.name, err);
      }
    }

    if (added > 0) {
      toast.success(`${added} item${added > 1 ? "s" : ""} added to cart!`);
      navigate("/cart");
    } else {
      toast.error("Could not add items to cart");
    }
  };

  const handleTrackOrder = (order) => {
    if (order.trackingNumber) {
      toast.success(`Tracking: ${order.trackingNumber}`, { duration: 5000 });
    } else {
      toast("Tracking information not available yet", { icon: "ℹ️" });
    }
  };

  return (
    <div className="nl-orders-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="nl-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li className="active">My Orders</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="nl-orders-header">
          <div>
            <h1 className="nl-h1">My Orders</h1>
            <p className="nl-orders-sub">
              {activeOrders.length > 0
                ? `You have ${activeOrders.length} active order${activeOrders.length !== 1 ? "s" : ""}.`
                : "Track and manage all your orders in one place."}
            </p>
          </div>
          <button className="btn nl-btn-outline" onClick={() => navigate("/products")}>
            Continue Shopping →
          </button>
        </div>

        {/* Filter Tabs */}
        {orders.length > 0 && (
          <div className="nl-orders-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                className={`nl-tab ${filter === tab.value ? "active" : ""}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
                <span className="nl-tab__count">{getOrderCount(tab.value)}</span>
              </button>
            ))}

            {/* Cancelled archive tab — only shown if customer has cancelled orders */}
            {cancelledOrders.length > 0 && (
              <button
                className={`nl-tab nl-tab--archive ${filter === "cancelled" ? "active" : ""}`}
                onClick={() => setFilter("cancelled")}
                title="View your cancelled orders"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                Cancelled
                <span className="nl-tab__count">{cancelledOrders.length}</span>
              </button>
            )}
          </div>
        )}

        {/* Info banner for cancelled view */}
        {filter === "cancelled" && (
          <div className="nl-orders-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            <div>
              <strong>Your Cancelled Orders</strong>
              <span>You can reorder items from any cancelled order anytime.</span>
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="nl-orders-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="nl-order-skel" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="nl-orders-empty">
            <div className="nl-orders-empty__icon">
              {filter === "cancelled" ? (
                <span style={{ fontSize: "4rem" }}>🗄️</span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="80" height="80">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              )}
            </div>
            <h2>
              {filter === "all"
                ? "No active orders"
                : filter === "cancelled"
                ? "No cancelled orders"
                : `No ${filter} orders`}
            </h2>
            <p>
              {filter === "all"
                ? orders.length === 0
                  ? "When you place your first order, it'll show up here. Let's get you started!"
                  : "All your orders have been completed or cancelled. View them in the tabs above."
                : `You don't have any orders with this status yet.`}
            </p>
            {filter === "all" && orders.length === 0 ? (
              <button className="btn nl-btn" onClick={() => navigate("/products")}>
                Start Shopping →
              </button>
            ) : (
              <button className="btn nl-btn-outline" onClick={() => setFilter("all")}>
                View All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="nl-orders-list">
            {filteredOrders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isExpanded = expandedOrder === order.id;
              const canCancel = CANCELLABLE_STATUSES.includes(order.status);
              const isCancelling = cancellingId === order.id;
              const isCancelled = order.status === "cancelled";

              return (
                <div
                  key={order.id}
                  className={`nl-order ${isExpanded ? "expanded" : ""} ${
                    isCancelled ? "cancelled" : ""
                  }`}
                >
                  {/* Order Header */}
                  <div className="nl-order__head">
                    <div className="nl-order__meta">
                      <div className="nl-order__id">
                        <span className="nl-order__label">Order ID</span>
                        <span className="nl-order__value">
                          {String(order.id).substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="nl-order__date">
                        <span className="nl-order__label">Date Placed</span>
                        <span className="nl-order__value">{formatDate(order.date)}</span>
                      </div>
                      <div className="nl-order__total-meta">
                        <span className="nl-order__label">Total</span>
                        <span className="nl-order__value nl-order__total">
                          ₦{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div
                      className="nl-order__status"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="nl-order__body">
                    <div className="nl-order__items">
                      {order.items
                        .slice(0, isExpanded ? order.items.length : 3)
                        .map((item) => (
                          <div key={item.id} className="nl-order-item">
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = "/product1.png";
                              }}
                            />
                            {isExpanded && (
                              <div className="nl-order-item__info">
                                <div className="nl-order-item__name">{item.name}</div>
                                <div className="nl-order-item__meta">
                                  Qty: {item.quantity} × ₦
                                  {Number(item.price || 0).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      {!isExpanded && order.items.length > 3 && (
                        <div className="nl-order-item nl-order-item--more">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="nl-order__details">
                        <div className="nl-order__detail-row">
                          <span className="nl-order__label">Shipping Address</span>
                          <span>{order.shippingAddress}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="nl-order__detail-row">
                            <span className="nl-order__label">Tracking Number</span>
                            <span className="nl-order__tracking">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.paymentReference && (
                          <div className="nl-order__detail-row">
                            <span className="nl-order__label">Payment Reference</span>
                            <span className="nl-order__tracking">{order.paymentReference}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="nl-order__actions">
                    <button
                      className="nl-order-action"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="14"
                        height="14"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {order.status === "shipped" && (
                      <button
                        className="nl-order-action nl-order-action--track"
                        onClick={() => handleTrackOrder(order)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Track Order
                      </button>
                    )}

                    {(order.status === "delivered" || order.status === "cancelled") && (
                      <button
                        className="nl-order-action nl-order-action--reorder"
                        onClick={() => handleReorder(order)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                        </svg>
                        Reorder
                      </button>
                    )}

                    {/* CANCEL BUTTON */}
                    {canCancel && (
                      <button
                        className="nl-order-action nl-order-action--cancel"
                        onClick={() => handleConfirmCancel(order)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <span className="nl-action-spinner" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {confirmCancel && (
        <div className="nl-modal-backdrop" onClick={() => setConfirmCancel(null)}>
          <div className="nl-modal nl-modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-icon nl-modal-icon--warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="nl-modal-title">Cancel this order?</h3>
            <p className="nl-modal-desc">
              Are you sure you want to cancel order{" "}
              <strong>#{String(confirmCancel.id).substring(0, 8).toUpperCase()}</strong>?
              This action cannot be undone, but you can reorder items anytime.
            </p>

            <div className="nl-modal-summary">
              <div className="nl-modal-summary__row">
                <span>Items:</span>
                <strong>{confirmCancel.items.length}</strong>
              </div>
              <div className="nl-modal-summary__row">
                <span>Total:</span>
                <strong style={{ color: "#E8920A" }}>
                  ₦{confirmCancel.total.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="nl-modal-actions">
              <button
                className="nl-modal-btn nl-modal-btn--ghost"
                onClick={() => setConfirmCancel(null)}
              >
                Keep Order
              </button>
              <button
                className="nl-modal-btn nl-modal-btn--danger"
                onClick={handleCancelOrder}
                disabled={cancellingId === confirmCancel.id}
              >
                {cancellingId === confirmCancel.id ? (
                  <>
                    <span className="nl-action-spinner" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}