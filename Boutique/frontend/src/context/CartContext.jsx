import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartService } from '../services/cart.service.js';
import { favoriteService } from '../services/product.service.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuth } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, total_items: 0 });
  const [favorites, setFavorites] = useState([]); // array de product_id
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuth) { setCart({ items: [], subtotal: 0, total_items: 0 }); return; }
    try {
      const data = await cartService.get();
      setCart(data);
    } catch (_) { /* noop */ }
  }, [isAuth]);

  const refreshFavorites = useCallback(async () => {
    if (!isAuth) { setFavorites([]); return; }
    try {
      const ids = await favoriteService.ids();
      setFavorites(ids);
    } catch (_) { /* noop */ }
  }, [isAuth]);

  useEffect(() => { refreshCart(); refreshFavorites(); }, [refreshCart, refreshFavorites]);

  async function addToCart(payload) {
    setLoading(true);
    try {
      const data = await cartService.addItem(payload);
      setCart(data);
      return data;
    } finally { setLoading(false); }
  }

  async function updateItem(id, cantidad) {
    const data = await cartService.updateItem(id, cantidad);
    setCart(data);
  }

  async function removeItem(id) {
    const data = await cartService.removeItem(id);
    setCart(data);
  }

  async function clearCart() {
    const data = await cartService.clear();
    setCart(data);
  }

  async function toggleFavorite(productId) {
    const { favorito } = await favoriteService.toggle(productId);
    setFavorites((prev) => (favorito ? [...prev, productId] : prev.filter((id) => id !== productId)));
    return favorito;
  }

  const isFavorite = (productId) => favorites.includes(productId);

  return (
    <CartContext.Provider
      value={{ cart, loading, favorites, addToCart, updateItem, removeItem, clearCart, refreshCart, toggleFavorite, isFavorite, refreshFavorites }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
