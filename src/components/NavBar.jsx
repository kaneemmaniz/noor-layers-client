import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import SearchBar from "./SearchBar";
import "./NavBar.css";

// ✅ Fixed: All items must be { label, path } objects
const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Orders", path: "/orders" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "My Account", path: "/profile" },  // ✅ Added properly
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  // Detect scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Active link checker
  const active = (p) => (p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  // Filter nav links - hide "My Account" and "Orders" if not authenticated
  const visibleNavLinks = NAV_LINKS.filter(link => {
    if (!isAuthenticated && (link.path === "/profile" || link.path === "/orders")) {
      return false;
    }
    return true;
  });

  // Logo SVG
  const LogoIcon = () => (
    <svg viewBox="0 0 56 56" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 4 L48 12 L48 32 Q48 46 28 52 Q8 46 8 32 L8 12 Z"
        fill="none" stroke="#E8920A" strokeWidth="1.4" />
      <path d="M28 8 L44 15 L44 32 Q44 43 28 48 Q12 43 12 32 L12 15 Z"
        fill="none" stroke="#E8920A" strokeWidth="0.8" opacity="0.5" />
      <path d="M14 20 Q10 18 11 14 Q13 16 14 20Z M14 26 Q9 24 10 19 Q12 21 14 26Z M14 32 Q9 30 11 25 Q13 27 14 32Z"
        fill="#E8920A" opacity="0.9" />
      <path d="M42 20 Q46 18 45 14 Q43 16 42 20Z M42 26 Q47 24 46 19 Q44 21 42 26Z M42 32 Q47 30 45 25 Q43 27 42 32Z"
        fill="#E8920A" opacity="0.9" />
      <text x="28" y="33" textAnchor="middle" fill="#E8920A"
        fontFamily="Cormorant Garamond, serif" fontWeight="700" fontSize="16"
        letterSpacing="1">NL</text>
    </svg>
  );

  return (
    <>
      {/* ═══════════════ MAIN NAVBAR ═══════════════ */}
      <nav className={`nb ${scrolled ? "nb--scrolled" : ""}`}>
        {/* LOGO */}
        <div className="nb__logo" onClick={() => navigate("/")}>
          <LogoIcon />
          <div className="nb__logo-words">
            <span className="nb__brand">Noor Layers</span>
            <span className="nb__tag">WEAR YOUR LIGHT</span>
          </div>
        </div>

        {/* NAV LINKS (Desktop) */}
        <ul className="nb__links">
          {visibleNavLinks.map(({ label, path }) => (
            <li key={path}>
              <Link
                to={path}
                className={`nb__link ${active(path) ? "nb__link--active" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Admin link — only for admins */}
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`nb__link nb__link--admin ${active("/admin") ? "nb__link--active" : ""}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" style={{ marginRight: "4px", verticalAlign: "middle" }}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* RIGHT ACTIONS */}
        <div className="nb__actions">
          {/* SEARCH BUTTON */}
          <button
            className="nb__icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="19" height="19">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* CART BUTTON */}
          <button
            className="nb__icon"
            onClick={() => navigate("/cart")}
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="19" height="19">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <span className="nb__badge">{cartCount}</span>}
          </button>

          {/* ACCOUNT BUTTON — Goes to profile if logged in, login if not */}
          <button
            className="nb__icon"
            onClick={() => navigate(isAuthenticated ? "/profile" : "/login")}
            aria-label="Account"
            title={isAuthenticated ? "My Profile" : "Login"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="19" height="19">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* CTA BUTTON */}
          {isAuthenticated ? (
            <button className="btn-gold nb__cta" onClick={logout}>Sign Out</button>
          ) : (
            <button className="btn-gold nb__cta" onClick={() => navigate("/login")}>Shop Now</button>
          )}

          {/* MOBILE BURGER */}
          <button
            className="nb__burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className={menuOpen ? "x" : ""} />
            <span className={menuOpen ? "x" : ""} />
            <span className={menuOpen ? "x" : ""} />
          </button>
        </div>
      </nav>

      {/* ═══════════════ MOBILE DRAWER ═══════════════ */}
      <div className={`nb__drawer ${menuOpen ? "nb__drawer--open" : ""}`}>
        {visibleNavLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`nb__drawer-link ${active(path) ? "active" : ""}`}
          >
            {label}
          </Link>
        ))}

        {/* Admin link in mobile drawer */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`nb__drawer-link nb__drawer-link--admin ${active("/admin") ? "active" : ""}`}
          >
            ⚙️ Admin Dashboard
          </Link>
        )}

        <div className="nb__drawer-foot">
          <button
            className="nb__drawer-row"
            onClick={() => {
              setSearchOpen(true);
              setMenuOpen(false);
            }}
          >
            🔍 Search Products
          </button>

          <button
            className="nb__drawer-row"
            onClick={() => {
              navigate("/cart");
              setMenuOpen(false);
            }}
          >
            🛍 Cart {cartCount > 0 && `(${cartCount})`}
          </button>

          {isAuthenticated ? (
            <button
              className="btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={logout}
            >
              Sign Out
            </button>
          ) : (
            <button
              className="btn-gold"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════ SEARCH MODAL ═══════════════ */}
      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}