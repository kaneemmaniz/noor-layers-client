import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useAuth } from "./hooks/useAuth";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import Profile from "./pages/Profile";
import OrderDetail from "./pages/OrderDetail";

// Admin Pages
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";

import "./App.css";

/* ──────────────────────────────────────────────────
   ROUTE GUARDS
─────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return isAuthenticated 
    ? children 
    : <Navigate to="/login" state={{ from: location }} replace />;
};

/* ──────────────────────────────────────────────────
   PUBLIC LAYOUT
─────────────────────────────────────────────────── */
const PublicLayout = ({ children }) => (
  <div className="app-shell">
    <NavBar />
    <main className="main-content">{children}</main>
    <Footer />
    <ChatWidget />
  </div>
);

/* ──────────────────────────────────────────────────
   APP
─────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ═══════════════════════════════════════
                ADMIN ROUTES
            ═══════════════════════════════════════ */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>

            {/* ═══════════════════════════════════════
                PUBLIC ROUTES (No login required)
            ═══════════════════════════════════════ */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/products/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/payment/callback" element={<PublicLayout><PaymentCallback /></PublicLayout>} />

            {/* ═══════════════════════════════════════
                PROTECTED ROUTES (Login required)
            ═══════════════════════════════════════ */}
            <Route 
              path="/cart" 
              element={
                <PublicLayout>
                  <ProtectedRoute><Cart /></ProtectedRoute>
                </PublicLayout>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <PublicLayout>
                  <ProtectedRoute><Checkout /></ProtectedRoute>
                </PublicLayout>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <PublicLayout>
                  <ProtectedRoute><Orders /></ProtectedRoute>
                </PublicLayout>
              } 
            />
            
            {/* ✅ FIXED: Profile now protected + wrapped in layout */}
            <Route 
              path="/profile" 
              element={
                <PublicLayout>
                  <ProtectedRoute><Profile /></ProtectedRoute>
                </PublicLayout>
              } 
            />
            
            {/* ✅ FIXED: OrderDetail now protected + wrapped in layout */}
            <Route 
              path="/orders/:id" 
              element={
                <PublicLayout>
                  <ProtectedRoute><OrderDetail /></ProtectedRoute>
                </PublicLayout>
              } 
            />

            {/* ═══════════════════════════════════════
                404 FALLBACK
            ═══════════════════════════════════════ */}
            <Route 
              path="*" 
              element={
                <PublicLayout>
                  <div style={{ 
                    minHeight: "70vh", 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center", 
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center"
                  }}>
                    <h1 style={{ fontSize: "4rem", margin: 0, color: "#E8920A" }}>404</h1>
                    <p style={{ color: "#8B7355", marginBottom: "1.5rem" }}>Page not found</p>
                    <a href="/" style={{ color: "#E8920A", fontWeight: "600" }}>← Back to Home</a>
                  </div>
                </PublicLayout>
              } 
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}