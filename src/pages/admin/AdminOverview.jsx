import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI, ordersAPI, adminAPI } from "../../api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./AdminPages.css";

const COLORS = {
  orange: "#E8920A",
  green: "#2ECC71",
  blue: "#3498DB",
  purple: "#9B59B6",
  yellow: "#F39C12",
  red: "#E74C3C",
};

const STATUS_COLORS = {
  pending: COLORS.yellow,
  processing: COLORS.blue,
  paid: COLORS.green,
  shipped: COLORS.purple,
  delivered: COLORS.green,
  cancelled: COLORS.red,
};

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    lowStock: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch products and orders in parallel
      const [productsRes, ordersRes] = await Promise.all([
        productsAPI.getAll({ page: 1, pageSize: 100 }).catch(() => ({ data: { items: [] } })),
        adminAPI.getAllOrders().catch(() =>
          ordersAPI.getAll().catch(() => ({ data: [] }))
        ),
      ]);

      // Extract product list (handle both wrapped and unwrapped responses)
      const productList = productsRes.data?.items || productsRes.items || [];
      
      // Extract order list (handle multiple response formats)
      const orderList = 
        ordersRes.data?.items || 
        ordersRes.data?.data || 
        ordersRes.data || 
        ordersRes || 
        [];
      const orderArray = Array.isArray(orderList) ? orderList : [];

      console.log("📦 Loaded:", { 
        products: productList.length, 
        orders: orderArray.length 
      });

      // Calculate stats
      const revenue = orderArray
        .filter(o => ["Paid", "Delivered", "Shipped"].includes(o.status))
        .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);
      const lowStock = productList.filter(p => (p.stockQuantity || 0) <= 5).length;

      setStats({
        totalProducts: productList.length,
        totalOrders: orderArray.length,
        revenue,
        lowStock,
      });

      setProducts(productList);
      setOrders(orderArray);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sales over last 7 days
  const getSalesData = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayLabel = date.toLocaleDateString("en", { weekday: "short" });
      const dateKey = date.toISOString().split("T")[0];

      const dayOrders = orders.filter(o => {
        try {
          const orderDate = new Date(o.createdAt || o.date);
          return orderDate.toISOString().split("T")[0] === dateKey;
        } catch {
          return false;
        }
      });

      const dayRevenue = dayOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount || o.total || 0),
        0
      );

      days.push({
        day: dayLabel,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return days;
  };

  // Orders by status
  const getOrdersByStatus = () => {
    const statusCount = {};
    orders.forEach(o => {
      const status = (o.status || "pending").toLowerCase();
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || COLORS.orange,
    }));
  };

  // Top products
  const getTopProducts = () => {
    return [...products]
      .sort((a, b) => (b.finalPrice || b.price || 0) - (a.finalPrice || a.price || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name?.length > 15 ? p.name.substring(0, 15) + "..." : p.name || "Product",
        revenue: Number(p.finalPrice || p.originalPrice || p.price || 0),
        stock: p.stockQuantity || 0,
      }));
  };

  const calculateChange = () => {
    const thisWeek = orders
      .filter(o => {
        try {
          const date = new Date(o.createdAt || o.date);
          const daysAgo = (Date.now() - date) / (1000 * 60 * 60 * 24);
          return daysAgo <= 7;
        } catch {
          return false;
        }
      })
      .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

    const lastWeek = orders
      .filter(o => {
        try {
          const date = new Date(o.createdAt || o.date);
          const daysAgo = (Date.now() - date) / (1000 * 60 * 60 * 24);
          return daysAgo > 7 && daysAgo <= 14;
        } catch {
          return false;
        }
      })
      .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  };

  const salesData = getSalesData();
  const statusData = getOrdersByStatus();
  const topProducts = getTopProducts();
  const revenueChange = calculateChange();
  const weekRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="nl-chart-tooltip">
        <div className="nl-chart-tooltip__label">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="nl-chart-tooltip__row" style={{ color: entry.color }}>
            <strong>{entry.name === "revenue" ? "Revenue" : entry.name === "orders" ? "Orders" : entry.name}:</strong>
            <span>
              {entry.name === "revenue" || entry.name === "Revenue"
                ? `₦${Number(entry.value).toLocaleString()}`
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="nl-admin-page-wrap">
        <div className="nl-admin-loading">
          <div className="nl-spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nl-admin-page-wrap">
      <div className="nl-admin-welcome">
        <h2>Welcome back! 👋</h2>
        <p>Here's what's happening with your store today.</p>
      </div>

      {/* STATS GRID */}
      <div className="nl-admin-stat-grid">
        <div className="nl-admin-stat" style={{ "--accent": COLORS.orange }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{stats.totalProducts}</div>
            <div className="nl-admin-stat__label">Total Products</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": COLORS.green }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <path d="M9 11H1l3-9h11l3 9h-3"/>
              <circle cx="6" cy="15" r="2"/>
              <circle cx="18" cy="15" r="2"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{stats.totalOrders}</div>
            <div className="nl-admin-stat__label">Total Orders</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": COLORS.blue }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">₦{stats.revenue.toLocaleString()}</div>
            <div className="nl-admin-stat__label">Total Revenue</div>
          </div>
        </div>

        <div className="nl-admin-stat" style={{ "--accent": COLORS.red }}>
          <div className="nl-admin-stat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div className="nl-admin-stat__val">{stats.lowStock}</div>
            <div className="nl-admin-stat__label">Low Stock Items</div>
          </div>
        </div>
      </div>

      {/* MAIN SALES CHART */}
      <div className="nl-admin-section nl-chart-card">
        <div className="nl-chart-card__head">
          <div>
            <h3 className="nl-chart-card__title">Revenue Last 7 Days</h3>
            <div className="nl-chart-card__value">
              <span>₦{Number(weekRevenue).toLocaleString()}</span>
              {weekRevenue > 0 && revenueChange !== 0 && (
                <span className={`nl-chart-card__change ${revenueChange > 0 ? 'up' : 'down'}`}>
                  {revenueChange > 0 ? "↑" : "↓"} {Math.abs(revenueChange)}% vs last week
                </span>
              )}
            </div>
          </div>
          <div className="nl-chart-card__legend">
            <span className="nl-chart-legend-dot" style={{ background: COLORS.orange }}></span>
            Revenue
          </div>
        </div>

        {weekRevenue === 0 ? (
          <div className="nl-chart-empty" style={{ padding: "60px 20px" }}>
            <div style={{ fontSize: "3rem" }}>📊</div>
            <p style={{ marginTop: "12px", color: "#8B7355" }}>No revenue in the last 7 days</p>
            <p style={{ color: "#B8A88F", fontSize: "0.85rem" }}>Data will appear as orders come in</p>
          </div>
        ) : (
          <div className="nl-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 115, 85, 0.1)" />
                <XAxis
                  dataKey="day"
                  stroke="#8B7355"
                  style={{ fontSize: "0.78rem" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#8B7355"
                  style={{ fontSize: "0.78rem" }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.orange}
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ fill: COLORS.orange, r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* TWO COLUMN CHARTS */}
      <div className="row g-3">
        {/* Orders by Status */}
        <div className="col-12 col-lg-5">
          <div className="nl-admin-section nl-chart-card">
            <h3 className="nl-chart-card__title">Orders by Status</h3>
            <p className="nl-chart-card__sub">Distribution of all orders</p>

            {statusData.length === 0 ? (
              <div className="nl-chart-empty">
                <div style={{ fontSize: "2.5rem" }}>📦</div>
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="nl-pie-container">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="nl-pie-legend">
                  {statusData.map((s, i) => (
                    <div key={i} className="nl-pie-legend__item">
                      <span className="nl-pie-legend__dot" style={{ background: s.color }}></span>
                      <span className="nl-pie-legend__name">{s.name}</span>
                      <span className="nl-pie-legend__val">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="col-12 col-lg-7">
          <div className="nl-admin-section nl-chart-card">
            <h3 className="nl-chart-card__title">Top Products by Price</h3>
            <p className="nl-chart-card__sub">Your highest-value products</p>

            {topProducts.length === 0 ? (
              <div className="nl-chart-empty">
                <div style={{ fontSize: "2.5rem" }}>🏆</div>
                <p>No products yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 115, 85, 0.1)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#8B7355"
                    style={{ fontSize: "0.75rem" }}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#8B7355"
                    style={{ fontSize: "0.78rem" }}
                    width={110}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232, 146, 10, 0.05)" }} />
                  <Bar
                    dataKey="revenue"
                    fill={COLORS.orange}
                    radius={[0, 8, 8, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="nl-admin-section">
        <h3 className="nl-admin-section__title">Quick Actions</h3>
        <div className="nl-admin-actions">
          <button className="nl-admin-action" onClick={() => navigate("/admin/products")}>
            <span className="nl-admin-action__icon">➕</span>
            <div>
              <div className="nl-admin-action__title">Add New Product</div>
              <div className="nl-admin-action__desc">Upload a new product to your store</div>
            </div>
          </button>

          <button className="nl-admin-action" onClick={() => navigate("/admin/discounts")}>
            <span className="nl-admin-action__icon">🏷️</span>
            <div>
              <div className="nl-admin-action__title">Apply Discount</div>
              <div className="nl-admin-action__desc">Create sales and promotions</div>
            </div>
          </button>

          <button className="nl-admin-action" onClick={() => navigate("/admin/orders")}>
            <span className="nl-admin-action__icon">📦</span>
            <div>
              <div className="nl-admin-action__title">View Orders</div>
              <div className="nl-admin-action__desc">Manage customer orders</div>
            </div>
          </button>
        </div>
      </div>

      {/* RECENT PRODUCTS */}
      <div className="nl-admin-section">
        <h3 className="nl-admin-section__title">Recent Products</h3>
        <div className="nl-admin-recent">
          {products.length === 0 ? (
            <div className="nl-chart-empty">
              <div style={{ fontSize: "2.5rem" }}>📦</div>
              <p>No products yet</p>
              <button className="btn nl-btn" onClick={() => navigate("/admin/products")}>
                Add your first product
              </button>
            </div>
          ) : (
            products.slice(0, 5).map(p => (
              <div key={p.id} className="nl-admin-recent__item">
                {p.frontImageUrl ? (
                  <img src={p.frontImageUrl} alt={p.name} />
                ) : (
                  <div className="nl-admin-recent__noimg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
                <div className="nl-admin-recent__info">
                  <div className="nl-admin-recent__name">{p.name}</div>
                  <div className="nl-admin-recent__meta">
                    Stock: {p.stockQuantity || 0} · ₦{Number(p.finalPrice || p.originalPrice || 0).toLocaleString()}
                  </div>
                </div>
                <span className={`nl-admin-recent__badge ${p.isAvailable ? 'active' : 'inactive'}`}>
                  {p.isAvailable ? "Active" : "Hidden"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}