import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { cartAPI } from "../api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export const CartContext = createContext(null);

const getItemId = (item) => item?.productId || item?.id || item?.product?.id;

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const debounceTimers = useRef({});
  const lastSyncedQty = useRef({});  // what the SERVER currently has

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCartItems([]); return; }
    setLoading(true);
    try {
      const res = await cartAPI.get();
      const items = res.data?.items || [];
      // Keep lastSyncedQty in sync with server
      items.forEach(item => {
        const id = getItemId(item);
        lastSyncedQty.current[id] = item.quantity;
      });
      setCartItems(items);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ═══ ADD TO CART ═══
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      setTimeout(() => { window.location.href = "/login"; }, 1200);
      return;
    }
    const productId = product?.id || product?.productId;
    const name = product?.name || "Item";
    try {
      await cartAPI.add(productId, quantity);
      await fetchCart();
      toast.success(`${name} added to cart`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add item to cart";
      toast.error(msg);
      throw err;
    }
  };

  // ═══ REMOVE FROM CART ═══
  const removeFromCart = async (productId) => {
    // Kill any pending quantity timer for this item immediately
    clearTimeout(debounceTimers.current[productId]);
    delete debounceTimers.current[productId];
    delete lastSyncedQty.current[productId];

    setUpdatingIds((prev) => new Set(prev).add(productId));
    try {
      await cartAPI.remove(productId);
      setCartItems((prev) => prev.filter((i) => getItemId(i) !== productId));
    } catch (err) {
      toast.error("Failed to remove item");
      await fetchCart();
    } finally {
      setUpdatingIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  // ═══ UPDATE QUANTITY ═══
  // Uses DELTA approach — only sends the difference to the server.
  // "add" accumulates on this API, so we track what the server has
  // and only send add(+delta) or remove+add(newQty) for decreases.
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // Optimistic UI
    setCartItems((prev) =>
      prev.map((item) =>
        getItemId(item) === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Debounce — only the LAST click within 600ms fires the API
    clearTimeout(debounceTimers.current[productId]);
    debounceTimers.current[productId] = setTimeout(async () => {
      delete debounceTimers.current[productId];

      const serverQty = lastSyncedQty.current[productId] ?? newQuantity;
      const delta = newQuantity - serverQty;

      if (delta === 0) return; // already in sync

      setUpdatingIds((prev) => new Set(prev).add(productId));

      try {
        if (delta > 0) {
          // Increase: just add the difference
          await cartAPI.add(productId, delta);
        } else {
          // Decrease: remove entirely, then re-add exact amount
          // This is the only way with this API since there's no subtract
          await cartAPI.remove(productId);
          if (newQuantity > 0) {
            await cartAPI.add(productId, newQuantity);
          }
        }
        // Update our record of what the server now has
        lastSyncedQty.current[productId] = newQuantity;
      } catch (err) {
        console.error("Quantity sync failed:", err);
        toast.error("Failed to update quantity");
        await fetchCart(); // revert UI to real server state
      } finally {
        setUpdatingIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      }
    }, 600);
  };

  // ═══ CLEAR CART ═══
  const clearCart = async () => {
    Object.values(debounceTimers.current).forEach(clearTimeout);
    debounceTimers.current = {};
    lastSyncedQty.current = {};
    try {
      await cartAPI.clear();
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || item.finalPrice || item.unitPrice || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal, loading, updatingIds,
      addToCart, removeFromCart, updateQuantity, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

