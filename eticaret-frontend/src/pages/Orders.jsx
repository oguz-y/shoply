import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";
import productService from "../services/productService";

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

function getOrderId(order) {
  return order.id;
}
function getOrderDate(order) {
  const raw = order.createdAt || order.orderDate || order.date;
  if (!raw) return "";
  return new Date(raw).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function getOrderTotal(order) {
  return order.totalPrice ?? order.total ?? 0;
}
function getOrderStatus(order) {
  return order.status || "Beklemede";
}
function getOrderItems(detail) {
  return detail?.items || [];
}
function getItemName(item) {
  return item.product?.name || "Ürün";
}
function getItemQty(item) {
  return item.quantity || 1;
}
function getItemPrice(item) {
  return item.product?.price ?? item.priceAtPurchase ?? 0;
}

const statusStyles = {
  pending: "or-badge--pending",
  processing: "or-badge--processing",
  shipped: "or-badge--shipped",
  delivered: "or-badge--delivered",
  cancelled: "or-badge--cancelled",
};

const statusLabels = {
  pending: "Beklemede",
  processing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
};

function Orders() {
  const { user , authChecked } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if(!authChecked) return;
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
    orderService
      .getByUser(userId)
      .then((res) => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Siparişler yüklenemedi.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  const toggleExpand = (order) => {
  const id = getOrderId(order);
  if (expandedId === id) {
    setExpandedId(null);
    return;
  }
  setExpandedId(id);

  if (!detailCache[id]) {
    setDetailLoading(id);
    orderService
      .getDetail(id)
      .then((res) => {
        const rawItems = res.data?.items || [];
        Promise.all(
          rawItems.map((item) =>
            productService
              .getById(item.productId)
              .then((r) => ({ ...item, product: r.data }))
              .catch(() => ({ ...item, product: null }))
          )
        ).then((itemsWithProducts) => {
          setDetailCache((prev) => ({
            ...prev,
            [id]: { items: itemsWithProducts },
          }));
          setDetailLoading(null);
        });
      })
      .catch(() => setDetailLoading(null));
  }
};


  if (loading) {
    return (
      <div className="or-shell">
        <h1 className="or-title">Siparişlerim</h1>
        <div className="or-skeletonList">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="or-skeletonRow" key={i} />
          ))}
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
const activeCount = orders.filter((o) => {
  const s = getOrderStatus(o);
  return s !== "Teslim" && s !== "Teslim Edildi" && s !== "İptal";
}).length;

const filteredOrders =
  statusFilter === "all"
    ? orders
    : orders.filter((o) => getOrderStatus(o) === statusFilter);

const availableStatuses = [...new Set(orders.map((o) => getOrderStatus(o)))];

return (
  <div className="or-shell">
    <h1 className="or-title">Siparişlerim</h1>

    {error && <p className="or-error">{error}</p>}

    {orders.length === 0 ? (
      <div className="or-empty">
        <p>Henüz siparişiniz yok.</p>
        <button className="or-emptyButton" onClick={() => navigate("/urunler")}>
          Alışverişe Başla
        </button>
      </div>
    ) : (
      <>
        <div className="or-stats">
          <div className="or-statCard">
            <span className="or-statIcon">📦</span>
            <div>
              <p className="or-statValue">{orders.length}</p>
              <p className="or-statLabel">Toplam Sipariş</p>
            </div>
          </div>
          <div className="or-statCard">
            <span className="or-statIcon">🚚</span>
            <div>
              <p className="or-statValue">{activeCount}</p>
              <p className="or-statLabel">Aktif Sipariş</p>
            </div>
          </div>
          <div className="or-statCard">
            <span className="or-statIcon">💳</span>
            <div>
              <p className="or-statValue">{totalSpent.toLocaleString("tr-TR")} TL</p>
              <p className="or-statLabel">Toplam Harcama</p>
            </div>
          </div>
        </div>

        {availableStatuses.length > 1 && (
          <div className="or-filterRow">
            <button
              className={`or-filterChip ${statusFilter === "all" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              Tümü
            </button>
            {availableStatuses.map((s) => (
              <button
                key={s}
                className={`or-filterChip ${statusFilter === s ? "is-active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="or-list">
          {filteredOrders.map((order) => {
            const id = getOrderId(order);
            const isOpen = expandedId === id;
            const status = getOrderStatus(order);
            const items  = getOrderItems(detailCache[id]);
            const itemCount = items.length || getOrderItems(detailCache[id] || {}).length;

            return (
              <div className="or-card" key={id}>
                <div className="or-cardHeader" onClick={() => toggleExpand(order)}>
                  <div className="or-cardIcon">📦</div>
                  <div className="or-cardMain">
                    <p className="or-orderNo">Sipariş #{id.slice(0, 8)}</p>
                    <p className="or-orderDate">{getOrderDate(order)}</p>
                  </div>
                  <span className={`or-badge ${statusStyles[status] || "or-badge--pending"}`}>
                    {statusLabels[status] || status}
                  </span>
                  <p className="or-orderTotal">
                    {getOrderTotal(order).toLocaleString("tr-TR")} TL
                  </p>
                  <span className={`or-chevron ${isOpen ? "or-chevron--open" : ""}`}>
                    ▾
                  </span>
                </div>

                {isOpen && (
                  <div className="or-cardBody">
                    {detailLoading === id ? (
                      <p className="or-detailLoading">Yükleniyor...</p>
                    ) : items.length === 0 ? (
                      <p className="or-detailLoading">Ürün bilgisi bulunamadı.</p>
                    ) : (
                      <>
                        {items.map((item, idx) => (
                          <div className="or-item" key={idx}>
                            <div className="or-itemThumb">
                                {item.product?.imageUrl ? (
                                <img src={item.product.imageUrl} alt={getItemName(item)} />
                                ) : (
                                getItemName(item).charAt(0).toUpperCase()
                                )}
                            </div>
                            <span className="or-itemName">{getItemName(item)}</span>
                            <span className="or-itemQty">{getItemQty(item)} adet</span>
                            <span className="or-itemPrice">
                                {getItemPrice(item).toLocaleString("tr-TR")} TL
                            </span>
                            </div>

                        ))}
                        <div className="or-itemsFooter">
                          <span>{itemCount} ürün</span>
                          <span className="or-itemsFooterTotal">
                            Toplam: {getOrderTotal(order).toLocaleString("tr-TR")} TL
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
);

}

export default Orders;
