import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ordersAPI } from "../api";
import "./OrderDetail.css";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getById(id);
      const orderData = res.data || res;
      console.log("📦 Order details:", orderData);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Order not found or you don't have access to it.");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="nl-order-page">
        <div className="container">
          <div className="nl-loading">
            <div className="nl-spinner-large" />
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="nl-order-page">
        <div className="container">
          <div className="nl-order-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" width="64" height="64">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2>Order Not Found</h2>
            <p>{error || "This order doesn't exist."}</p>
            <button className="btn nl-btn" onClick={() => navigate("/profile")}>
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderId = order.orderId || order.id || id;
  const shortId = String(orderId).substring(0, 8).toUpperCase();
  const items = order.items || order.orderItems || [];
  const subtotal = items.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity || 1)),
    0
  );

  return (
    <div className="nl-order-page">
      <div className="container">
        <nav className="nl-breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/profile">My Account</Link></li>
            <li className="active">Order #{shortId}</li>
          </ol>
        </nav>

        <div className="nl-order-container">
          <div className="nl-order-header">
            <div>
              <h1>Order Details</h1>
              <p className="nl-order-number">Order #{shortId}</p>
              {order.createdAt && (
                <p className="nl-order-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              )}
            </div>
            <span
              className="nl-order-status"
              style={{ background: getStatusColor(order.status) }}
            >
              {order.status || "Pending"}
            </span>
          </div>

          {/* Items */}
          <div className="nl-order-section">
            <h2>Order Items</h2>
            {items.length === 0 ? (
              <div className="nl-empty-items">
                <p>No item details available for this order.</p>
              </div>
            ) : (
              <div className="nl-order-items">
                {items.map((item, idx) => (
                  <div key={idx} className="nl-order-item-row">
                    <div className="nl-order-item-img">
                      {item.frontImageUrl || item.imageUrl ? (
                        <img
                          src={item.frontImageUrl || item.imageUrl}
                          alt={item.productName || item.name}
                        />
                      ) : (
                        <div className="nl-order-item-noimg">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="nl-order-item-info">
                      <div className="nl-order-item-name">
                        {item.productName || item.name || "Product"}
                      </div>
                      <div className="nl-order-item-meta">
                        Qty: {item.quantity || 1} × ₦{Number(item.price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="nl-order-item-total">
                      ₦{Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="nl-order-section">
            <h2>Payment Summary</h2>
            <div className="nl-order-summary">
              {subtotal > 0 && (
                <div className="nl-summary-row">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="nl-summary-row">
                  <span>Shipping</span>
                  <span>₦{Number(order.shippingCost).toLocaleString()}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="nl-summary-row">
                  <span>Tax</span>
                  <span>₦{Number(order.tax).toLocaleString()}</span>
                </div>
              )}
              <div className="nl-summary-row nl-summary-total">
                <span>Total Amount</span>
                <span>₦{Number(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Cancellation info if cancelled */}
          {order.status === "Cancelled" && (
            <div className="nl-order-section">
              <h2>Cancellation Information</h2>
              <div className="nl-cancel-info">
                {order.cancelledAt && (
                  <p>
                    <strong>Cancelled on:</strong>{" "}
                    {new Date(order.cancelledAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {order.cancellationReason && (
                  <p>
                    <strong>Reason:</strong> {order.cancellationReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="nl-order-actions">
            <button className="btn nl-btn-outline" onClick={() => navigate("/profile")}>
              ← Back to Orders
            </button>
            <button className="btn nl-btn" onClick={() => window.print()}>
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}