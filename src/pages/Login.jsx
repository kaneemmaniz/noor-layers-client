import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import "./Register.css"; // Reuse the same auth styles

const FEATURES = [
  {
    title: "Welcome Back",
    desc: "Continue your modest fashion journey.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    title: "Track Your Orders",
    desc: "View and manage all your purchases.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    title: "Member Benefits",
    desc: "Exclusive offers just for you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect to previous page after login (or home)
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (errors.submit) setErrors({ ...errors, submit: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
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
    await login(form.email, form.password);
    toast.success("Welcome back! ✨");
    navigate(from, { replace: true });
  } catch (err) {
    const msg = err.response?.data?.message 
      || err.response?.data?.error 
      || err.response?.data?.title
      || "Invalid email or password.";
    setErrors({ submit: msg });
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

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

          {/* RIGHT: Login Form */}
          <div className="nl-auth-form-wrap">
            <div className="nl-auth-form-card">
              <h2 className="nl-auth-title">Welcome Back</h2>
              <p className="nl-auth-sub">
                Sign in to continue your journey with Noor Layers.
              </p>

              {errors.submit && (
                <div className="nl-auth-error-banner">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="nl-auth-form">
                <div className="row g-3">
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
                        autoComplete="current-password"
                        className={`nl-auth-input ${errors.password ? 'error' : ''}`}
                      />
                      <button
                        type="button"
                        className="nl-auth-eye"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
                  </div>

                  {/* Remember Me + Forgot Password */}
                  <div className="col-12">
                    <div className="nl-auth-row">
                      <label className="nl-auth-checkbox">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={form.remember}
                          onChange={handleChange}
                        />
                        <span className="nl-auth-checkbox__box">
                          {form.remember && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="14" height="14">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </span>
                        <span className="nl-auth-checkbox__label">Remember me</span>
                      </label>

                      <Link to="/forgot-password" className="nl-auth-forgot">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn nl-btn nl-auth-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="nl-spinner" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="nl-auth-divider">
                <span>OR</span>
              </div>

              {/* Social Login */}
              <div className="nl-auth-social">
                <button type="button" className="nl-auth-social-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Register Link */}
              <p className="nl-auth-footer">
                Don't have an account? <Link to="/register">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}