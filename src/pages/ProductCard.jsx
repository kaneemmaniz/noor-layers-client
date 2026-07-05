import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import ProductBadges from "../components/ProductBadges";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // ✅ Only use REAL uploaded images - no fallbacks
  const img = product.frontImageUrl;

  const hasDiscount = product.discountApplied && product.finalPrice < product.originalPrice;

  // Check if category is a UUID (hide it if so)
  const rawCategory = product.category || "";
  const isUUID = rawCategory.length > 20 && rawCategory.includes('-');
  const showCategory = rawCategory && !isUUID;

  const handleCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    try { await addToCart(product, 1); } catch {}
  };

  return (
    <div className="pc" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="pc__img">
        {img ? (
          <img src={img} alt={product.name} loading="lazy" />
        ) : (
          <div className="pc__no-image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <span>No image</span>
          </div>
        )}
        
        <div className="pc__overlay">
          <button className="pc__add" onClick={handleCart}>Add to Cart</button>
          <button className="pc__view"
            onClick={e => { e.stopPropagation(); navigate(`/products/${product.id}`); }}>
            View Details
          </button>
        </div>

        <ProductBadges product={product} position="top-left" />
      </div>

      <div className="pc__info">
        {showCategory && <span className="pc__cat">{rawCategory}</span>}
        <h3 className="pc__name">{product.name}</h3>
        <div className="pc__prices">
          {hasDiscount ? (
            <>
              <span className="pc__price pc__price--final">
                ₦{product.finalPrice?.toLocaleString()}
              </span>
              <span className="pc__price pc__price--original">
                ₦{product.originalPrice?.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="pc__price">
              ₦{(product.originalPrice || product.price)?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}