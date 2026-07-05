import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Footer.css";

const SHOP_LINKS = [
  { label: "All Products", path: "/products" },
  { label: "Hijabs", path: "/products?category=hijabs" },
  { label: "Abayas", path: "/products?category=abayas" },
  { label: "Accessories", path: "/products?category=accessories" },
  { label: "Gift Packages", path: "/products?category=gift-packages" },
];

const ACCOUNT_LINKS = [
  { label: "Sign In", path: "/login" },
  { label: "Register", path: "/register" },
  { label: "My Orders", path: "/orders" },
  { label: "Cart", path: "/cart" },
  { label: "Wishlist", path: "/wishlist" },
];

const COMPANY_LINKS = [
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Returns & Shipping", path: "/returns" },
];

const SOCIAL_LINKS = [
  { 
    label: "Instagram", 
    url: "https://instagram.com/noorlayers.ng",
    d: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2C5.2 4 4 5.2 4 7.6v8.8C4 18.8 5.2 20 7.6 20h8.8c2.4 0 3.6-1.2 3.6-3.6V7.6C20 5.2 18.8 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" 
  },
  { 
    label: "WhatsApp", 
    url: "https://wa.me/2348120970774",
    d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" 
  },
  { 
    label: "TikTok", 
    url: "https://tiktok.com/@Noor_Layers",
    d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" 
  },
  { 
    label: "Facebook", 
    url: "https://facebook.com/noorlayers",
    d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" 
  },
];

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="nl-footer">
      {/* Newsletter Strip */}
      <div className="nl-footer-newsletter">
        <div className="container">
          <div className="nl-footer-newsletter__inner">
            <div className="nl-footer-newsletter__text">
              <h3>Stay in the loop</h3>
              <p>Subscribe to get exclusive offers and the latest collections delivered to your inbox.</p>
            </div>
            
            {subscribed ? (
              <div className="nl-footer-newsletter__ok">
                ✦ You're subscribed! Check your inbox.
              </div>
            ) : (
              <form className="nl-footer-newsletter__form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">
                  Subscribe
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="nl-footer-main">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* Brand Column */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="nl-footer-brand" onClick={() => navigate("/")}>
                <div className="nl-footer-logo">
                  <svg viewBox="0 0 56 56" width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 4 L48 12 L48 32 Q48 46 28 52 Q8 46 8 32 L8 12 Z"
                      fill="none" stroke="#E8920A" strokeWidth="1.5"/>
                    <path d="M28 8 L44 15 L44 32 Q44 43 28 48 Q12 43 12 32 L12 15 Z"
                      fill="none" stroke="#E8920A" strokeWidth="0.8" opacity="0.5"/>
                    <path d="M14 20 Q10 18 11 14 Q13 16 14 20Z M14 26 Q9 24 10 19 Q12 21 14 26Z M14 32 Q9 30 11 25 Q13 27 14 32Z"
                      fill="#E8920A" opacity="0.9"/>
                    <path d="M42 20 Q46 18 45 14 Q43 16 42 20Z M42 26 Q47 24 46 19 Q44 21 42 26Z M42 32 Q47 30 45 25 Q43 27 42 32Z"
                      fill="#E8920A" opacity="0.9"/>
                    <text x="28" y="34" textAnchor="middle" fill="#E8920A"
                      fontFamily="Cormorant Garamond, serif" fontWeight="700" fontSize="18"
                      letterSpacing="1">NL</text>
                  </svg>
                </div>
                <div className="nl-footer-brand__text">
                  <div className="nl-footer-brand__name">Noor Layers</div>
                  <div className="nl-footer-brand__tag">wear your light</div>
                </div>
              </div>

              <p className="nl-footer-desc">
                Modest fashion and accessories designed to help you wear your light with 
                confidence. Crafted with love, made to last.
              </p>

              {/* Contact Info */}
              <div className="nl-footer-contact">
                <a href="mailto:support@noorlayers.com" className="nl-footer-contact__item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  noorlayers@gmail.com
                </a>
                <a href="tel:+2348120970774" className="nl-footer-contact__item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  +234 812 097 0774
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div className="col-6 col-md-3 col-lg-2">
              <h4 className="nl-footer-title">Shop</h4>
              <ul className="nl-footer-links">
                {SHOP_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Links */}
            <div className="col-6 col-md-3 col-lg-2">
              <h4 className="nl-footer-title">Account</h4>
              <ul className="nl-footer-links">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-12 col-md-6 col-lg-4">
              <h4 className="nl-footer-title">Company</h4>
              <ul className="nl-footer-links nl-footer-links--two-cols">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>

              {/* Social Icons */}
              <div className="nl-footer-social">
                <span>Follow us</span>
                <div className="nl-footer-social__icons">
                  {SOCIAL_LINKS.map((s) => (
                    <a 
                      key={s.label} 
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="nl-footer-social__icon"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                        <path d={s.d}/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="nl-footer-bottom">
        <div className="container">
          <div className="nl-footer-bottom__inner">
            <div className="nl-footer-copyright">
              © {currentYear} <strong>Noor Layers</strong>. All rights reserved.
            </div>

            {/* Payment Methods */}
            <div className="nl-footer-payments">
              <span>We accept:</span>
              <div className="nl-footer-payments__icons">
                {/* Visa */}
                <div className="nl-pay-icon" title="Visa">
                  <svg viewBox="0 0 38 24" width="32" height="20" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                    <text x="19" y="16" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Arial">VISA</text>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="nl-pay-icon" title="Mastercard">
                  <svg viewBox="0 0 38 24" width="32" height="20" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#fff" stroke="#E5E5E5"/>
                    <circle cx="15" cy="12" r="6" fill="#EB001B"/>
                    <circle cx="23" cy="12" r="6" fill="#F79E1B" opacity="0.85"/>
                  </svg>
                </div>
                {/* Verve */}
                <div className="nl-pay-icon" title="Verve">
                  <svg viewBox="0 0 38 24" width="32" height="20" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#00425F"/>
                    <text x="19" y="16" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Arial">VERVE</text>
                  </svg>
                </div>
                {/* Paystack */}
                <div className="nl-pay-icon" title="Paystack">
                  <svg viewBox="0 0 38 24" width="32" height="20" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#0BA4DB"/>
                    <text x="19" y="16" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="700" fontFamily="Arial">PAYSTACK</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}