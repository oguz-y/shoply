import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

const emptyCategoryForm = { name: "", description: "", parentId: "" };
const emptyProductForm = { categoryId: "", name: "", description: "", price: "", stock: "", imageUrl: "" };

function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("products");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([categoryService.getAllForAdmin(), productService.getAllForAdmin()])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Veriler yüklenemedi.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAll();
  }, []);

  const mainCategories = categories.filter((c) => !c.parentId);
  const getSubCategories = (parentId) => categories.filter((c) => c.parentId === parentId);
  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "—";

  // ----- Kategori işlemleri -----
  const openNewCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setShowCategoryForm(true);
  };

  const openEditCategoryForm = (cat) => {
    setCategoryForm({
      name: cat.name || "",
      description: cat.description || "",
      parentId: cat.parentId || "",
    });
    setEditingCategoryId(cat.id);
    setShowCategoryForm(true);
  };

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: categoryForm.name,
      description: categoryForm.description || null,
      parentId: categoryForm.parentId || null,
    };

    const request = editingCategoryId
      ? categoryService.update(editingCategoryId, payload)
      : categoryService.create(payload);

    request
      .then(() => {
        setSaving(false);
        setShowCategoryForm(false);
        loadAll();
      })
      .catch((err) => {
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Kategori kaydedilemedi.");
        setSaving(false);
      });
  };

  const handleDeleteCategory = (id) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    categoryService
      .delete(id)
      .then(() => loadAll())
      .catch((err) => {
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Kategori silinemedi.");
      });
  };

  const handleToggleCategoryActive = (id) => {
    categoryService
      .toggleActive(id)
      .then(() => loadAll())
      .catch((err) => {
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Kategori durumu değiştirilemedi.");
      });
  };

  // ----- Ürün işlemleri -----
  const openNewProductForm = () => {
    setProductForm(emptyProductForm);
    setEditingProductId(null);
    setShowProductForm(true);
  };

  const openEditProductForm = (product) => {
    setProductForm({
      categoryId: product.categoryId || "",
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      imageUrl: product.imageUrl || "",
    });
    setEditingProductId(product.id);
    setShowProductForm(true);
  };

  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      categoryId: productForm.categoryId,
      name: productForm.name,
      description: productForm.description || null,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      imageUrl: productForm.imageUrl || null,
    };

    const request = editingProductId
      ? productService.update(editingProductId, payload)
      : productService.create(payload);

    request
      .then(() => {
        setSaving(false);
        setShowProductForm(false);
        loadAll();
      })
      .catch((err) => {
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Ürün kaydedilemedi.");
        setSaving(false);
      });
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    productService
      .delete(id)
      .then(() => loadAll())
      .catch((err) => {
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Ürün silinemedi.");
      });
  };

  const handleToggleProductActive = (id) => {
    productService
      .toggleActive(id)
      .then(() => loadAll())
      .catch((err) => {
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Ürün durumu değiştirilemedi.");
      });
  };

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">Yönetim Paneli</span>
          <h1 className="admin-title">Shoply Admin</h1>
        </div>
        <div className="admin-headerActions">
          <button className="admin-backButton" onClick={() => navigate("/")}>
            Siteye Dön
          </button>
          <button className="admin-logoutButton" onClick={() => { logout(); navigate("/giris"); }}>
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "products" ? "is-active" : ""}`}
          onClick={() => setTab("products")}
        >
          Ürünler ({products.length})
        </button>
        <button
          className={`admin-tab ${tab === "categories" ? "is-active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Kategoriler ({categories.length})
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">Yükleniyor...</p>
      ) : tab === "products" ? (
        <div className="admin-section">
          <div className="admin-sectionHeader">
            <h2>Ürünler</h2>
            <button className="admin-addButton" onClick={openNewProductForm}>
              + Yeni Ürün
            </button>
          </div>

          <div className="admin-tableWrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Ad</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={!p.isActive ? "admin-row--inactive" : ""}>
                    <td>
                      <div className="admin-thumb">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span>{p.name?.charAt(0)}</span>}
                      </div>
                    </td>
                    <td>{p.name}</td>
                    <td>{getCategoryName(p.categoryId)}</td>
                    <td>{p.price?.toLocaleString("tr-TR")} TL</td>
                    <td>{p.stock}</td>
                    <td>
                      <button
                        type="button"
                        className={`admin-toggle ${p.isActive ? "is-on" : ""}`}
                        onClick={() => handleToggleProductActive(p.id)}
                        aria-label={p.isActive ? "Pasife al" : "Aktife al"}
                      >
                        <span className="admin-toggleKnob" />
                      </button>
                    </td>
                    <td className="admin-actionsCell">
                      <button onClick={() => openEditProductForm(p)}>Düzenle</button>
                      <button className="admin-deleteLink" onClick={() => handleDeleteProduct(p.id)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      ) : (
        <div className="admin-section">
          <div className="admin-sectionHeader">
            <h2>Kategoriler</h2>
            <button className="admin-addButton" onClick={openNewCategoryForm}>
              + Yeni Kategori
            </button>
          </div>

          <div className="admin-categoryTree">
            {mainCategories.map((cat) => (
              <div key={cat.id} className="admin-categoryGroup">
                <div className={`admin-categoryRow ${!cat.isActive ? "admin-row--inactive" : ""}`}>
                  <span className="admin-categoryName">{cat.name}</span>
                  <div className="admin-actionsCell">
                    <button
                      type="button"
                      className={`admin-toggle ${cat.isActive ? "is-on" : ""}`}
                      onClick={() => handleToggleCategoryActive(cat.id)}
                      aria-label={cat.isActive ? "Pasife al" : "Aktife al"}
                    >
                      <span className="admin-toggleKnob" />
                    </button>
                    <button onClick={() => openEditCategoryForm(cat)}>Düzenle</button>
                    <button className="admin-deleteLink" onClick={() => handleDeleteCategory(cat.id)}>
                      Sil
                    </button>
                  </div>
                </div>

                {getSubCategories(cat.id).map((sub) => (
                  <div key={sub.id} className={`admin-categoryRow admin-categoryRow--sub ${!sub.isActive ? "admin-row--inactive" : ""}`}>
                    <span className="admin-categoryName">↳ {sub.name}</span>
                    <div className="admin-actionsCell">
                      <button
                        type="button"
                        className={`admin-toggle ${sub.isActive ? "is-on" : ""}`}
                        onClick={() => handleToggleCategoryActive(sub.id)}
                        aria-label={sub.isActive ? "Pasife al" : "Aktife al"}
                      >
                        <span className="admin-toggleKnob" />
                      </button>
                      <button onClick={() => openEditCategoryForm(sub)}>Düzenle</button>
                      <button className="admin-deleteLink" onClick={() => handleDeleteCategory(sub.id)}>
                        Sil
                      </button>
                    </div>
                  </div>

                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="admin-overlay" onClick={() => setShowCategoryForm(false)}>
          <form className="admin-formCard" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveCategory}>
            <h3>{editingCategoryId ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h3>

            <label className="admin-label">
              Ad
              <input
                className="admin-input"
                value={categoryForm.name}
                onChange={(e) => handleCategoryFormChange("name", e.target.value)}
                required
              />
            </label>

            <label className="admin-label">
              Açıklama
              <textarea
                className="admin-textarea"
                value={categoryForm.description}
                onChange={(e) => handleCategoryFormChange("description", e.target.value)}
              />
            </label>

            <label className="admin-label">
              Üst Kategori (opsiyonel)
              <select
                className="admin-input"
                value={categoryForm.parentId}
                onChange={(e) => handleCategoryFormChange("parentId", e.target.value)}
              >
                <option value="">— Ana kategori —</option>
                {mainCategories
                  .filter((c) => c.id !== editingCategoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>

            <div className="admin-formActions">
              <button type="button" className="admin-cancelButton" onClick={() => setShowCategoryForm(false)}>
                Vazgeç
              </button>
              <button type="submit" className="admin-saveButton" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showProductForm && (
        <div className="admin-overlay" onClick={() => setShowProductForm(false)}>
          <form className="admin-formCard" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveProduct}>
            <h3>{editingProductId ? "Ürünü Düzenle" : "Yeni Ürün"}</h3>

            <label className="admin-label">
              Kategori
              <select
                className="admin-input"
                value={productForm.categoryId}
                onChange={(e) => handleProductFormChange("categoryId", e.target.value)}
                required
              >
                <option value="">— Kategori seçin —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? `↳ ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-label">
              Ürün Adı
              <input
                className="admin-input"
                value={productForm.name}
                onChange={(e) => handleProductFormChange("name", e.target.value)}
                required
              />
            </label>

            <label className="admin-label">
              Açıklama
              <textarea
                className="admin-textarea"
                value={productForm.description}
                onChange={(e) => handleProductFormChange("description", e.target.value)}
              />
            </label>

            <div className="admin-formRow">
              <label className="admin-label">
                Fiyat (TL)
                <input
                  className="admin-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => handleProductFormChange("price", e.target.value)}
                  required
                />
              </label>

              <label className="admin-label">
                Stok
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => handleProductFormChange("stock", e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="admin-label">
              Görsel URL
              <input
                className="admin-input"
                value={productForm.imageUrl}
                onChange={(e) => handleProductFormChange("imageUrl", e.target.value)}
                placeholder="https://..."
              />
            </label>

            <div className="admin-formActions">
              <button type="button" className="admin-cancelButton" onClick={() => setShowProductForm(false)}>
                Vazgeç
              </button>
              <button type="submit" className="admin-saveButton" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Admin;
