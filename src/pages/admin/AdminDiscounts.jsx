import { useState, useEffect } from "react";
import { productsAPI } from "../../api";
import toast from "react-hot-toast";
import "./AdminDiscounts.css";

export default function AdminDiscounts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [discountType, setDiscountType] = useState("Percentage");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ page: 1, pageSize: 100 });
      setProducts(res.data?.items || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const original = Number(selected?.originalPrice || 0);
  const discountVal = Number(value) || 0;
  const finalPrice = discountType === "Percentage"
    ? original - (original * discountVal) / 100
    : original - discountVal;
  const discountPercent = discountType === "Percentage"
    ? discountVal
    : original > 0 ? Math.round((discountVal / original) * 100) : 0;

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      toast.error("Please wait before trying again");
      return;
    }
    if (!selected) return toast.error("Select a product first");
    if (!value || discountVal <= 0) return toast.error("Enter a valid discount");
    if (discountType === "Percentage" && discountVal > 100) return toast.error("Cannot exceed 100%");
    if (discountType === "Fixed" && discountVal >= original) return toast.error("Discount cannot exceed price");

    setSubmitting(true);
    setLastSubmitTime(now);
    try {
      await productsAPI.applyDiscount({
        productId: selected.id,
        discountPercentage: discountPercent,
      });
      toast.success(`${discountPercent}% discount applied to ${selected.name}!`);
      setSelected(null);
      setValue("");
      await fetchProducts();
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Rate limit hit. Wait 2–3 minutes.");
      } else {
        toast.error(err.response?.data?.message || "Failed to apply discount");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adis">
      {/* Header */}
      <div className="adis__header">
        <div>
          <h1 className="adis__title">Discounts</h1>
          <p className="adis__sub">Apply promotional pricing to your products</p>
        </div>
        <div className="adis__stats">
          <div className="adis__stat">
            <span className="adis__stat-val">
              {products.filter(p => p.discountApplied).length}
            </span>
            <span className="adis__stat-label">On Sale</span>
          </div>
          <div className="adis__stat">
            <span className="adis__stat-val">{products.length}</span>
            <span className="adis__stat-label">Products</span>
          </div>
        </div>
      </div>

      <div className="adis__body">
        {/* LEFT — Product picker */}
        <div className="adis__left">
          <div className="adis__search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adis__search"
            />
          </div>

          <div className="adis__list">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="adis__skel" />
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="adis__empty">No products found</div>
            ) : (
              filteredProducts.map(p => {
                const isSelected = selected?.id === p.id;
                const hasDiscount = p.discountApplied && p.finalPrice < p.originalPrice;
                const pct = hasDiscount
                  ? Math.round(((p.originalPrice - p.finalPrice) / p.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={p.id}
                    className={`adis__item ${isSelected ? "active" : ""}`}
                    onClick={() => { setSelected(p); setValue(""); }}
                  >
                    <div className="adis__item-img">
                      <img
                        src={p.frontImageUrl || "/product1.png"}
                        alt={p.name}
                        onError={e => { e.target.src = "/product1.png"; }}
                      />
                      {hasDiscount && (
                        <span className="adis__item-badge">-{pct}%</span>
                      )}
                    </div>
                    <div className="adis__item-info">
                      <div className="adis__item-name">{p.name}</div>
                      <div className="adis__item-price">
                        {hasDiscount ? (
                          <>
                            <span className="adis__price-final">₦{Number(p.finalPrice).toLocaleString()}</span>
                            <span className="adis__price-original">₦{Number(p.originalPrice).toLocaleString()}</span>
                          </>
                        ) : (
                          <span>₦{Number(p.originalPrice || 0).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="adis__item-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT — Discount form */}
        <div className="adis__right">
          {!selected ? (
            <div className="adis__placeholder">
              <div className="adis__placeholder-icon">🏷️</div>
              <h3>Select a product</h3>
              <p>Choose a product from the left to configure its discount</p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="adis__form">
              {/* Selected product preview */}
              <div className="adis__preview">
                <img
                  src={selected.frontImageUrl || "/product1.png"}
                  alt={selected.name}
                  onError={e => { e.target.src = "/product1.png"; }}
                />
                <div>
                  <div className="adis__preview-name">{selected.name}</div>
                  <div className="adis__preview-price">
                    ₦{Number(selected.originalPrice || 0).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  className="adis__preview-clear"
                  onClick={() => setSelected(null)}
                >×</button>
              </div>

              {/* Type toggle */}
              <div className="adis__section-label">Discount Type</div>
              <div className="adis__toggle">
                <button
                  type="button"
                  className={`adis__toggle-btn ${discountType === "Percentage" ? "active" : ""}`}
                  onClick={() => { setDiscountType("Percentage"); setValue(""); }}
                >
                  <span>%</span> Percentage
                </button>
                <button
                  type="button"
                  className={`adis__toggle-btn ${discountType === "Fixed" ? "active" : ""}`}
                  onClick={() => { setDiscountType("Fixed"); setValue(""); }}
                >
                  <span>₦</span> Fixed Amount
                </button>
              </div>

              {/* Value input */}
              <div className="adis__section-label">
                {discountType === "Percentage" ? "Discount Percentage" : "Discount Amount (₦)"}
              </div>
              <div className="adis__input-wrap">
                <span className="adis__input-prefix">
                  {discountType === "Percentage" ? "%" : "₦"}
                </span>
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={discountType === "Percentage" ? "e.g. 20" : "e.g. 500"}
                  min="1"
                  max={discountType === "Percentage" ? "99" : original - 1}
                  className="adis__input"
                  disabled={submitting}
                />
              </div>

              {/* Live preview */}
              {value && discountVal > 0 && (
                <div className="adis__calc">
                  <div className="adis__calc-row">
                    <span>Original Price</span>
                    <span>₦{original.toLocaleString()}</span>
                  </div>
                  <div className="adis__calc-row adis__calc-row--discount">
                    <span>Discount ({discountPercent}%)</span>
                    <span>−₦{(original - Math.max(0, finalPrice)).toLocaleString()}</span>
                  </div>
                  <div className="adis__calc-divider" />
                  <div className="adis__calc-row adis__calc-row--total">
                    <span>Final Price</span>
                    <span>₦{Math.max(0, finalPrice).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="adis__submit"
                disabled={submitting || !value}
              >
                {submitting ? (
                  <span className="adis__spinner" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Apply Discount
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}