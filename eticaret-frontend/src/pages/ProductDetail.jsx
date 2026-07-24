import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService from "../services/productService";
import cartService from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import "./ProductDetail.css";
import { useCart} from "../context/CartContext";
import reviewService from "../services/reviewService";
import {useFavorites } from "../context/FavoriteContext";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

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

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCartWithRefresh } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({rating: 5, comment:""});
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadReviews = () => {
    setReviewsLoading(true);
    reviewService
      .getByProduct(id)
      .then((response) => {
        setReviews(response.data || []);
        setReviewsLoading(false);
      })
      .catch(() => {
        setReviews([]);
        setReviewsLoading(false);
      });

  };
  useEffect(() => {
    loadReviews();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError("");
    productService
      .getById(id)
      .then((response) => {
        setProduct(response.data);
        setQuantity(1);
        setLoading(false);
      })
      .catch(() => {
        setError("Ürün bulunamadı.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!product) return;
    productService
      .getAll(product.categoryId ?? null)
      .then((response) => {
        const filtered = response.data
          .filter((p) => p.id !== product.id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      })
      .catch(() => setRelatedProducts([]));
  }, [product]);

  const handleQuantityChange = (delta) => {
    setQuantity((q) => {
      const next = q + delta;
      if (next < 1) return 1;
      if (product?.stock != null && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    setCartMessage("");

    if (!user) {
      navigate("/giris");
      return;
    }

    const userId = getUserIdFromToken(user.token);
    if (!userId) {
      navigate("/giris");
      return;
    }

    setAdding(true);
    cartService
      .addToCart({ userId, productId: product.id, quantity })
      .then(() => {
        setCartMessage(`${product.name} sepete eklendi.`);
        openCartWithRefresh(userId);
        setAdding(false);
        setTimeout(() => setCartMessage(""), 2500);
      })
      .catch((error) => {
        const backendMessage = error.response?.data;
        setCartMessage(
          typeof backendMessage === "string" && backendMessage 
            ? backendMessage
            : "Sepete eklenirken bir sorun oluştu."
          );
          setAdding(false);
          setTimeout(() => setCartMessage(""), 2500);
      });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewError("");

    if (!user) {
      navigate("/giris");
      return;
    }

    const userId = getUserIdFromToken(user.token);
    if (!userId) {
      navigate("/giris");
      return;
    }

    setReviewSubmitting(true);
    reviewService
      .create({
        userId,
        productId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      })
      .then(() => {
        setReviewForm({ rating: 5, comment: "" });
        setReviewSubmitting(false);
        loadReviews();
      })
      .catch((err) => {
        const message = err.response?.data;
        setReviewError(typeof message === "string" ? message : "Yorum eklenirken bir sorun oluştu.");
        setReviewSubmitting(false);
      });
};

const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;


  if (loading) {
    return (
      <div className="pd-shell">
        <div className="pd-skeletonWrap">
          <div className="pd-skeletonImg" />
          <div className="pd-skeletonInfo">
            <div className="pd-skeletonLine pd-skeletonLine--wide" />
            <div className="pd-skeletonLine pd-skeletonLine--short" />
            <div className="pd-skeletonLine pd-skeletonLine--medium" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-shell">
        <div className="pd-errorBox">
          <p>{error || "Ürün bulunamadı."}</p>
          <Link to="/urunler" className="pd-backLink">
            ← Ürünlere dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-shell">
      <div className="pd-breadcrumb">
        <Link to="/urunler">Ürünler</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pd-card">
        <div className="pd-imageWrap">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="pd-image" />
          ) : (
            <span className="pd-imagePlaceholder">
              {product.name?.charAt(0).toUpperCase()}
            </span>
          )}
          {product.stock <= 0 && <span className="pd-badge">Tükendi</span>}
        </div>

        <div className="pd-info">
          <span className="pd-eyebrow">Ürün Detayı</span>
          <div className="pd-titleRow">
              <h1 className="pd-title">{product.name}</h1>
              <button
                  className={`pd-favButton ${isFavorite(product.id) ? "is-active" : ""}`}
                  onClick={() => {
                      if (!user) {
                          navigate("/giris");
                          return;
                      }
                      toggleFavorite(product.id);
                  }}
                  aria-label="Favorilere ekle"
              >
                  {isFavorite(product.id) ? <FaHeart /> : <FaRegHeart />}
                  {" "}
                  {isFavorite(product.id) ? "Favorilerde": "Favorilere Ekle"}
              </button>
          </div>

          <p className="pd-price">{product.price?.toLocaleString("tr-TR")} TL</p>

          {product.description && (
            <p className="pd-description">{product.description}</p>
          )}

          <div className="pd-stockInfo">
            {product.stock > 0 ? (
              <span className="pd-stockOk">Stokta {product.stock} adet var</span>
            ) : (
              <span className="pd-stockOut">Stokta yok</span>
            )}
          </div>

          <div className="pd-quantityRow">
            <span className="pd-quantityLabel">Adet</span>
            <div className="pd-quantityControl">
              <button
                type="button"
                className="pd-qtyButton"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="pd-qtyValue">{quantity}</span>
              <button
                type="button"
                className="pd-qtyButton"
                onClick={() => handleQuantityChange(1)}
                disabled={product.stock != null && quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="pd-addButton"
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || adding}
          >
            {product.stock <= 0 ? "Tükendi" : adding ? "Ekleniyor..." : "Sepete Ekle"}
          </button>

          {cartMessage && <div className="pd-toast">{cartMessage}</div>}
        </div>
      </div>

      <div className="pd-trustRow">
        <div className="pd-trustItem">
          <span className="pd-trustIcon">🚚</span>
          <div>
            <strong>Ücretsiz Kargo</strong>
            <p>Seçili ürünlerde geçerli</p>
          </div>
        </div>
        <div className="pd-trustItem">
          <span className="pd-trustIcon">↩️</span>
          <div>
            <strong>Kolay İade</strong>
            <p>14 gün içinde iade hakkı</p>
          </div>
        </div>
        <div className="pd-trustItem">
          <span className="pd-trustIcon">🔒</span>
          <div>
            <strong>Güvenli Ödeme</strong>
            <p>256-bit SSL koruması</p>
          </div>
        </div>
        <div className="pd-trustItem">
          <span className="pd-trustIcon">🎧</span>
          <div>
            <strong>7/24 Destek</strong>
            <p>Her zaman yanınızdayız</p>
          </div>
        </div>
      </div>

      <div className="pd-specsCard">
        <h2 className="pd-sectionTitle">Ürün Özellikleri</h2>
        <table className="pd-specsTable">
          <tbody>
            <tr>
              <td>Ürün Adı</td>
              <td>{product.name}</td>
            </tr>
            <tr>
              <td>Fiyat</td>
              <td>{product.price?.toLocaleString("tr-TR")} TL</td>
            </tr>
            <tr>
              <td>Stok Durumu</td>
              <td>{product.stock > 0 ? `${product.stock} adet mevcut` : "Tükendi"}</td>
            </tr>
            {product.categoryName && (
              <tr>
                <td>Kategori</td>
                <td>{product.categoryName}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pd-reviewsSection">
          <div className="pd-reviewsHeader">
            <h2 className="pd-sectionTitle">Değerlendirmeler</h2>
            {averageRating && (
              <div className="pd-avgRating">
                ⭐ {averageRating} <span>({reviews.length} değerlendirme)</span>
              </div>
            )}
          </div>

          <form className="pd-reviewForm" onSubmit={handleReviewSubmit}>
            <label className="pd-reviewLabel">
              Puanınız
              <select
                className="pd-reviewSelect"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
              >
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </label>

            <label className="pd-reviewLabel">
              Yorumunuz
              <textarea
                className="pd-reviewTextarea"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                required
              />
            </label>

            {reviewError && <p className="pd-reviewError">{reviewError}</p>}

            <button className="pd-reviewSubmit" type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}
            </button>
          </form>

          {reviewsLoading ? (
            <p className="pd-reviewsLoading">Yorumlar yükleniyor...</p>
          ) : reviews.length === 0 ? (
            <p className="pd-reviewsEmpty">Bu ürün için henüz yorum yapılmamış.</p>
          ) : (
            <div className="pd-reviewsList">
              {reviews.map((r) => (
                <div className="pd-reviewCard" key={r.id}>
                  <div className="pd-reviewMeta">
                    <span className="pd-reviewAuthor">
                      {r.reviewerEmail ? r.reviewerEmail.split("@")[0] : "Kullanıcı"}
                    </span>
                    <span className="pd-reviewStars">{"⭐".repeat(r.rating)}</span>
                  </div>
                  <p className="pd-reviewComment">{r.comment}</p>
                </div>
              ))}

            </div>
          )}
      </div>



      {relatedProducts.length > 0 && (
        <div className="pd-relatedSection">
          <h2 className="pd-sectionTitle">Benzer Ürünler</h2>
          <div className="pd-relatedGrid">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="pd-relatedCard"
                onClick={() => navigate(`/urun/${p.id}`)}
              >
                <div className="pd-relatedThumb">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} />
                  ) : (
                    <span>{p.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <p className="pd-relatedName">{p.name}</p>
                <p className="pd-relatedPrice">{p.price?.toLocaleString("tr-TR")} TL</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
