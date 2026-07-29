import { createContext, useContext, useState } from "react";
import cartService from "../services/cartService";
import productService from "../services/productService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const openCartWithRefresh = (userId, options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsOpen(true);
    setLoading(true);
    cartService
      .getByUser(userId)
      .then((response) => {
        const rawItems = response.data || [];
        return Promise.all(
          rawItems.map((item) =>
            productService
              .getById(item.productId)
              .then((res) => ({ ...item, product: res.data }))
              .catch(() => ({ ...item, product: null }))
          )
        );
      })
      .then((withProducts) => {
        setItems(withProducts);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  const closeCart = () => setIsOpen(false);

  // Artık tüm sepeti değil, SADECE değişen item'ı günceller.
  // Ürün bilgisi (isim/fiyat/görsel) zaten elimizde, tekrar çekmeye gerek yok.
  const updateItemQuantity = (id, quantity, userId) => {
    const previousItems = items;

    // Optimistic: anında local state güncelle
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    return cartService.updateQuantity(id, quantity).catch((error) => {
      // Başarısız oldu, eski haline geri al
      setItems(previousItems);
      throw error; // CartDrawer'daki .catch bunu yakalayıp hata mesajı gösterecek
    });
  };

  const removeItem = (id, userId) => {
    const previousItems = items;

    setItems((prev) => prev.filter((item) => item.id !== id));

    return cartService.removeFromCart(id).catch((error) => {
      setItems(previousItems);
      throw error;
    });
  };

  return (
    <CartContext.Provider
      value={{
        isOpen,
        items,
        loading,
        openCartWithRefresh,
        closeCart,
        updateItemQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
