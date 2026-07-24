import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoriteContext";
import favoriteService from "../services/favoriteService";
import productService from "../services/productService";
import "./Favorites.css";
import heartIcon from "../assets/heart.png";
import { useCart } from "../context/CartContext";
import cartService from "../services/cartService";


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

function Favorites() {
  const { user , authChecked } = useAuth();
  const { toggleFavorite } = useFavorites();
  const { openCartWithRefresh } = useCart();
  const [ addingId , setAddingId ] = useState(null);

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavoriteProducts = () => {
    if(!authChecked) return;
    if (!user) {
      navigate("/giris");
      return;
    }
    const userId = getUserIdFromToken(user.token);
    if (!userId) return;

    setLoading(true);
    favoriteService
      .getByUser(userId)
      .then((response) => {
        const favorites = response.data || [];
        Promise.all(
          favorites.map((f) =>
            productService
              .getById(f.productId)
              .then((res) => res.data)
              .catch(() => null)
          )
        ).then((results) => {
          setProducts(results.filter(Boolean));
          setLoading(false);
        });
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFavoriteProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authChecked]);

  const handleRemove = (productId) => {
    toggleFavorite(productId).then(() => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    });
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    const userId = getUserIdFromToken(user.token);
    if (!userId) {
      navigate("/giris");
      return;
    }
    setAddingId(productId);
    cartService
      .addToCart({ userId, productId, quantity: 1 })
      .then(() => {
        openCartWithRefresh(userId);
        setAddingId(null);
      })
      .catch(() => {
        setAddingId(null);
      });
  };


  return (
    <div className="fav-shell">
      <div className="fav-banner">
        <h1 className="fav-bannerTitle">♥ Favorilerim</h1>
        <p className="fav-bannerSub">
          Beğendiğiniz ürünleri burada bulabilir, dilediğinizde sepetinize ekleyebilirsiniz.
        </p>
      </div>

      <div className="fav-body">
        {loading ? (
          <p className="fav-loading">Yükleniyor...</p>
        ) : products.length === 0 ? (
          <div className="fav-empty">
            <span className="fav-emptyIcon">♡</span>
            <p>Henüz favori ürününüz yok.</p>
            <button className="fav-emptyButton" onClick={() => navigate("/urunler")}>
              Ürünlere Göz At
            </button>
          </div>
        ) : (
          <div className="fav-grid">
            {products.map((product) => (
              <div
                className="fav-card"
                key={product.id}
                onClick={() => navigate(`/urun/${product.id}`)}
              >
                <div className="fav-thumb">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <span>{product.name?.charAt(0).toUpperCase()}</span>
                  )}
                  <button
                    className="fav-removeButton"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.id);
                    }}
                    aria-label="Favorilerden kaldır"
                  >
                    <img src={heartIcon} alt="" className="fav-removeIcon" />
                  </button>
                </div>
                <div className="fav-info">
                  <p className="fav-name">{product.name}</p>
                  <p className="fav-price">{product.price?.toLocaleString("tr-TR")} TL</p>
                  <button 
                    className="fav-addButton"
                    onClick={(e) => handleAddToCart(e,product.id)}
                    disable = {product.stock <= 0 || addingId === product.id}
                  >
                    {product.stock <= 0 ? "Tükendi" : addingId === product.id ? "Ekleniyor..." : "Sepete Ekle"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
