import { createContext, useContext, useEffect, useState } from "react";
import {
  addToLocalCart,
  buyNowLocalCart,
  clearLocalCart,
  getLocalCart,
  getLocalCartCount,
  removeFromLocalCart,
  updateLocalCartQty,
} from "../utils/localCart";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(() => getLocalCart());
  const [cartCount, setCartCount] = useState(() => getLocalCartCount());

  const refresh = () => {
    const items = getLocalCart();
    setCart(items);
    setCartCount(items.reduce((sum, item) => sum + (item.qty || 0), 0));
  };

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("monorom-cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("monorom-cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const addItem = (item) => {
    addToLocalCart(item);
    refresh();
  };

  const buyNow = (item) => {
    buyNowLocalCart(item);
    refresh();
  };

  const removeItem = (cartId) => {
    removeFromLocalCart(cartId);
    refresh();
  };

  const updateQty = (cartId, qty) => {
    updateLocalCartQty(cartId, qty);
    refresh();
  };

  const clear = () => {
    clearLocalCart();
    refresh();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addItem,
        buyNow,
        removeItem,
        updateQty,
        clear,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartContextProvider");
  }
  return ctx;
};
