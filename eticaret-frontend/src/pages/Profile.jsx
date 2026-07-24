import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import addressService from "../services/addressService";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

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

const emptyForm = { title: "", city: "", district: "", neighborhood: "", fullAddress: "", postalCode: "" };

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");


  const userId = user ? getUserIdFromToken(user.token) : null;

  const loadAddresses = () => {
    if (!userId) return;
    addressService
      .getByUser(userId)
      .then((res) => setAddresses(res.data || []))
      .catch(() => setAddresses([]));
  };

  //***İL ÇEKME***

  useEffect(() => {
    fetch("https://api.turkiyeapi.com/api/iller")
      .then((res) => res.json())
      .then((res) => setProvinces(res.data || []))
      .catch(() => setProvinces([]));
  }, []);

  //*************** 
  useEffect(() => {
    if (!user) {
      navigate("/giris");
      return;
    }

    setLoading(true);
    authService
      .getProfile()
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setProfile({ email: getEmailFromToken(user.token) });
        setLoading(false);
      });

    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  //***********API'dan ilin tkgmId'si ile ilçeleri çekiyoruz***********************************

    const handleProvinceChange = (tkgmId,label) => {
      setSelectedProvinceId(tkgmId);
      setSelectedDistrictId("");
      setDistricts([]);
      setNeighborhoods([]);
      handleFormChange("city", label);
      handleFormChange("district", "");

      if(!tkgmId) return;
      fetch(`https://api.turkiyeapi.com/api/ilceler/${tkgmId}`)
        .then((res) => res.json())
        .then((res) => setDistricts(res.data || []))
        .catch(() => setDistricts([]));
    };
  //*********************************************************************************************

  //***********API'dan district'in tkgmId'si ile mahalleleri çekiyoruz***************************

  const handleDistrictChange = (tkgmId,label) => {
    setSelectedDistrictId(tkgmId);
    setNeighborhoods([]);
    handleFormChange("district",label);

    if(!tkgmId) return;
    fetch(`https://api.turkiyeapi.com/api/mahalleler/${tkgmId}`)
      .then((res) => res.json())
      .then((res) => setNeighborhoods(res.data || []))
      .catch(() => setNeighborhoods([]));
  };
  //**********************************************************************************************

  //**************************Seçilen mahalle adını forma yazıyoruz******************************* 

  const handleNeighborhoodChange = (label) => {
    handleFormChange("neighborhood", label);
  };
  //********************************************************************************************** 

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    setForm({
      title: addr.title || "",
      city: addr.city || "",
      district: addr.district || "",
      fullAddress: addr.fullAddress || "",
      postalCode: addr.postalCode || "",
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, userId };
    const request = editingId
      ? addressService.update(editingId, payload)
      : addressService.create(payload);

    request
      .then(() => {
        setSaving(false);
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        loadAddresses();
      })
      .catch(() => {
        setError("Adres kaydedilemedi.");
        setSaving(false);
      });
  };

  const handleDeleteAddress = (id) => {
    addressService
      .delete(id)
      .then(() => loadAddresses())
      .catch(() => setError("Adres silinemedi."));
  };

  const handleLogout = () => {
    logout();
    navigate("/giris");
  };

  if (loading) {
    return (
      <div className="pf-shell">
        <div className="pf-skeleton" />
      </div>
    );
  }

  const displayName = profile?.name || profile?.fullName || "Kullanıcı";
  const displayEmail = profile?.email || getEmailFromToken(user?.token);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="pf-shell">
      <div className="pf-header">
        <div className="pf-avatar">{initial}</div>
        <div className="pf-headerInfo">
          <h1 className="pf-name">{displayName}</h1>
          <p className="pf-email">{displayEmail}</p>
        </div>
        <button className="pf-logoutButton" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>

      {error && <p className="pf-error">{error}</p>}

      <div className="pf-section">
        <div className="pf-sectionHeader">
          <h2 className="pf-sectionTitle">Adreslerim</h2>
          <button className="pf-addButton" onClick={openNewForm}>
            + Yeni Adres
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="pf-empty">
            <p>Henüz kayıtlı adresiniz yok.</p>
          </div>
        ) : (
          <div className="pf-addressGrid">
            {addresses.map((addr) => (
              <div className="pf-addressCard" key={addr.id}>
                <p className="pf-addressTitle">{addr.title || "Adres"}</p>
                <p className="pf-addressText">
                  {addr.fullAddress}
                  {addr.district ? `, ${addr.district}` : ""}
                  {addr.city ? ` / ${addr.city}` : ""}
                </p>
                {addr.postalCode && (
                  <p className="pf-addressMeta">Posta Kodu: {addr.postalCode}</p>
                )}
                <div className="pf-addressActions">
                  <button onClick={() => openEditForm(addr)}>Düzenle</button>
                  <button
                    className="pf-deleteLink"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="pf-overlay" onClick={() => setShowForm(false)}>
          <form
            className="pf-formCard"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveAddress}
          >
            <h3 className="pf-formTitle">
              {editingId ? "Adresi Düzenle" : "Yeni Adres"}
            </h3>

            <label className="pf-label">
              Başlık
              <input
                className="pf-input"
                value={form.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="Ev, İş..."
                required
              />
            </label>

            <label className="pf-label">
              Şehir
              <select
                className="pf-input"
                value={selectedProvinceId}
                onChange={(e) => {
                  const tkgmId = e.target.value;
                  const label = provinces.find((p) => p.tkgm_id === tkgmId)?.label || "";
                  handleProvinceChange(tkgmId, label);
                }}
                required
              >
                <option value="">Seçiniz</option>
                {provinces.map((p) => (
                  <option key={p.tkgm_id} value={p.tkgm_id}>{p.label}</option>
                ))}
              </select>
            </label>

            <label className="pf-label">
              İlçe
              <select
                className="pf-input"
                value={selectedDistrictId}
                onChange={(e) => {
                  const tkgmId = e.target.value;
                  const label = districts.find((d) => d.tkgm_id === tkgmId)?.label || "";
                  handleDistrictChange(tkgmId, label);
                }}
                disabled={!selectedProvinceId}
              >
                <option value="">Seçiniz</option>
                {districts.map((d) => (
                  <option key={d.tkgm_id} value={d.tkgm_id}>{d.label}</option>
                ))}
              </select>
            </label>

            <label className="pf-label">
              Mahalle
              <select
                className="pf-input"
                value={form.neighborhood}
                onChange={(e) => handleNeighborhoodChange(e.target.value)}
                disabled={!selectedDistrictId}
              >
                <option value="">Seçiniz</option>
                {neighborhoods.map((n) => (
                  <option key={n.tkgm_id} value={n.label}>{n.label}</option>
                ))}
              </select>
            </label>


            <label className="pf-label">
              Adres
              <textarea
                className="pf-textarea"
                value={form.fullAddress}
                onChange={(e) => handleFormChange("fullAddress", e.target.value)}
                required
              />
            </label>

            <label className="pf-label">
              Posta Kodu
              <input
                className="pf-input"
                type ="text"
                inputMode = "numeric"
                value={form.postalCode}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g,"").slice(0, 5);
                  handleFormChange("postalCode", digitsOnly);
                }}
                placeholder= "Örn: 34000"
              />
            </label>

            <div className="pf-formActions">
              <button
                type="button"
                className="pf-cancelButton"
                onClick={() => setShowForm(false)}
              >
                Vazgeç
              </button>
              <button type="submit" className="pf-saveButton" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
