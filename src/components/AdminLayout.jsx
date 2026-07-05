import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminAPI } from "../api";
import toast from "react-hot-toast";
import "./AdminLayout.css";

const NAV_ITEMS = [
  {
    label: "Overview",
    path: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      </svg>
    ),
  },
  {
    label: "Discounts",
    path: "/admin/discounts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M9 11H1l3-9h11l3 9h-3" />
        <path d="M20 15a2 2 0 11-4 0 2 2 0 014 0zM8 15a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔔 Notification state
  const [newOrderBadge, setNewOrderBadge] = useState(0);
  const seenOrderIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  // Active link checker
  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  // ═══ ORDER NOTIFICATIONS (Smart Polling) ═══
  useEffect(() => {
    let mounted = true;

    const checkNewOrders = async () => {
      try {
        const res = await adminAPI.getAllOrders();
        const orders = res.data?.items || res.data?.data || res.data || [];
        const list = Array.isArray(orders) ? orders : [];

        if (!mounted) return;

        const currentIds = new Set(
          list.map((o) => o.id || o.orderId).filter(Boolean)
        );

        // FIRST RUN: establish baseline, no notifications
        if (!initializedRef.current) {
          seenOrderIdsRef.current = currentIds;
          initializedRef.current = true;
          return;
        }

        // Find IDs that exist NOW but weren't seen before
        const trulyNewIds = [...currentIds].filter(
          (id) => !seenOrderIdsRef.current.has(id)
        );

        if (trulyNewIds.length > 0) {
          setNewOrderBadge((prev) => prev + trulyNewIds.length);
          toast.success(
            `🔔 ${trulyNewIds.length} new order${
              trulyNewIds.length > 1 ? "s" : ""
            } received!`,
            { duration: 5000 }
          );

          try {
            new Audio("/notification.mp3").play().catch(() => {});
          } catch {}
        }

        seenOrderIdsRef.current = currentIds;
      } catch {
        // Silently ignore — endpoint may not be available
      }
    };

    checkNewOrders();
    const interval = setInterval(checkNewOrders, 60000); // every 60s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close sidebar + clear badge when navigating
  const handleNavClick = (path) => {
    setSidebarOpen(false);
    if (path === "/admin/orders") {
      setNewOrderBadge(0);
    }
  };

  return (
    <div className="nl-admin-layout">
      {/* Sidebar */}
      <aside
        className={`nl-admin-sidebar ${
          sidebarOpen ? "nl-admin-sidebar--open" : ""
        }`}
      >
        {/* Logo */}
        <div className="nl-admin-sidebar__logo" onClick={() => navigate("/")}>
          <svg
            viewBox="0 0 56 56"
            width="40"
            height="40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28 4 L48 12 L48 32 Q48 46 28 52 Q8 46 8 32 L8 12 Z"
              fill="none"
              stroke="#E8920A"
              strokeWidth="1.5"
            />
            <path
              d="M14 20 Q10 18 11 14 Q13 16 14 20Z M14 26 Q9 24 10 19 Q12 21 14 26Z M14 32 Q9 30 11 25 Q13 27 14 32Z"
              fill="#E8920A"
              opacity="0.9"
            />
            <path
              d="M42 20 Q46 18 45 14 Q43 16 42 20Z M42 26 Q47 24 46 19 Q44 21 42 26Z M42 32 Q47 30 45 25 Q43 27 42 32Z"
              fill="#E8920A"
              opacity="0.9"
            />
            <text
              x="28"
              y="34"
              textAnchor="middle"
              fill="#E8920A"
              fontFamily="Cormorant Garamond, serif"
              fontWeight="700"
              fontSize="16"
              letterSpacing="1"
            >
              NL
            </text>
          </svg>
          <div>
            <div className="nl-admin-sidebar__brand">Noor Layers</div>
            <div className="nl-admin-sidebar__tag">Admin Panel</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="nl-admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nl-admin-nav-link ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className="nl-admin-nav-link__icon">{item.icon}</span>
              <span>{item.label}</span>

              {/* Notification badge on Orders link */}
              {item.path === "/admin/orders" && newOrderBadge > 0 && (
                <span className="nl-admin-nav-link__badge">
                  {newOrderBadge}
                </span>
              )}

              {isActive(item.path) && (
                <span className="nl-admin-nav-link__indicator" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="nl-admin-sidebar__footer">
          <div className="nl-admin-user">
            <div className="nl-admin-user__avatar">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="nl-admin-user__info">
              <div className="nl-admin-user__name">
                {user?.firstName || "Admin"}
              </div>
              <div className="nl-admin-user__role">
                {user?.role || "Admin"}
              </div>
            </div>
          </div>
          <button
            className="nl-admin-logout"
            onClick={logout}
            title="Logout"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              width="18"
              height="18"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="nl-admin-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="nl-admin-main">
        {/* Topbar */}
        <header className="nl-admin-topbar">
          <button
            className="nl-admin-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="22"
              height="22"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="nl-admin-topbar__title">
            {NAV_ITEMS.find((i) => isActive(i.path))?.label || "Dashboard"}
            {newOrderBadge > 0 && (
              <span className="nl-admin-topbar__notification">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="16"
                  height="16"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {newOrderBadge} new
              </span>
            )}
          </div>

          <div className="nl-admin-topbar__actions">
            <button
              className="nl-admin-topbar__btn"
              onClick={() => navigate("/")}
              title="View Site"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                width="18"
                height="18"
              >
                <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                <path d="M3 12h18M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18" />
              </svg>
              <span className="d-none d-md-inline">View Site</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="nl-admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}