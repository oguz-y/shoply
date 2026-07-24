import { createContext, useContext, useState, useEffect } from "react";
import favoriteService from "../services/favoriteService";
import { useAuth } from "./AuthContext";

const FavoriteContext = createContext();

function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload.nameid ||
      payload.sub ||
      null
    );
  } catch {
    return null;
  }
}

export function FavoriteProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const loadFavorites = () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    const userId = getUserIdFromToken(user.token);
    if (!userId) return;

    setLoading(true);
    favoriteService
      .getByUser(userId)
      .then((response) => {
        const ids = (response.data || []).map((f) => f.productId);
        setFavoriteIds(new Set(ids));
        setLoading(false);
      })
      .catch(() => {
        setFavoriteIds(new Set());
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isFavorite = (productId) => favoriteIds.has(productId);

  const toggleFavorite = (productId) => {
    const userId = getUserIdFromToken(user?.token);
    if (!userId) return Promise.reject(new Error("Giriş yapmalısınız"));

    if (isFavorite(productId)) {
      return favoriteService.remove(userId, productId).then(() => {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      });
    } else {
      return favoriteService.add({ userId, productId }).then(() => {
        setFavoriteIds((prev) => new Set(prev).add(productId));
      });
    }
  };

  return (
    <FavoriteContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}
