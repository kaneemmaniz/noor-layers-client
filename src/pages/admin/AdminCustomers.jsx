import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import toast from "react-hot-toast";
import "./AdminPages.css";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllOrders();
      const items = res.data?.items || [];

      // Build unique customer map from orders
      const map = {};
      items.forEach((o) => {
        const c = o.customer;
        if (!c?.id) return;
        if (!map[c.id]) {
          map[c.id] = {
            id: c.id,
            name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—",
            email: c.email || "—",
            orders: 0,
            totalSpent: 0,
            lastOrder: null,
          };
        }
        map[c.id].orders += 1;
        map[c.id].totalSpent += Number(o.totalAmount || 0);
        const date = new Date(o.createdAt);
        if (!map[c.id].lastOrder || date > new Date(map[c.id].lastOrder)) {
          map[c.id].lastOrder = o.createdAt;
        }
      });

      const list = Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(list);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
  });

  const formatDate = (str) => str
    ? new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = customers.length > 0
    ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.orders, 0))
    : 0;

  return (
    <div className="nl-admin-page-wrap">
      {/* Header */}
      <div className="nl-admin-welcome">
        <h2>Customers 👥</h2>
        <p>View customer profiles and purchase history</p>
      </div>

      {/* Stats */}
      <div className="nl-admin-stat-grid">
        <div className="nl-admin-stat" style={{ "--accent": "#E8920A" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{customers.length}</div>
            <div className="nl-admin-stat__label">Total Customers</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": "#2ECC71" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">₦{totalRevenue.toLocaleString()}</div>
            <div className="nl-admin-stat__label">Total Revenue</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": "#3498DB" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">
              {customers.reduce((sum, c) => sum + c.orders, 0)}
            </div>
            <div className="nl-admin-stat__label">Total Orders</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": "#9B59B6" }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">₦{avgOrderValue.toLocaleString()}</div>
            <div className="nl-admin-stat__label">Avg Order Value</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="nl-admin-toolbar" style={{ marginBottom: "1rem" }}>
        <div className="nl-admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="nl-admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#8B7355" }}>
            Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#8B7355" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.4 }}>👥</div>
            <p style={{ margin: 0, fontWeight: 600, color: "#1A1208" }}>No customers found</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.88rem" }}>
              Customers appear here once they place an order.
            </p>
          </div>
        ) : (
          <div className="nl-orders-admin-table">
            <div className="nl-orders-admin-table__head" style={{
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr"
            }}>
              <div>Customer</div>
              <div>Email</div>
              <div>Orders</div>
              <div>Total Spent</div>
              <div>Last Order</div>
            </div>

            {filtered.map((c) => (
              <div key={c.id} className="nl-orders-admin-row" style={{
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr"
              }}>
                <div>
                  <div className="nl-orders-admin-row__name"
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "#fdf3e3", border: "1px solid #e8d5b0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", fontWeight: 700, color: "#E8920A",
                      flexShrink: 0,
                    }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    {c.name}
                  </div>
                </div>
                <div className="nl-orders-admin-row__email">{c.email}</div>
                <div>
                  <span style={{
                    background: "#fdf3e3", color: "#E8920A",
                    padding: "2px 10px", borderRadius: "12px",
                    fontSize: "0.8rem", fontWeight: 600,
                  }}>
                    {c.orders}
                  </span>
                </div>
                <div className="nl-orders-admin-row__total">
                  ₦{c.totalSpent.toLocaleString()}
                </div>
                <div className="nl-orders-admin-row__date">
                  {formatDate(c.lastOrder)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}