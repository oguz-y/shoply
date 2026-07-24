import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import addressService from "../services/addressService";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";
import productService from "../services/productService";
import paymentService from "../services/paymentService";
 
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
 
function getItemName(item) {
  return item.product?.name || "Ürün";
}
function getItemPrice(item) {
  return item.product?.price ?? 0;
}
function getItemImage(item) {
  return item.product?.imageUrl || null;
}
function getItemId(item) {
  return item.id;
}
 
function Cart() {
  const { user , authChecked } = useAuth();
  const navigate = useNavigate();
 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
 
  const loadCart = () => {
    if (!user) {
        navigate("/giris");
        return;
    }
    const userId = getUserIdFromToken(user.token);
    if (!userId) {
        navigate("/giris");
        return;
    }
    setLoading(true);
    cartService
        .getByUser(userId)
        .then((response) => {
        const rawItems = response.data || [];
        Promise.all(
            rawItems.map((item) =>
            productService
                .getById(item.productId)
                .then((res) => ({ ...item, product: res.data }))
                .catch(() => ({ ...item, product: null }))
            )
        ).then((itemsWithProducts) => {
            setItems(itemsWithProducts);
            setLoading(false);
        });
        })
        .catch(() => {
        setError("Sepet yüklenemedi.");
        setLoading(false);
        });
    };

  const loadAddresses = () => {
    if (!user) return;
    const userId = getUserIdFromToken(user.token);
    if (!userId) return;

    setAddressLoading(true);
    addressService
      .getByUser(userId)
      .then((response) => {
        const list = response.data || [];
        setAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        }
        setAddressLoading(false);
      })
      .catch(() => {
        setAddresses([]);
        setAddressLoading(false);
      });
  };
 

  useEffect(() => {
    if(!authChecked) return;
    loadCart();
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
 
  }, [authChecked]);
 
  const handleQuantityChange = (item, delta) => {
    const id = getItemId(item);
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return;
 
    setUpdatingId(id);
    cartService
      .updateQuantity(id, newQty)
      .then(() => {
        setItems((prev) =>
          prev.map((i) =>
            getItemId(i) === id ? { ...i, quantity: newQty } : i
          )
        );
        setUpdatingId(null);
      })
      .catch(() => {
        setError("Adet güncellenemedi.");
        setUpdatingId(null);
      });
  };
 
  const handleRemove = (item) => {
    const id = getItemId(item);
    setUpdatingId(id);
    cartService
      .removeFromCart(id)
      .then(() => {
        setItems((prev) => prev.filter((i) => getItemId(i) !== id));
        setUpdatingId(null);
      })
      .catch(() => {
        setError("Ürün sepetten çıkarılamadı.");
        setUpdatingId(null);
      });
  };

  const handleCheckout = () => {
    setCheckoutError("");

    if (!selectedAddressId) {
      setCheckoutError("Lütfen bir teslimat adresi seçin.");
      return;
    }

    const userId = getUserIdFromToken(user.token);
    setCheckoutLoading(true);

    paymentService
      .initiate({ userId, addressId: selectedAddressId })
      .then((response) => {
        window.location.href = response.data.paymentPageUrl;
      })
      .catch((err) => {
        const message = err.response?.data;
        setCheckoutError(typeof message === "string" ? message : "Ödeme başlatılırken bir sorun oluştu.");
        setCheckoutLoading(false);
      });
};

 
  const total = items.reduce(
    (sum, item) => sum + getItemPrice(item) * (item.quantity || 1),
    0
  );
 
  if (loading) {
    return (
      <div className="ct-shell">
        <div className="ct-skeletonList">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="ct-skeletonRow" key={i} />
          ))}
        </div>
      </div>
    );
  }
 
  return (
    <div className="ct-shell">
      <div className="ct-header">
        <h1 className="ct-title">Sepetim</h1>
        <Link to="/urunler" className="ct-continueLink">
          ← Alışverişe devam et
        </Link>
      </div>
 
      {error && <p className="ct-error">{error}</p>}
 
      {items.length === 0 ? (
        <div className="ct-empty">
          <p>Sepetiniz şu anda boş.</p>
          <Link to="/urunler" className="ct-emptyButton">
            Ürünlere göz at
          </Link>
        </div>
      ) : (
        <div className="ct-layout">
          <div className="ct-list">
            {items.map((item) => {
              const id = getItemId(item);
              const isUpdating = updatingId === id;
              return (
                <div className="ct-row" key={id}>
                  <div className="ct-rowThumb">
                    {getItemImage(item) ? (
                      <img src={getItemImage(item)} alt={getItemName(item)} />
                    ) : (
                      <span>{getItemName(item).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
 
                  <div className="ct-rowInfo">
                    <p className="ct-rowName">{getItemName(item)}</p>
                    <p className="ct-rowPrice">
                      {getItemPrice(item).toLocaleString("tr-TR")} TL
                    </p>
                  </div>
 
                  <div className="ct-rowQty">
                    <button
                      className="ct-qtyButton"
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={isUpdating || (item.quantity || 1) <= 1}
                    >
                      −
                    </button>
                    <span className="ct-qtyValue">{item.quantity || 1}</span>
                    <button
                      className="ct-qtyButton"
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={isUpdating}
                    >
                      +
                    </button>
                  </div>
 
                  <p className="ct-rowSubtotal">
                    {(getItemPrice(item) * (item.quantity || 1)).toLocaleString(
                      "tr-TR"
                    )}{" "}
                    TL
                  </p>
 
                  <button
                    className="ct-removeButton"
                    onClick={() => handleRemove(item)}
                    disabled={isUpdating}
                    aria-label="Ürünü kaldır"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
 
          <div className="ct-summary">
            <h2 className="ct-summaryTitle">Sipariş Özeti</h2>

            <div className="ct-addressSection">
              <label className="ct-addressLabel">Teslimat Adresi</label>
              {addressLoading ? (
                <p className="ct-addressLoading">Adresler yükleniyor...</p>
              ) : addresses.length === 0 ? (
                <div className="ct-addressEmpty">
                  <p>Kayıtlı adresiniz yok.</p>
                  <Link to="/profilim" className="ct-addressAddLink">
                    + Adres Ekle
                  </Link>
                </div>
              ) : (
                <select
                  className="ct-addressSelect"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.title || "Adres"} — {addr.fullAddress}
                      {addr.district ? `, ${addr.district}` : ""}
                      {addr.city ? ` / ${addr.city}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="ct-summaryRow">
              <span>Ara Toplam</span>
              <span>{total.toLocaleString("tr-TR")} TL</span>
            </div>
            <div className="ct-summaryRow">
              <span>Kargo</span>
              <span className="ct-freeShip">Ücretsiz</span>
            </div>
            <div className="ct-summaryDivider" />
            <div className="ct-summaryRow ct-summaryTotal">
              <span>Toplam</span>
              <span>{total.toLocaleString("tr-TR")} TL</span>
            </div>

            {checkoutError && <p className="ct-checkoutError">{checkoutError}</p>}

            <button
              className="ct-checkoutButton"
              onClick={handleCheckout}
              disabled={checkoutLoading || addresses.length === 0}
            >
              {checkoutLoading ? "Yönlendiriliyor..." : "Ödemeye Geç"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default Cart;
