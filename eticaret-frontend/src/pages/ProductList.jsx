import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import "./ProductList.css";
import { useCart } from "../context/CartContext";
import {useSearchParams} from "react-router-dom";
import { useFavorites } from "../context/FavoriteContext";
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
 
function ProductList() {
    const [confettiKey, setConfettiKey] = useState(0);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { openCartWithRefresh } =useCart();
 
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get("q") || "";
    const {isFavorite, toggleFavorite } = useFavorites();
 
    useEffect(() => {
        categoryService
        .getAll()
        .then((response) => setCategories(response.data))
        .catch(() => setError("Kategoriler yüklenemedi."));
    }, []);
 
    useEffect(() => {
        setLoading(true);
        productService
        .getAll(selectedCategory)
        .then((response) => {
            setProducts(response.data);
            setLoading(false);
        })
        .catch(() => {
            setError("Ürünler yüklenemedi.");
            setLoading(false);
        });
    }, [selectedCategory]);
 
    // Ana kategoriler (parentId'si olmayanlar) ve bir ana kategorinin alt kategorilerini bulan yardımcı
    const mainCategories = categories.filter((c) => !c.parentId);
    const getSubCategories = (parentId) =>
        categories.filter((c) => c.parentId === parentId);
 
    const toggleCategory = (catId) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(catId)) {
                next.delete(catId);
            } else {
                next.add(catId);
            }
            return next;
        });
    };

    const selectedCategoryName =
        categories.find((c) => c.id === selectedCategory)?.name || "Tüm Ürünler";
 
    const filteredProducts = products.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())    
    );
 
    const handleAddToCart = (e, product) => {
        e.stopPropagation();
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
 
        cartService
            .addToCart({ userId, productId: product.id, quantity: 1 })
            .then(() => {
                setCartMessage(`${product.name} sepete eklendi.`);
                openCartWithRefresh(userId);
                setConfettiKey((prev) => prev + 1);
                setTimeout(() => setCartMessage(""), 2500);
            })
            .catch(() => {
                setCartMessage("Sepete eklenirken bir sorun oluştu.");
                setTimeout(() => setCartMessage(""), 2500);
            });
 
    };
 
    return (
        <div className="plp-shell">
        <aside className="plp-sidebar">
            <h2 className="plp-sidebarTitle">Kategoriler</h2>
            <nav className="plp-catList">
            <button
                className={`plp-catItem ${selectedCategory === null ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(null)}
            >
                Tüm Ürünler
            </button>

            {mainCategories.map((cat) => {
                const subCats = getSubCategories(cat.id);
                const hasSubCats = subCats.length > 0;
                const isExpanded = expandedCategories.has(cat.id);

                return (
                    <div key={cat.id} className="plp-catGroup">
                    <div className="plp-catRow">
                        <button
                        className={`plp-catItem ${selectedCategory === cat.id ? "is-active" : ""}`}
                        onClick={() => setSelectedCategory(cat.id)}
                        >
                        {cat.name}
                        </button>

                        {hasSubCats && (
                        <button
                            type="button"
                            className={`plp-catToggle ${isExpanded ? "is-open" : ""}`}
                            onClick={() => toggleCategory(cat.id)}
                            aria-label={isExpanded ? "Alt kategorileri gizle" : "Alt kategorileri göster"}
                        >
                            ▾
                        </button>
                        )}
                    </div>

                    {hasSubCats && isExpanded && (
                        <div className="plp-subList">
                        {subCats.map((sub) => (
                            <button
                            key={sub.id}
                            className={`plp-catItem plp-catItem--sub ${selectedCategory === sub.id ? "is-active" : ""}`}
                            onClick={() => setSelectedCategory(sub.id)}
                            >
                            {sub.name}
                            </button>
                        ))}
                        </div>
                    )}
                    </div>
                );
            })}
            </nav>
        </aside>
 
        <main className="plp-main">
            <div className="plp-mobileCats">
            <button
                className={`plp-chip ${selectedCategory === null ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(null)}
            >
                Tüm Ürünler
            </button>
            {categories.map((cat) => (
                <button
                key={cat.id}
                className={`plp-chip ${selectedCategory === cat.id ? "is-active" : ""} ${cat.parentId ? "plp-chip--sub" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                >
                {cat.name}
                </button>
            ))}
            </div>
 
            <div className="plp-toolbar">
            <div>
                <span className="plp-eyebrow">Vitrin</span>
                <h1 className="plp-title">{selectedCategoryName}</h1>
            </div>
            {!loading && <span className="plp-count">{filteredProducts.length} ürün</span>}
            </div>
 
            {error && <p className="plp-error">{error}</p>}
            {cartMessage && (
                <div className="plp-toastWrap">
                    <div className="plp-toast">
                    <span className="plp-toastIcon">✓</span>
                    {cartMessage}
                    </div>
                    <div className="plp-confetti" key={confettiKey}>
                    {Array.from({ length: 14 }).map((_, i) => (
                        <span key={i} className={`plp-confettiPiece plp-confettiPiece--${i % 5}`} />
                    ))}
                    </div>
                </div>
            )}
 

            {loading ? (
            <div className="plp-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                <div className="plp-skeleton" key={i} />
                ))}
            </div>
            ) : filteredProducts.length === 0 ? (
            <div className="plp-empty">
                <p>Bu kategoride henüz ürün yok.</p>
            </div>
            ) : (
            <div className="plp-grid">
                {filteredProducts.map((product, i) => (
                <div
                    key={product.id}
                    className="plp-card"
                    onClick={() => navigate(`/urun/${product.id}`)}
                >
                    <div className={`plp-thumb plp-thumb--${i % 4}`}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                        ) : (
                            <span>{product.name?.charAt(0).toUpperCase()}</span>
                        )}
                        {product.stock <= 0 && <span className="plp-badge">Tükendi</span>}
                        <button 
                            className={`plp-favButton ${isFavorite(product.id) ? "is-active":""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if(!user) {
                                    navigate("/giris");
                                    return;
                                }
                                toggleFavorite(product.id);
                            }}
                            aria-label="Favorilere ekle"
                        >
                            {isFavorite(product.id) ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </div>
                        <div className="plp-cardBody">
                        <h3 className="plp-cardTitle">{product.name}</h3>
                        <p className="plp-cardPrice">{product.price?.toLocaleString("tr-TR")} TL</p>
                        <button
                            className="plp-addButton"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock <= 0}
                        >
                            {product.stock <= 0 ? "Tükendi" : "Sepete Ekle"}
                        </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </main>
        </div>
    );
}
 
export default ProductList;
