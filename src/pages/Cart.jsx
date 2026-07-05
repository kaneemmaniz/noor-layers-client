import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    loading,
    updatingIds = new Set(),
  } = useCart() || {};

  const items = cartItems.map((item) => ({
    id: item.id || item.productId,
    productId: item.productId || item.id,
    name: item.name || item.productName || "Product",
    price: Number(item.price || item.finalPrice || item.unitPrice || 0),
    quantity: item.quantity || 1,
    image: item.image || item.frontImageUrl || item.imageUrl || "/product1.png",
    selectedColor: item.selectedColor,
  }));

  const handleQuantity = (productId, delta, currentQty) => {
    const newQty = Math.max(1, currentQty + delta);
    if (newQty === currentQty) return;
    updateQuantity(productId, newQty);
  };

  // No window.confirm — just remove directly
  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading && items.length === 0) {
    return (
      <div className="nl-cart-page">
        <div className="container">
          <div style={{ padding: "4rem 0", textAlign: "center", color: "#8B7355" }}>
            Loading your cart...
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="nl-cart-page">
        <div className="container">
          <nav className="nl-breadcrumb"><ol>
            <li><Link to="/">Home</Link></li>
            <li className="active">Cart</li>
          </ol></nav>
          <div className="nl-cart-empty">
            <div className="nl-cart-empty__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="80" height="80">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button className="btn nl-btn" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nl-cart-page">
      <div className="container">
        <nav className="nl-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li className="active">Cart</li>
          </ol>
        </nav>

        <h1 className="nl-h1 mb-4">
          Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>

        <div className="nl-cart-layout">
          {/* ── LEFT: Items ── */}
          <div className="nl-cart-items">
            <div className="nl-cart-table">
              <div className="nl-cart-table__head">
                <div>Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
                <div></div>
              </div>

              {items.map((item) => {
                const isUpdating = updatingIds.has(item.productId);
                return (
                  <div key={item.id} className={`nl-cart-row${isUpdating ? " syncing" : ""}`}>
                    {/* Product */}
                    <div className="nl-cart-product">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => { e.target.src = "/product1.png"; }}
                      />
                      <div>
                        <div className="nl-cart-name">{item.name}</div>
                        {item.selectedColor && (
                          <div className="nl-cart-variant">Color: {item.selectedColor.name}</div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="nl-cart-price">₦{item.price.toLocaleString()}</div>

                    {/* Quantity */}
                    <div className="nl-cart-qty">
                      <button
                        onClick={() => handleQuantity(item.productId, -1, item.quantity)}
                        disabled={item.quantity <= 1 || isUpdating}
                        aria-label="Decrease"
                      >−</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.productId, 1, item.quantity)}
                        disabled={isUpdating}
                        aria-label="Increase"
                      >+</button>
                    </div>

                    {/* Total */}
                    <div className="nl-cart-total">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>

                    {/* Remove */}
                    <div className="nl-cart-remove">
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={isUpdating}
                        aria-label="Remove item"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="nl-continue" onClick={() => navigate("/products")}>
              ← Continue Shopping
            </button>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="nl-summary">
            <h3 className="nl-summary__title">Order Summary</h3>
            <div className="nl-summary__row">
              <span>Subtotal</span>
              <span className="nl-summary__val">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="nl-summary__row">
              <span>Shipping</span>
              <span className="nl-summary__shipping">Calculated at checkout</span>
            </div>
            <div className="nl-summary__divider" />
            <div className="nl-summary__total">
              <span>Total</span>
              <span className="nl-summary__total-val">₦{subtotal.toLocaleString()}</span>
            </div>
            <button className="btn nl-btn-checkout" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}