import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { ordersAPI, paymentsAPI } from "../api";  // make sure both are imported
import toast from "react-hot-toast";
import "./Checkout.css";

const STEPS = [
  { id: 1, label: "Cart", icon: "🛒" },
  { id: 2, label: "Shipping", icon: "📦" },
  { id: 3, label: "Payment", icon: "💳" },
  { id: 4, label: "Confirmation", icon: "✓" },
];

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, Verve",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: "transfer",
    label: "Bank Transfer",
    desc: "Direct bank deposit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    ),
  },
  {
    id: "paystack",
    label: "Paystack",
    desc: "Pay with USSD, Card, or Transfer",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    id: "cod",
    label: "Pay on Delivery",
    desc: "Pay when you receive your order",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
        <rect x="1" y="6" width="14" height="11" rx="1"/>
        <path d="M15 9h4l3 3v5h-7V9z"/>
        <circle cx="6" cy="19" r="2"/>
        <circle cx="18" cy="19" r="2"/>
      </svg>
    ),
  },
];

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", desc: "3-5 business days", price: 1500 },
  { id: "express", label: "Express Delivery", desc: "1-2 business days", price: 3500 },
  { id: "pickup", label: "Store Pickup", desc: "Pick up at our Lagos location", price: 0 },
];

const PLACEHOLDER_CART = [
  { id: 1, name: "Noor Chiffon – Sand", price: 8000, quantity: 1, image: "/product3.png" },
  { id: 2, name: "Luxe Jersey – Mocha", price: 6500, quantity: 1, image: "/product1.png" },
  { id: 3, name: "Hijab Pins Set", price: 2500, quantity: 1, image: "/product4.png" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems = [], clearCart } = useCart() || {};

  const items = cartItems.length > 0 ? cartItems : PLACEHOLDER_CART;

  const [currentStep, setCurrentStep] = useState(2); // Start at Shipping (step 2)
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form state
  const [shipping, setShipping] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
    notes: "",
  });

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = SHIPPING_OPTIONS.find(o => o.id === shippingMethod)?.price || 0;
  const tax = Math.round(subtotal * 0.075); // 7.5% VAT
  const total = subtotal + shippingCost + tax;

  // Redirect if cart is empty (in real app)
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      // navigate("/cart"); // Uncomment in production
    }
  }, [cartItems, orderPlaced]);

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    }
    // Format expiry MM/YY
    if (name === "expiry") {
      value = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    }
    // CVV - only numbers, max 4
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }
    
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const validateShipping = () => {
    const errs = {};
    if (!shipping.fullName.trim()) errs.fullName = "Required";
    if (!shipping.email.trim()) errs.email = "Required";
    if (!shipping.phone.trim()) errs.phone = "Required";
    if (!shipping.address.trim()) errs.address = "Required";
    if (!shipping.city.trim()) errs.city = "Required";
    if (!shipping.state.trim()) errs.state = "Required";
    return errs;
  };

  const validatePayment = () => {
    if (paymentMethod !== "card") return {};
    const errs = {};
    if (!cardDetails.cardNumber.trim()) errs.cardNumber = "Required";
    if (!cardDetails.cardName.trim()) errs.cardName = "Required";
    if (!cardDetails.expiry.trim()) errs.expiry = "Required";
    if (!cardDetails.cvv.trim()) errs.cvv = "Required";
    return errs;
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      const errs = validateShipping();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setCompletedSteps([...completedSteps, 2]);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3) {
      const errs = validatePayment();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      handlePlaceOrder();
    }
  };

  
const handlePlaceOrder = async () => {
  setLoading(true);
  try {
    // ═══ STEP 1: Create the order ═══
    console.log("📋 Creating order...");
    const orderRes = await ordersAPI.checkout({});
    
    const orderId = 
      orderRes.data?.id 
      || orderRes.data?.orderId 
      || orderRes.data?.data?.id;
    
    if (!orderId) {
      throw new Error("Could not create order");
    }
    
    console.log("✅ Order created:", orderId);

    // ═══ STEP 2: Pay on Delivery skips Paystack ═══
    if (paymentMethod === "cod") {
      setCompletedSteps([1, 2, 3, 4]);
      setCurrentStep(4);
      setOrderPlaced(true);
      if (clearCart) clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // ═══ STEP 3: Initialize Paystack ═══
    console.log("💳 Initializing payment...");
    const payRes = await paymentsAPI.initialize({ 
      orderId,
      callbackUrl: `${window.location.origin}/payment/callback`
    });
    
    const authorizationUrl = payRes.data?.authorizationUrl;
    const reference = payRes.data?.reference;
    
    if (!authorizationUrl) {
      throw new Error("Payment URL not received");
    }

    // ═══ STEP 4: Save reference for verification ═══
    sessionStorage.setItem("noor_payment_ref", reference);
    sessionStorage.setItem("noor_payment_orderId", orderId);

    // ═══ STEP 5: Redirect to Paystack ═══
    console.log("🚀 Redirecting to Paystack...");
    toast.success("Redirecting to secure payment...");
    
    setTimeout(() => {
      window.location.href = authorizationUrl;
    }, 800);
    
  } catch (err) {
    console.error("❌ Checkout failed:", err);
    const msg = 
      err.response?.data?.message 
      || err.message 
      || "Payment failed. Please try again.";
    toast.error(msg);
    setLoading(false);
  }
};

  // ═══ ORDER CONFIRMATION SCREEN ═══
  if (orderPlaced) {
    const orderId = `NL-${Date.now().toString().slice(-8)}`;
    return (
      <div className="nl-checkout-page">
        <div className="container">
          <div className="nl-checkout-success">
            <div className="nl-success-icon-big">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="56" height="56">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="nl-success-title">Order Confirmed! 🎉</h1>
            <p className="nl-success-sub">
              Thank you for your purchase. We've sent a confirmation email to <strong>{shipping.email}</strong>
            </p>

            <div className="nl-success-card">
              <div className="nl-success-row">
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </div>
              <div className="nl-success-row">
                <span>Total Paid</span>
                <strong className="nl-success-total">₦{total.toLocaleString()}</strong>
              </div>
              <div className="nl-success-row">
                <span>Payment Method</span>
                <strong>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</strong>
              </div>
              <div className="nl-success-row">
                <span>Estimated Delivery</span>
                <strong>{shippingMethod === "express" ? "1-2 business days" : "3-5 business days"}</strong>
              </div>
            </div>

            <div className="nl-success-actions">
              <button className="btn nl-btn" onClick={() => navigate("/orders")}>
                View My Orders
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button className="btn nl-btn-outline" onClick={() => navigate("/products")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nl-checkout-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="nl-breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li className="active">Checkout</li>
          </ol>
        </nav>

        <h1 className="nl-h1 mb-4">Checkout</h1>

        {/* Progress Stepper */}
        <div className="nl-stepper">
          {STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className={`nl-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="nl-step__circle">
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="nl-step__label">{step.label}</div>
                {idx < STEPS.length - 1 && (
                  <div className={`nl-step__line ${isCompleted ? 'completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="row g-4">
          {/* LEFT: Form Sections */}
          <div className="col-12 col-lg-8">
            
            {/* SHIPPING SECTION */}
            <div className={`nl-checkout-section ${currentStep === 2 ? 'active' : ''} ${completedSteps.includes(2) ? 'completed' : ''}`}>
              <div className="nl-section-head" onClick={() => completedSteps.includes(2) && setCurrentStep(2)}>
                <div className="nl-section-num">2</div>
                <div className="nl-section-title">
                  <h3>Shipping Information</h3>
                  <p>Where should we deliver your order?</p>
                </div>
                {completedSteps.includes(2) && currentStep !== 2 && (
                  <button className="nl-section-edit">Edit</button>
                )}
              </div>

              {currentStep === 2 && (
                <div className="nl-section-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="nl-form-label">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shipping.fullName}
                        onChange={handleShippingChange}
                        placeholder="John Doe"
                        className={`nl-form-input ${errors.fullName ? 'error' : ''}`}
                      />
                      {errors.fullName && <span className="nl-form-error">{errors.fullName}</span>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={shipping.email}
                        onChange={handleShippingChange}
                        placeholder="you@example.com"
                        className={`nl-form-input ${errors.email ? 'error' : ''}`}
                      />
                      {errors.email && <span className="nl-form-error">{errors.email}</span>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        placeholder="+234 801 234 5678"
                        className={`nl-form-input ${errors.phone ? 'error' : ''}`}
                      />
                      {errors.phone && <span className="nl-form-error">{errors.phone}</span>}
                    </div>

                    <div className="col-12">
                      <label className="nl-form-label">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shipping.address}
                        onChange={handleShippingChange}
                        placeholder="12 Marina Street, Apt 5B"
                        className={`nl-form-input ${errors.address ? 'error' : ''}`}
                      />
                      {errors.address && <span className="nl-form-error">{errors.address}</span>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shipping.city}
                        onChange={handleShippingChange}
                        placeholder="Lagos"
                        className={`nl-form-input ${errors.city ? 'error' : ''}`}
                      />
                      {errors.city && <span className="nl-form-error">{errors.city}</span>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shipping.state}
                        onChange={handleShippingChange}
                        placeholder="Lagos State"
                        className={`nl-form-input ${errors.state ? 'error' : ''}`}
                      />
                      {errors.state && <span className="nl-form-error">{errors.state}</span>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shipping.zipCode}
                        onChange={handleShippingChange}
                        placeholder="100001"
                        className="nl-form-input"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nl-form-label">Country</label>
                      <select
                        name="country"
                        value={shipping.country}
                        onChange={handleShippingChange}
                        className="nl-form-input"
                      >
                        <option>Nigeria</option>
                        <option>Ghana</option>
                        <option>Kenya</option>
                        <option>South Africa</option>
                        <option>United Kingdom</option>
                        <option>United States</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="nl-form-label">Order Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={shipping.notes}
                        onChange={handleShippingChange}
                        placeholder="Any special delivery instructions?"
                        rows="3"
                        className="nl-form-input"
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <h4 className="nl-subsection-title">Delivery Method</h4>
                  <div className="nl-shipping-options">
                    {SHIPPING_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`nl-ship-option ${shippingMethod === opt.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={shippingMethod === opt.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <div className="nl-ship-option__content">
                          <div>
                            <div className="nl-ship-option__label">{opt.label}</div>
                            <div className="nl-ship-option__desc">{opt.desc}</div>
                          </div>
                          <div className="nl-ship-option__price">
                            {opt.price === 0 ? "FREE" : `₦${opt.price.toLocaleString()}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button className="btn nl-btn nl-checkout-next" onClick={handleNextStep}>
                    Continue to Payment
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Summary view when collapsed */}
              {currentStep !== 2 && completedSteps.includes(2) && (
                <div className="nl-section-summary">
                  <p><strong>{shipping.fullName}</strong></p>
                  <p>{shipping.address}, {shipping.city}, {shipping.state}</p>
                  <p>{shipping.phone} · {shipping.email}</p>
                </div>
              )}
            </div>

            {/* PAYMENT SECTION */}
            <div className={`nl-checkout-section ${currentStep === 3 ? 'active' : ''} ${completedSteps.includes(3) ? 'completed' : ''}`}>
              <div className="nl-section-head">
                <div className="nl-section-num">3</div>
                <div className="nl-section-title">
                  <h3>Payment Method</h3>
                  <p>Choose how you'd like to pay</p>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="nl-section-body">
                  <div className="nl-payment-options">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`nl-pay-option ${paymentMethod === method.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="nl-pay-option__icon">{method.icon}</div>
                        <div className="nl-pay-option__content">
                          <div className="nl-pay-option__label">{method.label}</div>
                          <div className="nl-pay-option__desc">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Card Details Form (only if card selected) */}
                  {paymentMethod === "card" && (
                    <div className="nl-card-form">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="nl-form-label">Card Number *</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleCardChange}
                            placeholder="1234 5678 9012 3456"
                            className={`nl-form-input ${errors.cardNumber ? 'error' : ''}`}
                          />
                          {errors.cardNumber && <span className="nl-form-error">{errors.cardNumber}</span>}
                        </div>
                        <div className="col-12">
                          <label className="nl-form-label">Cardholder Name *</label>
                          <input
                            type="text"
                            name="cardName"
                            value={cardDetails.cardName}
                            onChange={handleCardChange}
                            placeholder="John Doe"
                            className={`nl-form-input ${errors.cardName ? 'error' : ''}`}
                          />
                          {errors.cardName && <span className="nl-form-error">{errors.cardName}</span>}
                        </div>
                        <div className="col-6">
                          <label className="nl-form-label">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            className={`nl-form-input ${errors.expiry ? 'error' : ''}`}
                          />
                          {errors.expiry && <span className="nl-form-error">{errors.expiry}</span>}
                        </div>
                        <div className="col-6">
                          <label className="nl-form-label">CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            className={`nl-form-input ${errors.cvv ? 'error' : ''}`}
                          />
                          {errors.cvv && <span className="nl-form-error">{errors.cvv}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Info */}
                  {paymentMethod === "transfer" && (
                    <div className="nl-info-box">
                      <h4>Bank Transfer Details</h4>
                      <p>Bank: <strong>GT Bank</strong></p>
                      <p>Account Number: <strong>0123456789</strong></p>
                      <p>Account Name: <strong>Noor Layers Ltd</strong></p>
                      <p className="nl-info-note">Please use your order ID as reference. Order will be processed once payment is confirmed.</p>
                    </div>
                  )}

                  {/* COD Info */}
                  {paymentMethod === "cod" && (
                    <div className="nl-info-box">
                      <h4>Pay on Delivery</h4>
                      <p>You'll pay the delivery agent in cash when your order arrives.</p>
                      <p className="nl-info-note">⚠️ Available only within Lagos. Additional delivery fee may apply.</p>
                    </div>
                  )}

                  <div className="nl-secure-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    Your payment information is encrypted and secure
                  </div>

                  <button 
                    className="btn nl-btn nl-checkout-next" 
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="nl-spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order · ₦{total.toLocaleString()}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="col-12 col-lg-4">
            <div className="nl-checkout-summary">
              <h3 className="nl-summary-title">Order Summary</h3>

              {/* Items */}
              <div className="nl-summary-items">
                {items.map((item) => (
                  <div key={item.id} className="nl-summary-item">
                    <div className="nl-summary-item__img">
                      <img src={item.image} alt={item.name} />
                      <span className="nl-summary-item__qty">{item.quantity}</span>
                    </div>
                    <div className="nl-summary-item__info">
                      <div className="nl-summary-item__name">{item.name}</div>
                      <div className="nl-summary-item__price">₦{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="nl-promo">
                <input type="text" placeholder="Promo code" className="nl-form-input" />
                <button className="nl-promo-btn">Apply</button>
              </div>

              {/* Totals */}
              <div className="nl-summary-totals">
                <div className="nl-summary-row">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="nl-summary-row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : `₦${shippingCost.toLocaleString()}`}</span>
                </div>
                <div className="nl-summary-row">
                  <span>VAT (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
                <div className="nl-summary-divider" />
                <div className="nl-summary-total-row">
                  <span>Total</span>
                  <span className="nl-summary-grand">₦{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="nl-summary-trust">
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Secure Checkout
                </div>
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"/>
                    <polyline points="12 7 12 12 15 15"/>
                  </svg>
                  7-Day Returns
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}