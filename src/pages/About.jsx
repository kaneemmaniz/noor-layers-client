import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./About.css";

const VALUES = [
  {
    title: "Timeless Design",
    desc: "Crafted to transcend trends, our pieces remain elegant season after season.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: "Premium Quality",
    desc: "Only the finest fabrics, carefully sourced and crafted to last beautifully.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
        <path d="M12 2L9 9 2 9.5l5.5 5L6 22l6-3 6 3-1.5-7.5L22 9.5 15 9z"/>
      </svg>
    ),
  },
  {
    title: "Made with Purpose",
    desc: "Every stitch celebrates modesty as radiance — confidence in every layer.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
  {
    title: "Loved by Thousands",
    desc: "Joining a community of 10,000+ women who wear their light with grace.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

const MILESTONES = [
  { year: "2025", label: "Brand Founded" },
  { year: "1k+", label: "Happy Customers" },
  { year: "100+", label: "Unique Designs" },
  { year: "10+", label: "Countries Served" },
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

export default function About() {
  const navigate = useNavigate();
  const [storyRef, storyVis] = useReveal();
  const [valuesRef, valuesVis] = useReveal();
  const [milestonesRef, milestonesVis] = useReveal();

  return (
    <div className="nl-about-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="nl-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li className="active">About Us</li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className="nl-h1 mb-5">About Us</h1>

        {/* ═══ STORY SECTION ═══ */}
        <section className="nl-about-story" ref={storyRef}>
          <div className={`row align-items-center g-5 ${storyVis ? 'nl-in' : 'nl-out'}`}>
            {/* LEFT: Story Text */}
            <div className="col-12 col-lg-6">
              <div className="nl-eyebrow">OUR STORY</div>
              <div className="nl-eyebrow__divider" />

              <h2 className="nl-about-heading">
                Designed to help you<br />
                wear <em>your light</em> with<br />
                confidence.
              </h2>

              <div className="nl-about-text">
                <p>
                  Noor Layers was born from a simple belief: modesty isn't 
                  about limits, it's about light.
                </p>
                <p>
                  We create timeless pieces that reflect beauty, simplicity, 
                  and purpose. Every item is thoughtfully designed to help 
                  you feel confident, comfortable, and effortlessly you.
                </p>
                <p>
                  From the softest chiffon hijabs to flowing abayas, every 
                  stitch tells a story of craftsmanship and care. We believe 
                  that what you wear should empower you to shine — not 
                  conform.
                </p>
              </div>

              <button className="btn nl-btn mt-3" onClick={() => navigate("/products")}>
                Explore Our Collection
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>

            {/* RIGHT: Model Image */}
            <div className="col-12 col-lg-6">
              <div className="nl-about-image">
                <div className="nl-about-image__halo" aria-hidden="true" />
                <div className="nl-about-image__frame">
                  <img src="/hero.png" alt="Noor Layers model" />
                </div>
                
                {/* Botanical accent */}
                <div className="nl-about-image__leaf" aria-hidden="true">
                  <svg viewBox="0 0 100 200" width="80" height="160">
                    <path d="M50 200 Q40 150 30 100 Q20 50 50 5" stroke="#C9B89A" strokeWidth="1" fill="none" opacity="0.5"/>
                    <ellipse cx="35" cy="60" rx="20" ry="8" transform="rotate(-30 35 60)" fill="#C9B89A" opacity="0.4"/>
                    <ellipse cx="45" cy="100" rx="22" ry="9" transform="rotate(20 45 100)" fill="#C9B89A" opacity="0.4"/>
                    <ellipse cx="32" cy="140" rx="20" ry="8" transform="rotate(-25 32 140)" fill="#C9B89A" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ VALUES SECTION ═══ */}
        <section className="nl-values" ref={valuesRef}>
          <div className="text-center mb-5">
            <div className="nl-eyebrow">WHAT WE STAND FOR</div>
            <h2 className="nl-h2 mt-2">Our <em>core values.</em></h2>
          </div>

          <div className={`nl-values-grid ${valuesVis ? 'nl-in' : 'nl-out'}`}>
            {VALUES.map((v, i) => (
              <div 
                key={v.title} 
                className="nl-value-card"
                style={{ '--delay': `${i * 100}ms` }}
              >
                <div className="nl-value-card__icon">
                  {v.icon}
                </div>
                <h3 className="nl-value-card__title">{v.title}</h3>
                <p className="nl-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ MILESTONES SECTION ═══ */}
        <section className="nl-milestones" ref={milestonesRef}>
          <div className={`nl-milestones-card ${milestonesVis ? 'nl-in' : 'nl-out'}`}>
            <div className="nl-milestones-text">
              <div className="nl-eyebrow">OUR JOURNEY</div>
              <h2 className="nl-h2 mt-2">
                Growing together,<br />
                <em>one story at a time.</em>
              </h2>
              <p className="nl-about-text mt-3">
                From a small idea to a global community of women who 
                believe in modest elegance, our journey continues to inspire.
              </p>
            </div>

            <div className="nl-milestones-grid">
              {MILESTONES.map((m) => (
                <div key={m.label} className="nl-milestone">
                  <div className="nl-milestone__year">{m.year}</div>
                  <div className="nl-milestone__label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA SECTION ═══ */}
        <section className="nl-about-cta">
          <div className="nl-cta-card">
            <h2 className="nl-h2">
              Ready to <em>wear your light?</em>
            </h2>
            <p>Join thousands of women embracing modest elegance every day.</p>
            <div className="nl-cta-buttons">
              <button className="btn nl-btn" onClick={() => navigate("/products")}>
                Shop Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button className="btn nl-btn-outline" onClick={() => navigate("/contact")}>
                Get in Touch
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}