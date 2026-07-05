import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#1A1208",
          border: "1px solid rgba(139,115,85,.15)",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontFamily: "Jost, sans-serif",
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
        },
        success: {
          iconTheme: {
            primary: "#E8920A",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#E74C3C",
            secondary: "#fff",
          },
        },
      }}
    />
  </StrictMode>
);