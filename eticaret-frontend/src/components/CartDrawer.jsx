import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./CartDrawer.css";

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

function CartDrawer() {
  const { isOpen, items, loading, closeCart, updateItemQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itemErrors, setItemErrors] = useState({});
  const [busyItemId, setBusyItemId] = useState(null);

  // Optimistic local miktarlar: { [itemId]: number }
  const [localQuantities, setLocalQuantities] = useState({});
  const debounceTimers = useRef({});

  // items context'ten değişince local override'ları temizle
  useEffect(() => {
    setLocalQuantities({});
  }, [items]);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  if (!isOpen) return null;

  // Savunmacı: items her zaman dizi olsun
  const safeItems = Array.isArray(items) ? items : [];

  const userId = getUserIdFromToken(user?.token);

  const getDisplayQuantity = (item) =>
    localQuantities[item.id] ?? item.quantity;

  const total = safeItems.reduce(
    (sum, item) =>
      sum + (item.product?.price ?? 0) * (getDisplayQuantity(item) || 1),
    0
  );

  const clearItemError = (itemId) => {
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const sendQuantityUpdate = (item, newQuantity) => {
    setBusyItemId(item.id);
    updateItemQuantity(item.id, newQuantity, userId)
      .catch((error) => {
        const message = error.response?.data;
        setItemErrors((prev) => ({
          ...prev,
          [item.id]:
            typeof message === "string" && message
              ? message
              : "Miktar güncellenirken bir sorun oluştu.",
        }));
        // Başarısız oldu, local optimistic değeri geri al
        setLocalQuantities((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      })
      .finally(() => setBusyItemId(null));
  };

  const handleQuantityChange = (item, newQuantity) => {
    clearItemError(item.id);

    if (newQuantity < 1) {
      handleRemove(item.id);
      return;
    }

    // Stok sınırını client tarafında da uygula — API'ye sormadan engelle
    const stock = item.product?.stock;
    if (typeof stock === "number" && newQuantity > stock) {
      setItemErrors((prev) => ({
        ...prev,
        [item.id]: `Bu üründen en fazla ${stock} adet sepete ekleyebilirsiniz.`,
      }));
      // Miktarı stok sınırında sabitle
      setLocalQuantities((prev) => ({ ...prev, [item.id]: stock }));

      // Zaten stok kadarsa API'ye gitmeye gerek yok
      if (item.quantity === stock) return;

      if (debounceTimers.current[item.id]) {
        clearTimeout(debounceTimers.current[item.id]);
      }
      debounceTimers.current[item.id] = setTimeout(() => {
        sendQuantityUpdate(item, stock);
      }, 400);
      return;
    }

    // 1) UI'da anında göster (optimistic)
    setLocalQuantities((prev) => ({ ...prev, [item.id]: newQuantity }));

    // 2) API çağrısını debounce'la — kullanıcı tıklamayı bırakınca tek istek gitsin
    if (debounceTimers.current[item.id]) {
      clearTimeout(debounceTimers.current[item.id]);
    }
    debounceTimers.current[item.id] = setTimeout(() => {
      sendQuantityUpdate(item, newQuantity);
    }, 400);
  };

  const handleRemove = (itemId) => {
    clearItemError(itemId);
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId]);
    }
    setBusyItemId(itemId);
    removeItem(itemId, userId).finally(() => setBusyItemId(null));
  };

  return (
    <>
      <div className="cd-overlay" onClick={closeCart} />
      <div className="cd-panel">
        <div className="cd-header">
          <h3 className="cd-title">Sepetim</h3>
          <button className="cd-close" onClick={closeCart}>
            ✕
          </button>
        </div>

        <div className="cd-body">
          {loading ? (
            <p className="cd-loading">Yükleniyor...</p>
          ) : safeItems.length === 0 ? (
            <p className="cd-empty">Sepetiniz boş.</p>
          ) : (
            safeItems.map((item) => {
              const displayQuantity = getDisplayQuantity(item);
              const stock = item.product?.stock;
              const atStockLimit =
                typeof stock === "number" && displayQuantity >= stock;

              return (
                <div className="cd-item" key={item.id}>
                  <div className="cd-itemThumb">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product?.name} />
                    ) : (
                      <span>{item.product?.name?.charAt(0).toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div className="cd-itemInfo">
                    <p className="cd-itemName">{item.product?.name || "Ürün"}</p>
                    <p className="cd-itemMeta">
                      {(item.product?.price ?? 0).toLocaleString("tr-TR")} TL
                    </p>

                    <div className="cd-qtyRow">
                      <button
                        className="cd-qtyButton"
                        disabled={busyItemId === item.id}
                        onClick={() =>
                          handleQuantityChange(item, displayQuantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="cd-qtyValue">{displayQuantity}</span>
                      <button
                        className="cd-qtyButton"
                        disabled={busyItemId === item.id || atStockLimit}
                        onClick={() =>
                          handleQuantityChange(item, displayQuantity + 1)
                        }
                      >
                        +
                      </button>

                      <button
                        className="cd-removeButton"
                        disabled={busyItemId === item.id}
                        onClick={() => handleRemove(item.id)}
                      >
                        Kaldır
                      </button>
                    </div>

                    {itemErrors[item.id] && (
                      <p className="cd-itemError">{itemErrors[item.id]}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {safeItems.length > 0 && (
          <div className="cd-footer">
            <div className="cd-total">
              <span>Toplam</span>
              <span>{total.toLocaleString("tr-TR")} TL</span>
            </div>
            <button
              className="cd-viewCartButton"
              onClick={() => {
                closeCart();
                navigate("/sepet");
              }}
            >
              Sepeti Onayla
            </button>
            <button
              className="cd-checkoutButton"
              onClick={() => {
                closeCart();
                navigate("/sepet");
              }}
            >
              Ödemeye Git
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
