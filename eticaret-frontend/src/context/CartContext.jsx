import { createContext, useContext, useState } from "react";
import cartService from "../services/cartService";
import productService from "../services/productService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const openCartWithRefresh = (userId, options ={}) => {
    const {silent = false} = options;
    if(!silent) setIsOpen(true);
    setLoading(true);
    cartService
      .getByUser(userId)
      .then((response) => {
        const rawItems = response.data || [];
        Promise.all(
          rawItems.map((item) =>
            productService
              .getById(item.productId)
              .then((res) => ({ ...item, product: res.data}))
              .catch(() => ({ ...item ,product:null}))
          )
        ).then((withProducts) => {
          setItems(withProducts);
          setLoading(false);
        });
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  };

  const closeCart = () => setIsOpen(false);

  const updateItemQuantity = (id, quantity, userId) => {
    return cartService.updateQuantity(id, quantity).then(() => {
      openCartWithRefresh(userId, { silent:true});
    });
  };

  const removeItem = (id, userId) => {
    return cartService.removeFromCart(id).then(() => {
      openCartWithRefresh(userId, { silent:true});
    });
  };

  return (
    <CartContext.Provider
      value={{ isOpen, items, loading, openCartWithRefresh, closeCart, updateItemQuantity, removeItem}}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
