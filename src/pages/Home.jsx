import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../api";
import { useCart } from "../hooks/useCart";
import ProductBadges from "../components/ProductBadges";
import "./Home.css";

const TRUST_ITEMS = [
  {
    title: "Quality You Can Trust",
    desc: "Premium materials, made to last.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24">
        <circle cx="12" cy="12" r="9"/>
        <path d="M8 12l3 3 5-6"/>
      </svg>
    ),
  },
  {
    title: "Fast & Reliable Delivery",
    desc: "Quick and reliable delivery to your doorstep.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24">
        <rect x="1" y="6" width="14" height="11" rx="1"/>
        <path d="M15 9h4l3 3v5h-7V9z"/>
        <circle cx="6" cy="19" r="2"/>
        <circle cx="18" cy="19" r="2"/>
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    desc: "Safe and secure checkout experience.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24">
        <rect x="4" y="11" width="16" height="10" rx="2"/>
        <path d="M8 11V7a4 4 0 018 0v4"/>
      </svg>
    ),
  },
  {
    title: "Customer Support",
    desc: "We're here to help you, anytime.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="24" height="24">
        <path d="M3 14v-2a9 9 0 0118 0v2"/>
        <path d="M21 14v3a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2zM3 14v3a2 2 0 002 2h1v-7H5a2 2 0 00-2 2z"/>
      </svg>
    ),
  },
];

const MARQUEE_WORDS = [
  "Premium Hijabs",
  "Modest Abayas",
  "Jersey Sets",
  "Gift Boxes",
  "New Arrivals",
  "Free Returns",
  "Worldwide Shipping",
];


function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function HomeCard({ product, delay }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [ref, vis] = useReveal();

  const id = product.id;
  const name = product.name || "Product";
  const finalPrice = Number(product.finalPrice ?? product.originalPrice ?? product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? finalPrice);
  const hasDiscount = product.discountApplied && originalPrice > finalPrice;
  const stock = product.stockQuantity ?? 999;
  const isAvailable = product.isAvailable !== false;
  const outOfStock = !isAvailable || stock <= 0;

  // Hide category if it's a UUID
  const rawCategory = product.category || "";
  const isUUID = rawCategory.length > 20 && rawCategory.includes('-');
  const category = isUUID ? "" : rawCategory;

  // ✅ ONLY use the real uploaded image - NO fallbacks
  const image = product.frontImageUrl;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div
      ref={ref}
      className={`hcard ${vis ? "hcard--in" : ""} ${outOfStock ? "hcard--soldout" : ""}`}
      style={{ "--d": `${delay}ms` }}
      onClick={() => navigate(`/products/${id}`)}
    >
      <div className="hcard__img-wrap">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="hcard__img"
          />
        ) : (
          <div className="hcard__no-image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <span>No image</span>
          </div>
        )}

        {/* ✨ SMART BADGES */}
        <ProductBadges product={product} position="top-left" />

        {/* Sold Out Overlay */}
        {outOfStock && <div className="nl-product-soldout-overlay" />}

        <div className="hcard__overlay">
          <button
            className="hcard__quick-view"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${id}`);
            }}
          >
            Quick View
          </button>
        </div>

        <button
          className="hcard__cart-btn"
          onClick={handleAddToCart}
          aria-label="Add to cart"
          disabled={outOfStock}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </button>

        {category && <span className="hcard__tag">{category}</span>}
      </div>

      <div className="hcard__info">
        <h4>{name}</h4>
        <div className="hcard__price-row">
          <p className="hcard__price">₦{finalPrice.toLocaleString()}</p>
          {hasDiscount && (
            <p className="hcard__price-old">₦{originalPrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [collRef, collVis] = useReveal();

  const fetchHomeProducts = () => {
  productsAPI.getAll({ page: 1, pageSize: 4 })
    .then((r) => {
      const items = r.data?.items || [];
      setProducts(items);
    })
    .catch(() => setProducts([]))
    .finally(() => setLoadingP(false));
};

useEffect(() => {
  fetchHomeProducts();
}, []);

// Auto-refresh when user returns to tab
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      fetchHomeProducts();
    }
  };

  window.addEventListener("focus", fetchHomeProducts);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    window.removeEventListener("focus", fetchHomeProducts);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shown = products;
  
  return (
    <div className="nl-home">

      {/* HERO */}
      <section className="nl-hero">
        {/* Botanical leaf shadow behind arch */}
        <div className="nl-hero__leaf" aria-hidden="true">
          <svg viewBox="0 0 200 500" width="200" height="500">
            <path d="M100 500 Q80 380 60 250 Q40 120 90 10" stroke="#C9B89A" strokeWidth="1.2" fill="none" opacity="0.4"/>
            <ellipse cx="65" cy="120" rx="38" ry="14" transform="rotate(-40 65 120)" fill="#C9B89A" opacity="0.35"/>
            <ellipse cx="85" cy="180" rx="42" ry="15" transform="rotate(25 85 180)" fill="#C9B89A" opacity="0.35"/>
            <ellipse cx="55" cy="240" rx="40" ry="14" transform="rotate(-30 55 240)" fill="#C9B89A" opacity="0.35"/>
            <ellipse cx="80" cy="305" rx="44" ry="15" transform="rotate(20 80 305)" fill="#C9B89A" opacity="0.35"/>
            <ellipse cx="55" cy="370" rx="36" ry="13" transform="rotate(-25 55 370)" fill="#C9B89A" opacity="0.35"/>
            <ellipse cx="80" cy="430" rx="32" ry="12" transform="rotate(15 80 430)" fill="#C9B89A" opacity="0.35"/>
          </svg>
        </div>

        <div className="container position-relative">
          <div className="row align-items-center g-4">
            {/* LEFT */}
            <div className="col-12 col-lg-5">
              <div className="nl-eyebrow d-flex align-items-center gap-3">
                <span>WEAR YOUR LIGHT</span>
              </div>
              <div className="nl-eyebrow__divider" />

              <h1 className="nl-hero__h1">
                Timeless elegance,<br />
                inspired by <em>you.</em>
              </h1>

              <p className="nl-hero__p">
                Modest fashion and accessories designed<br />
                to help you wear your light with confidence.
              </p>

              <button className="btn nl-btn nl-btn--lg mt-3" onClick={() => navigate("/products")}>
                Shop the Collection
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              <div className="nl-proof mt-4">
                <div className="nl-proof__avatars">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="nl-av" style={{ zIndex: 5-i }}>
                      <img src={`/avatar${i}.png`} alt="" onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = ['A','F','Z','K'][i-1];
                      }}/>
                    </div>
                  ))}
                </div>
                <div className="nl-proof__text">Join 10,000+ happy customers</div>
                <div className="nl-proof__rating">
                  <span className="nl-proof__stars">★★★★★</span>
                  <span className="nl-proof__score">4.9/5</span>
                </div>
              </div>
            </div>

            {/* CENTER — ARCH */}
            <div className="col-12 col-lg-5 d-flex justify-content-center">
              <div className="nl-arch-wrap">
                <div className="nl-arch__halo" aria-hidden="true" />
                <div className="nl-arch">
                  <img src="/hero.png" alt="Noor Layers model" />
                </div>
              </div>
            </div>

            {/* RIGHT — wear your light wordmark */}
            <div className="col-lg-2 d-none d-lg-flex flex-column align-items-center">
              <div className="nl-wordmark">
                <span className="nl-wordmark__star">✦</span>
                <span className="nl-wordmark__word">wear</span>
                <span className="nl-wordmark__word">your</span>
                <span className="nl-wordmark__word">light</span>
                <span className="nl-wordmark__divider" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="nl-trust-section">
        <div className="container">
          <div className="nl-trust-card">
            {TRUST_ITEMS.map((t) => (
              <div key={t.title} className="nl-trust-item">
                <div className="nl-trust-item__icon">{t.icon}</div>
                <div>
                  <div className="nl-trust-item__title">{t.title}</div>
                  <div className="nl-trust-item__desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="nl-marquee" aria-hidden="true">
        <div className="nl-marquee__track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="nl-marquee__group">
              <span className="nl-marquee__word">{w}</span>
              <span className="nl-marquee__star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* COLLECTION */}
      <section className="nl-collection" ref={collRef}>
        <div className="container">
          <div className={`row g-4 align-items-start ${collVis ? "nl-in" : "nl-out"}`}>
            {/* LEFT: Title + Button */}
            <div className="col-12 col-lg-3">
              <div className="nl-eyebrow">EXPLORE OUR COLLECTION</div>
              <h2 className="nl-h2 mt-2">
                Modest essentials,<br />
                <em>made beautifully.</em>
              </h2>
              <button
                className="btn nl-btn nl-btn--lg mt-4"
                onClick={() => navigate("/products")}
              >
                View All Products
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>

            <div className="col-12 col-lg-9">
  {loadingP ? (
    <div className="nl-products-grid">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="nl-skel" />)}
    </div>
  ) : shown.length === 0 ? (
    <div className="nl-empty-collection">
      <svg viewBox="0 0 24 24" fill="none" stroke="#E8920A" strokeWidth="1.5" width="64" height="64">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
      <h3>New collection coming soon</h3>
      <p>We're curating beautiful pieces just for you.</p>
    </div>
  ) : (
    <div className="nl-products-grid">
      {shown.map((p, i) => <HomeCard key={p.id} product={p} delay={i * 100} />)}
    </div>
  )}
</div>
          </div>
        </div>
      </section>


      {/* NEWSLETTER */}
      <section className="nl-newsletter">
        <div className="container">
          <div className="nl-news">
            <div className="nl-news__head">
              <div className="nl-news__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#E8920A" strokeWidth="1.5" width="22" height="22">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <div className="nl-news__t">Join the Noor Layers Community</div>
                <div className="nl-news__s">Be the first to know about new arrivals and exclusive offers.</div>
              </div>
            </div>

            {subbed ? (
              <div className="nl-news__ok">✦ You're in!</div>
            ) : (
              <form className="nl-news__form" onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubbed(true);
              }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn nl-btn" type="submit">
                  Subscribe
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            )}

            <div className="nl-news__social">
              <span>Follow us</span>
              {[
                { l:"IG", d:"M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2C5.2 4 4 5.2 4 7.6v8.8C4 18.8 5.2 20 7.6 20h8.8c2.4 0 3.6-1.2 3.6-3.6V7.6C20 5.2 18.8 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" },
                { l:"WA", d:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" },
                { l:"TK", d:"M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" },
                { l:"FB", d:"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
              ].map(({ l, d }) => (
                <a key={l} href="#" className="nl-soc" aria-label={l}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d={d}/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BACK TO TOP */}
      <button
        className={`nl-top ${showTop ? "nl-top--show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
      </button>
    </div>
  );
}