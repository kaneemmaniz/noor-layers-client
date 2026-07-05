import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import "./Register.css";

const FEATURES = [
  {
    title: "Exclusive Deals",
    desc: "Get access to special offers and discounts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    title: "Secure Shopping",
    desc: "Your data is safe with us.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
  {
    title: "Fast Delivery",
    desc: "Quick and reliable delivery to your door.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <rect x="1" y="6" width="14" height="11" rx="1"/>
        <path d="M15 9h4l3 3v5h-7V9z"/>
        <circle cx="6" cy="19" r="2"/>
        <circle cx="18" cy="19" r="2"/>
      </svg>
    ),
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.agreed) errs.agreed = "You must agree to the terms";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success("Account created! Welcome to Noor Layers ✨");
      navigate("/");
    } catch (err) {
  console.log("🔴 FULL ERROR OBJECT:", err);
  console.log("🔴 ERROR RESPONSE:", err.response);
  console.log("🔴 ERROR DATA:", err.response?.data);
  
  const msg = err.response?.data?.message
    || err.response?.data?.error
    || err.response?.data?.title
    || (err.response?.data?.errors && Object.values(err.response.data.errors).flat().join(", "))
    || err.message
    || "Registration failed. Please try again.";
  setErrors({ submit: msg });
  toast.error(msg);
} finally {
      setLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];
  const strengthColor = ["", "#E74C3C", "#F39C12", "#F1C40F", "#3498DB", "#2ECC71"][strength];

  return (
    <div className="nl-auth-page">
      <div className="container">
        <div className="nl-auth-wrap">
          {/* LEFT: Branding */}
          <div className="nl-auth-brand">
            <div className="nl-auth-logo">
              <svg viewBox="0 0 56 56" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
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

            <h1 className="nl-auth-brand__name">Noor Layers</h1>
            <p className="nl-auth-brand__tagline">wear your light</p>

            <div className="nl-auth-features">
              {FEATURES.map((f) => (
                <div key={f.title} className="nl-auth-feature">
                  <div className="nl-auth-feature__icon">{f.icon}</div>
                  <div>
                    <div className="nl-auth-feature__title">{f.title}</div>
                    <div className="nl-auth-feature__desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="nl-auth-form-wrap">
            <div className="nl-auth-form-card">
              <h2 className="nl-auth-title">Create Your Account</h2>
              <p className="nl-auth-sub">
                Join Noor Layers and start your journey with elegance.
              </p>

              {errors.submit && (
                <div className="nl-auth-error-banner">{errors.submit}</div>
              )}

              <form onSubmit={handleSubmit} className="nl-auth-form">
                <div className="row g-3">
                  {/* First Name */}
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      className={`nl-auth-input ${errors.firstName ? 'error' : ''}`}
                    />
                    {errors.firstName && <span className="nl-auth-error">{errors.firstName}</span>}
                  </div>

                  {/* Last Name */}
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className={`nl-auth-input ${errors.lastName ? 'error' : ''}`}
                    />
                    {errors.lastName && <span className="nl-auth-error">{errors.lastName}</span>}
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className={`nl-auth-input ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <span className="nl-auth-error">{errors.email}</span>}
                  </div>

                  {/* Password */}
                  <div className="col-12">
                    <div className="nl-auth-password-wrap">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className={`nl-auth-input ${errors.password ? 'error' : ''}`}
                      />
                      <button
                        type="button"
                        className="nl-auth-eye"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <span className="nl-auth-error">{errors.password}</span>}

                    {form.password && (
                      <div className="nl-auth-strength">
                        <div className="nl-auth-strength__bars">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="nl-auth-strength__bar"
                              style={{ background: i <= strength ? strengthColor : '#E8E2D5' }}
                            />
                          ))}
                        </div>
                        <span style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-12">
                    <div className="nl-auth-password-wrap">
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className={`nl-auth-input ${errors.confirmPassword ? 'error' : ''}`}
                      />
                      <button
                        type="button"
                        className="nl-auth-eye"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="nl-auth-error">{errors.confirmPassword}</span>}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="col-12">
                    <label className="nl-auth-checkbox">
                      <input
                        type="checkbox"
                        name="agreed"
                        checked={form.agreed}
                        onChange={handleChange}
                      />
                      <span className="nl-auth-checkbox__box">
                        {form.agreed && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="14" height="14">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>
                      <span className="nl-auth-checkbox__label">
                        I agree to the <Link to="/terms">Terms & Conditions</Link>
                      </span>
                    </label>
                    {errors.agreed && <span className="nl-auth-error">{errors.agreed}</span>}
                  </div>
                </div>

                <button type="submit" className="btn nl-btn nl-auth-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="nl-spinner" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="nl-auth-footer">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}