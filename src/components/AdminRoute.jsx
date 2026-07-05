import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but NOT admin → block access
  if (user?.role !== "Admin") {
    return (
      <div style={{ 
        minHeight: "70vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔒</div>
        <h1 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: "2rem",
          color: "#1A1208",
          marginBottom: "0.5rem"
        }}>
          Access Denied
        </h1>
        <p style={{ color: "#8B7355", marginBottom: "1.5rem" }}>
          You don't have permission to view this page.
        </p>
        <a 
          href="/" 
          style={{
            background: "#E8920A",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Back to Home
        </a>
      </div>
    );
  }

  return children;
}