import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { productsAPI } from "../api";
import "./ProductDetails.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getById(id);
      const apiProduct = response.data || response;
      
      // ✅ Only use REAL data from API - no fake fallbacks
      const normalized = {
        id: apiProduct.id,
        name: apiProduct.name || "Product",
        description: apiProduct.description || "",
        price: Number(apiProduct.finalPrice ?? apiProduct.originalPrice ?? 0),
        originalPrice: Number(apiProduct.originalPrice ?? 0),
        hasDiscount: apiProduct.hasDiscount || apiProduct.discountApplied,
        stockQuantity: apiProduct.stockQuantity ?? 0,
        isAvailable: apiProduct.isAvailable !== false,
        // ✅ Only include images that actually exist
        images: [
          apiProduct.frontImageUrl,
          apiProduct.backImageUrl,
          apiProduct.sideImageUrl,
        ].filter(Boolean), // removes null/undefined
      };
      
      setProduct(normalized);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Failed to load product. It may have been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantity = (delta) => {
    setQuantity((q) => {
      const newQty = q + delta;
      if (newQty < 1) return 1;
      if (product?.stockQuantity && newQty > product.stockQuantity) return product.stockQuantity;
      return newQty;
    });
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      // Toast handled by CartContext
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate("/cart"), 300);
  };

  // Loading state
  if (loading) {
    return (
      <div className="nl-detail-page">
        <div className="container">
          <div className="nl-detail-skeleton">Loading product...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="nl-detail-page">
        <div className="container">
          <div className="nl-detail-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" width="64" height="64">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2>Product Not Found</h2>
            <p>{error || "This product doesn't exist or has been removed."}</p>
            <button className="btn nl-btn" onClick={() => navigate("/products")}>
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const outOfStock = !product.isAvailable || product.stockQuantity <= 0;
  const hasImages = product.images.length > 0;

  return (
    <div className="nl-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="nl-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li className="active">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* LEFT: Gallery */}
          <div className="col-12 col-lg-7">
           <div className="nl-gallery">
  {/* Thumbnails with labels - shows even for 1 image (as a preview) */}
  {hasImages && (
    <div className="nl-thumbs">
      {product.images.map((img, i) => {
        const labels = ["Front", "Back", "Side"];
        return (
          <button
            key={i}
            className={`nl-thumb ${selectedImage === i ? 'active' : ''}`}
            onClick={() => setSelectedImage(i)}
            aria-label={`View ${labels[i] || `image ${i + 1}`}`}
            title={labels[i] || `Image ${i + 1}`}
          >
            <img src={img} alt={`${product.name} ${labels[i] || `view ${i + 1}`}`} />
            <span className="nl-thumb__label">{labels[i]}</span>
          </button>
        );
      })}
    </div>
  )}

              {/* Main Image */}
              <div className="nl-main-image">
                {hasImages ? (
                  <img src={product.images[selectedImage]} alt={product.name} />
                ) : (
                  <div className="nl-no-image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>No image available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="col-12 col-lg-5">
            <div className="nl-product-detail">
              <h1 className="nl-detail-name">{product.name}</h1>
              
              <div className="nl-detail-price-row">
                <div className="nl-detail-price">₦{product.price.toLocaleString()}</div>
                {product.hasDiscount && product.originalPrice > product.price && (
                  <div className="nl-detail-price-old">
                    ₦{product.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Stock indicator */}
              <div className="nl-stock-status">
                {outOfStock ? (
                  <span className="nl-stock-out">Out of Stock</span>
                ) : product.stockQuantity <= 5 ? (
                  <span className="nl-stock-low">Only {product.stockQuantity} left!</span>
                ) : (
                  <span className="nl-stock-in">In Stock ({product.stockQuantity} available)</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="nl-detail-desc">{product.description}</p>
              )}

              {/* Quantity */}
              <div className="nl-detail-block">
                <label className="nl-detail-label">Quantity:</label>
                <div className="nl-qty">
                  <button 
                    onClick={() => handleQuantity(-1)} 
                    disabled={quantity === 1 || outOfStock}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => handleQuantity(1)}
                    disabled={outOfStock || quantity >= product.stockQuantity}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="nl-detail-actions">
                <button 
                  className={`btn nl-btn-add ${addedToCart ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                >
                  {outOfStock ? (
                    "Out of Stock"
                  ) : addedToCart ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      Add to Cart
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                    </>
                  )}
                </button>
                <button 
                  className="btn nl-btn-buy" 
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                >
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="nl-trust-row">
                <div className="nl-trust-mini">
                  <div className="nl-trust-mini__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M8 12l3 3 5-6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="nl-trust-mini__title">Premium Quality</div>
                    <div className="nl-trust-mini__sub">Made to last</div>
                  </div>
                </div>

                <div className="nl-trust-mini">
                  <div className="nl-trust-mini__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
                      <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"/>
                      <polyline points="12 7 12 12 15 15"/>
                    </svg>
                  </div>
                  <div>
                    <div className="nl-trust-mini__title">Easy Returns</div>
                    <div className="nl-trust-mini__sub">7-day return policy</div>
                  </div>
                </div>

                <div className="nl-trust-mini">
                  <div className="nl-trust-mini__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
                      <rect x="1" y="6" width="14" height="11" rx="1"/>
                      <path d="M15 9h4l3 3v5h-7V9z"/>
                      <circle cx="6" cy="19" r="2"/>
                      <circle cx="18" cy="19" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="nl-trust-mini__title">Fast Delivery</div>
                    <div className="nl-trust-mini__sub">Quick & reliable</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}