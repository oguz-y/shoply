import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoriteContext";
 
 
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
 
function getEmailFromToken(token) {
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      payload.email ||
      ""
    );
  } catch {
    return "";
  }
}
 
function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { items, openCartWithRefresh } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const { favoriteIds } = useFavorites();
  const favoriteCount = favoriteIds.size;
  const [favBump, setFavBump] = useState(false);
  const prevFavCount = useRef(favoriteCount);

  useEffect(() => {
    if(favoriteCount > prevFavCount.current) {
      setFavBump(true);
      const timer = setTimeout(() => setFavBump(false),400);
      return() => clearTimeout(timer);
    }
    prevFavCount.current = favoriteCount;
  }, [favoriteCount]);
 
  const [searchValue, setSearchValue] = useState("");
 
  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
 
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    navigate(`/urunler?q=${encodeURIComponent(value)}`, { replace: true });
  };
 
  const email = getEmailFromToken(user?.token);
  const initial = email ? email.charAt(0).toUpperCase() : "?";
 
  useEffect(() => {
    if (user) {
      const userId = getUserIdFromToken(user.token);
      if (userId) {
        openCartWithRefresh(userId, { silent: true });
      }
    }
  }, [user]);
 
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/giris");
  };
 
  const handleCartClick = () => {
    if (user) {
      const userId = getUserIdFromToken(user.token);
      if (userId) openCartWithRefresh(userId);
    } else {
      navigate("/sepet");
    }
  };
 
  return (
    <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
      <Link to="/" style={styles.logoLink}>
        <span style={styles.logoIcon}>◆</span>
        Shoply
      </Link>
     
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>⌕</span>
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchValue}
          onChange={handleSearchChange}
          style={styles.navSearch}
        />
      </div>
 
      {user ? (
        <div style={styles.rightGroup}>
          {isAdmin && (
            <Link to="/admin" style={styles.adminButton}>
              <span style={styles.adminIcon}>⚙</span>
              Admin Paneli
            </Link>
          )}

          <Link 
            to="/favorilerim" 
            style={{
              ...styles.favButton,
              transform: favBump ? "scale(1.25)" :"scale(1)",
            }}
          >
            <span style= {styles.favIconFilled}>❤︎⁠</span>
            {favoriteCount > 0 && (
              <span style={styles.favBadge}>{favoriteCount > 99 ? "99+": favoriteCount}</span>
            )}
          </Link>

          <button onClick={handleCartClick} style={styles.cartButton}>
            <span style={styles.cartIcon}>🛒</span>
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </button>
 
          <div style={styles.accountWrap} ref={menuRef}>
            <button style={styles.accountButton} onClick={() => setMenuOpen((v) => !v)}>
              <span style={styles.avatarSmall}>{initial}</span>
              <span style={styles.chevron}>{menuOpen ? "▴" : "▾"}</span>
            </button>
 
            {menuOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.avatar}>{initial}</div>
                  <div style={styles.dropdownEmail}>{email || "Kullanıcı"}</div>
                </div>
                <div style={styles.divider} />
                <Link to="/profilim" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  👤 Profilim
                </Link>
                <Link to="/siparislerim" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  📦 Siparişlerim
                </Link>
                <div style={styles.divider} />
                <button onClick={handleLogout} style={styles.dropdownLogoutItem}>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={styles.rightGroup}>
          <button onClick={handleCartClick} style={styles.cartButton}>
            <span style={styles.cartIcon}>🛒</span>
          </button>
          <Link to="/giris" style={styles.link}>Giriş Yap</Link>
          <Link to="/kayit" style={styles.primaryLink}>Kayıt Ol</Link>
        </div>
      )}
    </nav>
  );
}
 
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 32px",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(20,38,28,0.08)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    transition: "box-shadow 0.2s ease, background 0.2s ease",
  },
  navbarScrolled: {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    background: "rgba(255, 255, 255, 0.95)",
  },
 
  logoIcon: {
    fontSize: "18px",
    marginRight: "2px",
  },
 
  searchWrap: {
    flex: 1,
    maxWidth: "420px",
    margin: "0 auto",
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
 
  searchIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "14px",
    color: "rgba(20,38,28,0.4)",
    pointerEvents: "none",
  },
 
  navSearch: {
    width: "100%",
    padding: "9px 16px 9px 34px",
    borderRadius: "999px",
    border: "1px solid rgba(20,38,28,0.15)",
    fontSize: "13.5px",
    fontFamily: "'Inter' , sans-serif",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
 
  link: {
    color: "#2d2d44",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    padding: "8px 4px",
  },
  primaryLink: {
    color: "#ffffff",
    background: "linear-gradient(90deg, #e8542e, #f3894f)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    padding: "9px 18px",
    borderRadius: "999px",
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    textDecoration: "none",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: "32px",
    letterSpacing: "-0.02em",
    background: "linear-gradient(90deg, #e8542e, #f3894f)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  rightGroup: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
 
  adminButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #33416f, #1e294a)",
    color: "#ffffff",
    fontSize: "13.5px",
    fontWeight: 600,
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(51, 65, 111, 0.25)",
    transition: "transform 0.15s ease",
  },
  adminIcon: {
    fontSize: "14px",
  },
 
  cartButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(20,38,28,0.12)",
    background: "rgba(20,38,28,0.03)",
    cursor: "pointer",
    fontSize: "16px",
  },
  cartIcon: {
    lineHeight: 1,
  },
  cartBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    minWidth: "18px",
    height: "18px",
    padding: "0 4px",
    borderRadius: "999px",
    background: "#e8542e",
    color: "#fff",
    fontSize: "10.5px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  favButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(230, 57, 70, 0.15)",
    background: "rgba(230, 57, 70, 0.04)",
    textDecoration: "none",
    transition: "transform 0.2s ease",
},
favIconFilled: {
    fontSize: "17px",
    color: "#e63946",
    lineHeight: 1,
},
favBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    minWidth: "18px",
    height: "18px",
    padding: "0 4px",
    borderRadius: "999px",
    background: "#e8542e",
    color: "#fff",
    fontSize: "10.5px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
},

  accountWrap: {
    position: "relative",
  },
  accountButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  avatarSmall: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8542e, #f3894f)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "13px",
  },
  chevron: {
    fontSize: "10px",
    color: "#2d2d44",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: "220px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.22)",
    overflow: "hidden",
    zIndex: 100,
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8542e, #f3894f)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "14px",
    flexShrink: 0,
  },
  dropdownEmail: {
    fontSize: "13px",
    color: "#14261c",
    wordBreak: "break-all",
  },
  divider: {
    height: "1px",
    background: "#ece4d3",
    margin: "4px 0",
  },
  dropdownItem: {
    display: "block",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#14261c",
    textDecoration: "none",
  },
  dropdownLogoutItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#c0392b",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};
 
export default Navbar;
