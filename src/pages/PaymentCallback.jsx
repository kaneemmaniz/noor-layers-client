import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentsAPI } from "../api";
import { useCart } from "../hooks/useCart";
import "./PaymentCallback.css";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart() || {};
  
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = 
        searchParams.get("reference") 
        || searchParams.get("trxref") 
        || sessionStorage.getItem("noor_payment_ref");
      
      const orderId = sessionStorage.getItem("noor_payment_orderId");

      if (!reference) {
        setStatus("failed");
        setMessage("Payment reference not found. Please contact support.");
        return;
      }

      console.log("🔍 Verifying payment:", reference);

      const res = await paymentsAPI.verify(reference);
      const data = res.data;
      
      console.log("📦 Verification response:", data);

      const isSuccess = 
        data?.status === "success" 
        || data?.status === "Success"
        || data?.paymentStatus === "Paid"
        || data?.success === true
        || data?.paid === true;

      if (isSuccess) {
        setStatus("success");
        setMessage("Your payment was successful!");
        setOrderDetails({
          orderId: orderId || data?.orderId,
          reference,
          amount: data?.amount || data?.totalAmount,
        });
        
        if (clearCart) clearCart();
        sessionStorage.removeItem("noor_payment_ref");
        sessionStorage.removeItem("noor_payment_orderId");
      } else {
        setStatus("failed");
        setMessage(data?.message || "Payment was not completed.");
      }
    } catch (err) {
      console.error("❌ Verification error:", err);
      setStatus("failed");
      setMessage(
        err.response?.data?.message 
        || "Could not verify your payment. Please contact support."
      );
    }
  };

  return (
    <div className="nl-callback-page">
      <div className="container">
        <div className="nl-callback-card">
          
          {status === "verifying" && (
            <>
              <div className="nl-callback-spinner">
                <div className="nl-spinner-ring"></div>
              </div>
              <h1>Verifying Payment</h1>
              <p>{message}</p>
              <small>Please don't close this page...</small>
            </>
          )}

          {status === "success" && (
            <>
              <div className="nl-callback-icon nl-callback-icon--success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="56" height="56">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1>Payment Successful! 🎉</h1>
              <p>{message}</p>
              
              {orderDetails && (
                <div className="nl-callback-details">
                  {orderDetails.orderId && (
                    <div className="nl-callback-row">
                      <span>Order ID</span>
                      <strong>{String(orderDetails.orderId).substring(0, 8)}...</strong>
                    </div>
                  )}
                  {orderDetails.reference && (
                    <div className="nl-callback-row">
                      <span>Reference</span>
                      <strong>{orderDetails.reference}</strong>
                    </div>
                  )}
                  {orderDetails.amount && (
                    <div className="nl-callback-row">
                      <span>Amount Paid</span>
                      <strong className="nl-callback-amount">
                        ₦{Number(orderDetails.amount).toLocaleString()}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <div className="nl-callback-actions">
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
            </>
          )}

          {status === "failed" && (
            <>
              <div className="nl-callback-icon nl-callback-icon--failed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="56" height="56">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h1>Payment Failed</h1>
              <p>{message}</p>

              <div className="nl-callback-actions">
                <button className="btn nl-btn" onClick={() => navigate("/cart")}>
                  Try Again
                </button>
                <button className="btn nl-btn-outline" onClick={() => navigate("/contact")}>
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}