import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../api";
import ProductCard from "../pages/ProductCard";
import "./Products.css";

const CATEGORIES = [
  { label: "All Products", value: "All" },
  { label: "Scarves", value: "Scarves" },
  { label: "Hijabs", value: "Hijabs" },
  { label: "Abayas", value: "Abayas" },
  { label: "Jerseys", value: "Jerseys" },
  { label: "Accessories", value: "Accessories" },
  { label: "Gift Packages", value: "Gifts" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Sort by: Newest" },
  { value: "price-asc", label: "Sort by: Price Low → High" },
  { value: "price-desc", label: "Sort by: Price High → Low" },
  { value: "name", label: "Sort by: Name A–Z" },
];

const PAGE_SIZE = 12;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [priceMax, setPriceMax] = useState(100000);
  const [priceFilter, setPriceFilter] = useState(100000);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (category !== "All") params.category = category;
      const res = await productsAPI.getAll(params);
      const items = res.data?.items || [];
      setProducts(items);
      setTotalCount(res.data?.totalCount || items.length);

      if (items.length > 0) {
        const max = Math.max(...items.map(p => Number(p.originalPrice || p.price || 0)));
        if (max > 0) {
          setPriceMax(max);
          setPriceFilter(max); // set slider to max so nothing is filtered
        }
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Simple sort only — price filter only activates when slider is moved below max
  const filtered = [...products]
    .filter(p => Number(p.originalPrice || p.price || 0) <= priceFilter)
    .sort((a, b) => {
      const pa = Number(a.finalPrice || a.originalPrice || a.price || 0);
      const pb = Number(b.finalPrice || b.originalPrice || b.price || 0);
      if (sort === "price-asc") return pa - pb;
      if (sort === "price-desc") return pb - pa;
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="plp">
      <div className="plp__breadcrumb">
        <div className="container">
          <nav>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Products</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <h1 className="plp__title">Our Collection</h1>
        <p className="plp__sub">Modest essentials, <em>made beautifully</em> for you.</p>

        <div className="plp__layout">
          {/* Sidebar */}
          <aside className="plp__sidebar">
            <div className="plp__sidebar-section">
              <h4 className="plp__sidebar-heading">Categories</h4>
              <ul className="plp__cat-list">
                {CATEGORIES.map((c) => (
                  <li key={c.value}>
                    <button
                      className={`plp__cat-btn ${category === c.value ? "active" : ""}`}
                      onClick={() => { setCategory(c.value); setPage(1); }}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="plp__sidebar-section">
              <h4 className="plp__sidebar-heading">Filter by Price</h4>
              <input
                type="range"
                min={0}
                max={priceMax}
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
                className="plp__range"
              />
              <div className="plp__range-labels">
                <span>₦0</span>
                <span>₦{priceFilter.toLocaleString()}</span>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="plp__main">
            <div className="plp__toolbar">
              <span className="plp__count">
                {loading
                  ? "Loading..."
                  : `Showing ${filtered.length} of ${totalCount} results`}
              </span>
              <select
                className="plp__sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="plp__grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="plp__skel" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="plp__empty">
                <span>🔍</span>
                <p>No products found</p>
                <button onClick={() => {
                  setCategory("All");
                  setPriceFilter(priceMax);
                }}>Clear filters</button>
              </div>
            ) : (
              <div className="plp__grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="plp__pagination">
                <button className="plp__pg"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    className={`plp__pg ${page === p ? "active" : ""}`}
                    onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="plp__pg"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}>›</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}