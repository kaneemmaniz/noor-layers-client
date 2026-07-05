import "./ProductBadges.css";

/**
 * Smart product badges component.
 * Automatically detects which badges to show based on product data.
 * 
 * @param {object} product - Product object from API
 * @param {string} position - "top-left" | "top-right" | "stack"
 */
export default function ProductBadges({ product, position = "top-left" }) {
  const badges = [];

  // ─── 1. OUT OF STOCK (highest priority) ───
  const stock = product.stockQuantity ?? 0;
  const isAvailable = product.isAvailable !== false;
  
  if (!isAvailable || stock <= 0) {
    badges.push({
      type: "soldout",
      label: "Sold Out",
      icon: "⊘",
    });
  }
  
  // ─── 2. SALE / DISCOUNT (Smart detection) ───
const originalPriceNum = Number(product.originalPrice || 0);
const finalPriceNum = Number(product.finalPrice || 0);

// Detect discount from any signal:
const hasRealPriceDiff = 
  originalPriceNum > 0 && 
  finalPriceNum > 0 && 
  finalPriceNum < originalPriceNum;

const isExplicitlyDiscounted = 
  product.discountApplied === true ||
  product.isOnSale === true ||
  product.hasDiscount === true;

const isSoldOut = badges.find((b) => b.type === "soldout");

if (!isSoldOut && (hasRealPriceDiff || isExplicitlyDiscounted)) {
  const discount = originalPriceNum > 0 && finalPriceNum > 0
    ? Math.round(((originalPriceNum - finalPriceNum) / originalPriceNum) * 100)
    : 0;

  badges.push({
    type: "sale",
    label: discount > 0 ? `-${discount}%` : "SALE",
    icon: "🏷️",
  });
}
  
  // ─── 3. LOW STOCK (when not sold out) ───
  if (isAvailable && stock > 0 && stock <= 3) {
    badges.push({
      type: "low-stock",
      label: stock === 1 ? "Last One!" : `Only ${stock} left`,
      icon: "⚡",
    });
  }
  
  // ─── 4. NEW (created within last 14 days) ───
  if (product.createdAt) {
    try {
      const created = new Date(product.createdAt);
      const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld <= 14) {
        badges.push({
          type: "new",
          label: "New",
          icon: "✨",
        });
      }
    } catch {}
  }
  
  // ─── 5. BESTSELLER (manual flag) ───
  if (product.isBestseller || product.bestseller) {
    badges.push({
      type: "bestseller",
      label: "Bestseller",
      icon: "🏆",
    });
  }

  // ─── 6. FEATURED (manual flag) ───
  if (product.isFeatured || product.featured) {
    badges.push({
      type: "featured",
      label: "Featured",
      icon: "⭐",
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className={`nl-badges nl-badges--${position}`}>
      {badges.map((badge, i) => (
        <span 
          key={badge.type} 
          className={`nl-badge nl-badge--${badge.type}`}
          style={{ "--badge-delay": `${i * 100}ms` }}
        >
          <span className="nl-badge__icon">{badge.icon}</span>
          <span className="nl-badge__label">{badge.label}</span>
        </span>
      ))}
    </div>
  );
}